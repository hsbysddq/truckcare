// Server-only: memuat pengemudi, jadwal, truk, dan pengaduan lalu menyusun
// data halaman Pengemudi lewat lib/driver-status.js. Supabase bila env
// terisi, selain itu data contoh lib/data.js. Tidak pernah dipanggil dari
// endpoint publik: data pengemudi hanya untuk dashboard yang digate.

import { baca, getComplaintsShape } from "./supabase.js";
import { getDrivers, getComplaints } from "./data.js";
import { getActiveTrucks } from "./trucks.js";
import { listSchedules, supabaseReady } from "./schedule-store.js";
import { buildDriverOverview, buildDriverDetail, attachCurrentDrivers } from "./driver-status.js";

// Truk aktif (getActiveTrucks) + pengemudi yang sedang membawanya menurut
// jadwal aktif. Satu-satunya loader truk untuk halaman server (Armada,
// Overview, Jadwal, Pengaduan) supaya daftar plat identik di semua tampilan.
export async function loadTrucksWithDrivers() {
  const trucks = await getActiveTrucks();
  try {
    const [schedules, drivers] = await Promise.all([listSchedules(), loadDrivers()]);
    return attachCurrentDrivers(trucks, schedules, new Map(drivers.map((d) => [d.id, d])));
  } catch {
    return trucks;
  }
}

export async function loadDrivers() {
  if (supabaseReady()) {
    try {
      const rows = await baca("drivers", "?select=id,nama,no_hp&order=nama&limit=200");
      return (rows || []).map((d) => ({ id: d.id, name: d.nama, phone: d.no_hp ?? null }));
    } catch {
      // Lanjut ke data contoh.
    }
  }
  return getDrivers();
}

async function loadTrucks() {
  return getActiveTrucks();
}

async function loadComplaints() {
  try {
    return await getComplaintsShape();
  } catch {
    return getComplaints();
  }
}

export async function loadDriverOverview() {
  const now = new Date();
  const [drivers, schedules, trucks] = await Promise.all([
    loadDrivers(),
    listSchedules(),
    loadTrucks(),
  ]);
  return buildDriverOverview({ drivers, schedules, trucks, now });
}

export async function loadDriverDetail(id) {
  const now = new Date();
  const [drivers, schedules, trucks, complaints] = await Promise.all([
    loadDrivers(),
    listSchedules(),
    loadTrucks(),
    loadComplaints(),
  ]);
  const driver = drivers.find((d) => d.id === id);
  if (!driver) return null;
  return buildDriverDetail({ driver, schedules, trucks, complaints, now });
}
