// Cache untuk data yang JARANG berubah (daftar truk, pengemudi, jenis armada)
// supaya tidak diambil ulang dari Supabase pada setiap navigasi/polling.
// Memakai cache bawaan Next.js (unstable_cache: cache data lintas request,
// masih didukung di Next 16 tanpa mengaktifkan cacheComponents).
//
// Data yang berubah cepat (posisi terkini, trip berjalan, pengaduan, jadwal)
// TIDAK lewat sini: tetap diambil segar lewat baca().
//
// Masa simpan 60 detik: perubahan dari scripts/seed.js atau SQL Editor
// terlihat paling lambat semenit kemudian tanpa perlu deploy ulang.
import { unstable_cache } from "next/cache";

export const TAG_ARMADA = "armada";
export const MASA_CACHE_DETIK = 60;

export function cacheJarangBerubah(fn, kunci, { revalidate = MASA_CACHE_DETIK, tags = [TAG_ARMADA] } = {}) {
  return unstable_cache(fn, kunci, { revalidate, tags });
}
