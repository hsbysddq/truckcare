// Simulasi GPS — service utama.
// Tiap ANTAR_INTERVAL_DETIK, hitung posisi 10 truk & kirim ke Supabase (tabel positions).
// Menit perjalanan berjalan lebih cepat dari waktu nyata (1 menit simulasi = 1 detik nyata),
// supaya truk terlihat bergerak di peta dalam hitungan menit, bukan jam.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { RUTE } from './rute.js';
import { posisiDiMenit, progressTrip, statusTruk } from './inti.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Isi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di simulasi/.env');
  process.exit(1);
}

const supabase = createClient(url, key);

const JUMLAH_TRUK = parseInt(process.env.ANTAR_JUMLAH_TRUK || '15', 10);
const INTERVAL_DETIK = parseFloat(process.env.ANTAR_INTERVAL_DETIK || '3');
const KECEPATAN_KMJ = parseFloat(process.env.ANTAR_KECEPATAN_KMJ || '45');
// skala: 1 menit perjalanan = 1 detik nyata
const MENIT_PER_DETIK = 1;
// positions ~10 baris tiap 3 detik (±280 ribu/hari): hapus yang lebih tua dari
// retensi tiap ~5 menit (100 tick). Dashboard hanya baca posisi terbaru.
const RETENSI_HARI = parseFloat(process.env.ANTAR_RETENSI_HARI || '3');
let tick = 0;

// state per truk
// rute.js menyimpan waypoint sebagai array [lat, lon, label, tiba_menit],
// ubah ke objek sekali di sini karena inti.js membaca bentuk objek.
const trukState = new Map();
for (let i = 0; i < Math.min(JUMLAH_TRUK, RUTE.length); i++) {
  const mentah = RUTE[i];
  const rute = {
    ...mentah,
    waypoints: mentah.waypoints.map(([lat, lon, label, tiba_menit]) => ({
      lat,
      lon,
      label,
      tiba_menit,
    })),
  };
  trukState.set(mentah.truk, { menit: 0, rute });
}

function kmPerMenit() {
  return KECEPATAN_KMJ / 60;
}

async function initTrips() {
  // 1 truk = 1 driver dinas (shift). Dari semua driver yang ada, 15 pertama
  // dipakai untuk 15 truk; sisanya libur sehingga tidak punya trip berjalan
  // dan otomatis tidak muncul di detail truk / konteks AI / telegram.
  const { data: drv, error: errDrv } = await supabase
    .from('drivers')
    .select('id')
    .order('nama', { ascending: true })
    .limit(100);
  if (errDrv) throw errDrv;
  const driverPool = drv || [];

  // Buat/sambungkan trips di awal. Untuk MVP: upsert per plat supaya id stabil.
  // Nama deterministik Truk 1..N ikut urutan RUTE (sama dengan seed.sql).
  let nomor = 1;
  let urutan = 0;
  for (const [plat, st] of trukState) {
    const nama = `Truk ${nomor++}`;
    st.driverId = driverPool[urutan++]?.id ?? null;
    // ignoreDuplicates: nama seed tidak ditimpa tiap run.
    // (upsert yang diabaikan tidak mengembalikan baris, jadi select terpisah)
    {
      const { error: errUp } = await supabase
        .from('trucks')
        .upsert({ plat, nama, tipe: 'distribusi' }, { onConflict: 'plat', ignoreDuplicates: true });
      if (errUp) throw errUp;
    }
    const { data: truk, error: errTruk } = await supabase
      .from('trucks')
      .select('id')
      .eq('plat', plat)
      .single();
    if (errTruk) throw errTruk;

    // Trip aktif terakhir untuk truk ini (kalau ada yang masih berjalan)
    const { data: tripAda, error: errCari } = await supabase
      .from('trips')
      .select('id')
      .eq('truk_id', truk.id)
      .eq('status', 'berjalan')
      .order('mulai', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (errCari) throw errCari;

    st.trukId = truk.id;
    if (tripAda) {
      // Reuse trip yang masih berjalan, tapi pastikan driver dinas diisi
      // (trip akumulasi dari simulasi lama sering kosong driver_id-nya).
      st.tripId = tripAda.id;
      const { error: errDrv } = await supabase
        .from('trips')
        .update({ driver_id: st.driverId })
        .eq('id', tripAda.id);
      if (errDrv) throw errDrv;
    } else {
      await buatTripBaru(st);
    }
  }
}

// Selesaikan trip lama dan langsung mulai trip baru supaya simulasi jalan
// terus. Tanpa ini proses exit saat semua tiba lalu systemd me-restart dari
// menit 0 = semua truk teleport balik ke titik awal tiap ~90 detik.
// Tutup SEMUA trip berjalan truk itu (bukan cuma trip aktif terakhir) supaya
// restart berulang tidak menumpuk puluhan trip 'berjalan'.
async function buatTripBaru(st) {
  const { error: errTutup } = await supabase
    .from('trips')
    .update({ status: 'selesai', selesai: new Date().toISOString() })
    .eq('truk_id', st.trukId)
    .eq('status', 'berjalan');
  if (errTutup) throw errTutup;
  const { data, error: errTrip } = await supabase
    .from('trips')
    .insert({
      truk_id: st.trukId,
      driver_id: st.driverId,
      asal: st.rute.asal,
      tujuan: st.rute.tujuan,
      waypoints: st.rute.waypoints,
      status: 'berjalan',
    })
    .select('id')
    .single();
  if (errTrip) throw errTrip;
  st.tripId = data.id;
  st.menit = 0;
  return data;
}

async function kirimPosisi() {
  const rows = [];
  for (const [plat, st] of trukState) {
    // Lewati tick (jangan crash) kalau menit jatuh di luar jangkauan rute.
    const hasil = posisiDiMenit(st.rute.waypoints, st.menit);
    if (!hasil) {
      st.menit += MENIT_PER_DETIK * INTERVAL_DETIK;
      continue;
    }
    const { posisi, progres } = hasil;
    const kecepatan = posisi ? (statusTruk(st.rute.waypoints, st.menit, 1) === 'berhenti' ? 0 : KECEPATAN_KMJ * (0.8 + Math.random() * 0.4)) : 0;
    const status = statusTruk(st.rute.waypoints, st.menit, kecepatan);

    rows.push({
      trip_id: st.tripId,
      truk_id: st.trukId,
      lat: posisi.lat,
      lon: posisi.lon,
      kecepatan,
      status,
      ts: new Date().toISOString(),
    });

    st.menit += MENIT_PER_DETIK * (INTERVAL_DETIK);
    if (progres >= 1) await buatTripBaru(st);
  }

  if (rows.length === 0) return; // tak seharusnya terjadi; jangan exit

  const { error } = await supabase.from('positions').insert(rows);
  if (error) console.error('Gagal insert positions:', error.message);
  else console.log(`[${new Date().toISOString()}] ${rows.length} posisi dikirim`);

  if (++tick % 100 === 0) await bersihPosisiLama();
}

async function bersihPosisiLama() {
  try {
    const batas = new Date(Date.now() - RETENSI_HARI * 864e5).toISOString();
    const { error, count } = await supabase
      .from('positions')
      .delete({ count: 'exact' })
      .lt('ts', batas);
    if (error) console.error('Gagal bersih positions:', error.message);
    else if (count) console.log(`Bersih ${count} posisi lebih tua dari ${RETENSI_HARI} hari`);
  } catch (e) {
    console.error('Gagal bersih positions:', e.message);
  }
}

async function main() {
  console.log(`Antar simulasi: ${trukState.size} truk, interval ${INTERVAL_DETIK}s`);
  await initTrips();
  await kirimPosisi();
  setInterval(kirimPosisi, INTERVAL_DETIK * 1000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
