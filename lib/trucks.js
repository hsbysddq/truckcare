// SATU-SATUNYA cara mengambil daftar truk di server. Filter "aktif" tertanam
// di sini supaya semua halaman (Armada, Overview, Peta, Jadwal, Pengemudi,
// Analitik, chat agent, API) memakai himpunan truk yang persis sama.
//
// Kolom aktif di tabel trucks bernama `status` ('aktif' | 'nonaktif'), bukan
// is_active. Supabase: getTrucksShape sudah menambahkan filter status=eq.aktif
// dan mengisi `active`. Data contoh (tanpa env Supabase): semua truk aktif.
// Jangan menulis query trucks sendiri di halaman/route; panggil fungsi ini.

import { getTrucksShape } from "./supabase.js";
import { getTrucks as getDummyTrucks } from "./data.js";
import { plateKey } from "./format.js";

export function isTruckActive(truck) {
  return truck?.active !== false;
}

export async function getActiveTrucks() {
  let trucks;
  try {
    trucks = await getTrucksShape({ activeOnly: true });
  } catch {
    // Env Supabase kosong / offline: data contoh.
    trucks = getDummyTrucks();
  }
  return (trucks || []).filter(isTruckActive);
}

export async function getActiveTruckIds() {
  return new Set((await getActiveTrucks()).map((t) => t.id));
}

// Himpunan kunci plat (tanpa spasi, kapital) truk aktif — untuk pencocokan
// plat dari laporan warga.
export async function getActivePlateKeys() {
  return new Set((await getActiveTrucks()).map((t) => plateKey(t.plateNumber)));
}
