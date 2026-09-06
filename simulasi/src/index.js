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

const JUMLAH_TRUK = parseInt(process.env.ANTAR_JUMLAH_TRUK || '10', 10);
const INTERVAL_DETIK = parseFloat(process.env.ANTAR_INTERVAL_DETIK || '3');
const KECEPATAN_KMJ = parseFloat(process.env.ANTAR_KECEPATAN_KMJ || '45');
// skala: 1 menit perjalanan = 1 detik nyata
const MENIT_PER_DETIK = 1;

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
  trukState.set(mentah.truk, { menit: 0, rute, tiba: false });
}

function kmPerMenit() {
  return KECEPATAN_KMJ / 60;
}

async function initTrips() {
  // Buat/sambungkan trips di awal. Untuk MVP: upsert per plat supaya id stabil.
  for (const [plat, st] of trukState) {
    // ignoreDuplicates: nama seed ("Truk N") tidak ditimpa tiap run.
    // (upsert yang diabaikan tidak mengembalikan baris, jadi select terpisah)
    {
      const { error: errUp } = await supabase
        .from('trucks')
        .upsert({ plat, nama: `Truk ${plat}`, tipe: 'distribusi' }, { onConflict: 'plat', ignoreDuplicates: true });
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

    let trip;
    if (tripAda) {
      trip = tripAda;
    } else {
      const { data, error: errTrip } = await supabase
        .from('trips')
        .insert({
          truk_id: truk.id,
          asal: st.rute.asal,
          tujuan: st.rute.tujuan,
          waypoints: st.rute.waypoints,
          status: 'berjalan',
        })
        .select('id')
        .single();
      if (errTrip) throw errTrip;
      trip = data;
    }

    st.trukId = truk.id;
    st.tripId = trip.id;
  }
}

async function kirimPosisi() {
  const rows = [];
  for (const [plat, st] of trukState) {
    if (st.tiba) continue;
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
    if (progres >= 1) st.tiba = true;
  }

  if (rows.length === 0) {
    console.log('Semua truk sudah tiba. Simulasi selesai.');
    process.exit(0);
  }

  const { error } = await supabase.from('positions').insert(rows);
  if (error) console.error('Gagal insert positions:', error.message);
  else console.log(`[${new Date().toISOString()}] ${rows.length} posisi dikirim`);
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
