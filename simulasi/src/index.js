// Simulasi GPS — service utama.
// Tiap ANTAR_INTERVAL_DETIK, hitung posisi 10 truk & kirim ke Supabase (tabel positions).

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { RUTE } from './rute.js';
import { posisiDiMenit, progressTrip, statusTruk } from './inti.js';
import { seededRandom, hashSeed } from './seeded-random.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'FATAL', msg: 'Isi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di simulasi/.env' }));
  process.exit(1);
}

const supabase = createClient(url, key);

// Truk yang disimulasikan = truk status 'aktif' di tabel trucks (identitas
// dari scripts/fleet-data.js lewat scripts/seed.js). Simulator TIDAK lagi
// membuat/upsert truk sendiri, sehingga jumlah armada tidak berubah-ubah.
// Variasi kecepatan memakai generator berbenih, bukan Math.random().
const rand = seededRandom(hashSeed(process.env.ANTAR_BENIH || 'circle-t-simulasi'));
const INTERVAL_DETIK = parseFloat(process.env.ANTAR_INTERVAL_DETIK || '3');
const KECEPATAN_KMJ = parseFloat(process.env.ANTAR_KECEPATAN_KMJ || '45');
const MENIT_PER_DETIK = 1;
const RETENSI_HARI = parseFloat(process.env.ANTAR_RETENSI_HARI || '3');
let tick = 0;
let posisiInterval = null;
let cleanupInterval = null;
let running = true;

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }));
}

// state per truk (diisi initTrips dari truk aktif di DB)
const trukState = new Map();
const kunciPlat = (p) => String(p ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function ruteUntukPlat(plat) {
  const mentah = RUTE.find((r) => kunciPlat(r.truk) === kunciPlat(plat));
  if (!mentah) return null;
  return {
    ...mentah,
    waypoints: mentah.waypoints.map(([lat, lon, label, tiba_menit]) => ({
      lat, lon, label, tiba_menit,
    })),
  };
}

function kmPerMenit() {
  return KECEPATAN_KMJ / 60;
}

async function initTrips() {
  const { data: trukAktif, error: errTrukAktif } = await supabase
    .from('trucks')
    .select('id, plat, nama')
    .eq('status', 'aktif')
    .order('nama', { ascending: true })
    .limit(200);
  if (errTrukAktif) throw errTrukAktif;

  // Pengemudi tetap per truk (drivers.truck_id, supabase/drivers-truck-id.sql);
  // bila kolom belum ada, urutan nama.
  let driverPool = [];
  let driverPerTruk = {};
  {
    const coba = await supabase.from('drivers').select('id, truck_id').order('nama', { ascending: true }).limit(200);
    if (coba.error) {
      const { data: drv, error: errDrv } = await supabase.from('drivers').select('id').order('nama', { ascending: true }).limit(200);
      if (errDrv) throw errDrv;
      driverPool = drv || [];
    } else {
      driverPool = coba.data || [];
      driverPerTruk = Object.fromEntries(driverPool.filter((d) => d.truck_id).map((d) => [d.truck_id, d.id]));
    }
  }

  trukState.clear();
  let urutan = 0;
  for (const truk of trukAktif || []) {
    const rute = ruteUntukPlat(truk.plat);
    if (!rute) {
      log('WARN', 'truk aktif tanpa rute di rute.js, dilewati', { plat: truk.plat });
      continue;
    }
    const st = { menit: 0, rute };
    trukState.set(truk.plat, st);
    st.driverId = driverPerTruk[truk.id] ?? driverPool[urutan++ % Math.max(driverPool.length, 1)]?.id ?? null;

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
      st.tripId = tripAda.id;
      const { error: errDrv } = await supabase
        .from('trips')
        .update({ driver_id: st.driverId })
        .eq('id', tripAda.id);
      if (errDrv) throw errDrv;
      await buatJadwal(st);
    } else {
      await buatTripBaru(st);
    }
  }
}

async function buatJadwal(st) {
  const now = new Date();
  const menitAkhir = st.rute.waypoints.at(-1)?.tiba_menit ?? 60;
  const arrival = new Date(now.getTime() + Math.max(menitAkhir, 5) * 60000);

  // Hapus hanya jadwal yang dibuat sim sebelumnya (actual_departure terisi =
  // baris milik simulator). Jadwal manual admin (dijadwalkan, actual_departure
  // null) TIDAK ikut dihapus, supaya rencana admin bertahan di grafik Jadwal.
  const { error: errDel } = await supabase
    .from('schedules')
    .delete()
    .eq('truck_id', st.trukId)
    .not('actual_departure', 'is', null);
  if (errDel) throw errDel;

  const { data, error: errIns } = await supabase
    .from('schedules')
    .insert({
      truck_id: st.trukId,
      driver_id: st.driverId,
      origin: st.rute.asal,
      destination: st.rute.tujuan,
      planned_departure: now.toISOString(),
      planned_arrival: arrival.toISOString(),
      actual_departure: now.toISOString(),
      status: 'berjalan',
    })
    .select('id')
    .single();
  if (errIns) throw errIns;
  st.scheduleId = data.id;
  return data;
}

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
  await buatJadwal(st);
  return data;
}

// Jam kerja (WIB): tiap truk punya giliran tugas supaya tidak semua bergerak
// bersamaan; di luar jendela dan pada malam hari (22-05) truk DIAM
// (0 km/jam, status berhenti) dan hanya menulis satu posisi per menit.
const JENDELA_TUGAS = [[5, 14], [8, 18], [11, 21]];
let tickTugas = 0;
function jamWIB() {
  return Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jakarta' })) % 24;
}
function sedangBertugas(indeks) {
  const jam = jamWIB();
  if (jam >= 22 || jam < 5) return false;
  const [mulai, selesai] = JENDELA_TUGAS[indeks % JENDELA_TUGAS.length];
  return jam >= mulai && jam < selesai;
}

async function kirimPosisi() {
  const rows = [];
  tickTugas += 1;
  let indeks = -1;
  for (const [plat, st] of trukState) {
    indeks += 1;
    if (!sedangBertugas(indeks)) {
      // Diam di posisi terakhir: satu baris per ~60 detik saja.
      if (tickTugas % Math.max(1, Math.round(60 / INTERVAL_DETIK)) !== 0) continue;
      const diam = posisiDiMenit(st.rute.waypoints, st.menit) ?? posisiDiMenit(st.rute.waypoints, 0);
      if (diam?.posisi) {
        rows.push({ trip_id: st.tripId, truk_id: st.trukId, lat: diam.posisi.lat, lon: diam.posisi.lon, kecepatan: 0, status: 'berhenti', ts: new Date().toISOString() });
      }
      continue;
    }
    const hasil = posisiDiMenit(st.rute.waypoints, st.menit);
    if (!hasil) {
      st.menit += MENIT_PER_DETIK * INTERVAL_DETIK;
      continue;
    }
    const { posisi, progres } = hasil;
    const kecepatan = posisi ? (statusTruk(st.rute.waypoints, st.menit, 1) === 'berhenti' ? 0 : KECEPATAN_KMJ * (0.8 + rand() * 0.4)) : 0;
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

    st.menit += MENIT_PER_DETIK * INTERVAL_DETIK;
    if (progres >= 1) await buatTripBaru(st);
  }

  if (rows.length === 0) return;

  const { error } = await supabase.from('positions').insert(rows);
  if (error) log('ERROR', 'gagal insert positions', { error: error.message });
  else log('INFO', 'posisi dikirim', { count: rows.length });
}

async function bersihPosisiLama() {
  try {
    const batas = new Date(Date.now() - RETENSI_HARI * 864e5).toISOString();
    // Hanya baris milik simulator (trip_id terisi). Baris seed demo
    // (scripts/seed.js, trip_id null) dipakai Analitik 90 hari: jangan dihapus.
    const { error, count } = await supabase
      .from('positions')
      .delete({ count: 'exact' })
      .not('trip_id', 'is', null)
      .lt('ts', batas);
    if (error) log('ERROR', 'gagal bersih positions', { error: error.message });
    else if (count) log('INFO', 'bersih posisi lama', { count, batas_hari: RETENSI_HARI });
  } catch (e) {
    log('ERROR', 'gagal bersih positions', { error: e.message });
  }
}

function shutdown(sig) {
  log('INFO', 'shutdown dimulai', { signal: sig });
  running = false;
  if (posisiInterval) clearInterval(posisiInterval);
  if (cleanupInterval) clearInterval(cleanupInterval);
  // Biarkan in-flight insert selesai lalu exit
  setTimeout(() => {
    log('INFO', 'shutdown selesai');
    process.exit(0);
  }, 2000);
}

async function main() {
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  await initTrips();
  log('INFO', 'simulasi mulai', { truk: trukState.size, interval_detik: INTERVAL_DETIK });
  if (!trukState.size) log('WARN', 'tidak ada truk aktif yang cocok dengan rute.js; jalankan scripts/seed.js --apply');
  await kirimPosisi();
  posisiInterval = setInterval(kirimPosisi, INTERVAL_DETIK * 1000);
  // Cleanup berjalan terpisah tiap 5 menit, tidak bergantung pada tick counter
  cleanupInterval = setInterval(bersihPosisiLama, 5 * 60 * 1000);
}

main().catch((e) => {
  log('FATAL', e.message);
  process.exit(1);
});
