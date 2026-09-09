// Simulasi GPS — service utama.
// Tiap ANTAR_INTERVAL_DETIK, hitung posisi 10 truk & kirim ke Supabase (tabel positions).

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { RUTE } from './rute.js';
import { posisiDiMenit, progressTrip, statusTruk } from './inti.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'FATAL', msg: 'Isi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di simulasi/.env' }));
  process.exit(1);
}

const supabase = createClient(url, key);

const JUMLAH_TRUK = parseInt(process.env.ANTAR_JUMLAH_TRUK || '15', 10);
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

// state per truk
const trukState = new Map();
for (let i = 0; i < Math.min(JUMLAH_TRUK, RUTE.length); i++) {
  const mentah = RUTE[i];
  const rute = {
    ...mentah,
    waypoints: mentah.waypoints.map(([lat, lon, label, tiba_menit]) => ({
      lat, lon, label, tiba_menit,
    })),
  };
  trukState.set(mentah.truk, { menit: 0, rute });
}

function kmPerMenit() {
  return KECEPATAN_KMJ / 60;
}

async function initTrips() {
  const { data: drv, error: errDrv } = await supabase
    .from('drivers')
    .select('id')
    .order('nama', { ascending: true })
    .limit(100);
  if (errDrv) throw errDrv;
  const driverPool = drv || [];

  let nomor = 1;
  let urutan = 0;
  for (const [plat, st] of trukState) {
    const nama = `Truk ${nomor++}`;
    st.driverId = driverPool[urutan++]?.id ?? null;
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

  const { error: errDel } = await supabase
    .from('schedules')
    .delete()
    .eq('truck_id', st.trukId);
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

async function kirimPosisi() {
  const rows = [];
  for (const [plat, st] of trukState) {
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
    const { error, count } = await supabase
      .from('positions')
      .delete({ count: 'exact' })
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

  log('INFO', 'simulasi mulai', { truk: trukState.size, interval_detik: INTERVAL_DETIK });
  await initTrips();
  await kirimPosisi();
  posisiInterval = setInterval(kirimPosisi, INTERVAL_DETIK * 1000);
  // Cleanup berjalan terpisah tiap 5 menit, tidak bergantung pada tick counter
  cleanupInterval = setInterval(bersihPosisiLama, 5 * 60 * 1000);
}

main().catch((e) => {
  log('FATAL', e.message);
  process.exit(1);
});
