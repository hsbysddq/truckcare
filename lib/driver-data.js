// Server-only: memuat pengemudi, jadwal, truk, dan pengaduan lalu menyusun
// data halaman Pengemudi lewat lib/driver-status.js. Supabase bila env
// terisi, selain itu data contoh lib/data.js. Tidak pernah dipanggil dari
// endpoint publik: data pengemudi hanya untuk dashboard yang digate.

import { getComplaintsShape, daftarPengemudiCache } from "./supabase.js";
import { getDrivers, getComplaints } from "./data.js";
import { getActiveTrucks } from "./trucks.js";
import { listSchedules, supabaseReady } from "./schedule-store.js";
import { buildDriverOverview, buildDriverDetail, attachCurrentDrivers } from "./driver-status.js";

// Truk aktif (getActiveTrucks) + pengemudi yang sedang membawanya menurut
// jadwal aktif. Satu-satunya loader truk untuk halaman server (Armada,
// Overview, Jadwal, Pengaduan) supaya daftar plat identik di semua tampilan.
// Jendela jadwal yang dibaca: cukup yang bisa "sedang berlangsung" sekarang
// (bukan seluruh tabel schedules).
const JENDELA_AKTIF_MS = { sebelum: 24 * 3600e3, sesudah: 6 * 3600e3 };
// Riwayat untuk halaman Pengemudi (statistik bulan ini, tepat waktu, 7 hari
// terakhir): 90 hari ke belakang + 7 hari ke depan, bukan tanpa batas.
const JENDELA_RIWAYAT_HARI = { sebelum: 90, sesudah: 7 };

export function jendelaJadwalAktif(now = new Date()) {
  return {
    from: new Date(now.getTime() - JENDELA_AKTIF_MS.sebelum).toISOString(),
    to: new Date(now.getTime() + JENDELA_AKTIF_MS.sesudah).toISOString(),
  };
}
export function jendelaJadwalRiwayat(now = new Date()) {
  return {
    from: new Date(now.getTime() - JENDELA_RIWAYAT_HARI.sebelum * 864e5).toISOString(),
    to: new Date(now.getTime() + JENDELA_RIWAYAT_HARI.sesudah * 864e5).toISOString(),
  };
}

export async function loadTrucksWithDrivers() {
  const trucks = await getActiveTrucks();
  try {
    const [schedules, drivers] = await Promise.all([listSchedules(jendelaJadwalAktif()), loadDrivers()]);
    return attachCurrentDrivers(trucks, schedules, new Map(drivers.map((d) => [d.id, d])));
  } catch {
    return trucks;
  }
}

export async function loadDrivers() {
  if (supabaseReady()) {
    try {
      // Dari cache 60 detik (lib/cache.js): dibagi semua halaman.
      const rows = await daftarPengemudiCache();
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
    listSchedules(jendelaJadwalRiwayat(now)),
    loadTrucks(),
  ]);
  return buildDriverOverview({ drivers, schedules, trucks, now });
}

export async function loadDriverDetail(id) {
  const now = new Date();
  const [drivers, schedules, trucks, complaints] = await Promise.all([
    loadDrivers(),
    listSchedules(jendelaJadwalRiwayat(now)),
    loadTrucks(),
    loadComplaints(),
  ]);
  const driver = drivers.find((d) => d.id === id);
  if (!driver) return null;
  return buildDriverDetail({ driver, schedules, trucks, complaints, now });
}
