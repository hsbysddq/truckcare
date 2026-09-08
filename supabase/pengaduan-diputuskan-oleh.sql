-- ============================================================
-- Antar — Migration: kolom diputuskan_oleh di pengaduan.
-- Membedakan keputusan AI agent dari keputusan manual operator supaya
-- dashboard tidak menampilkan "tingkat keyakinan" pada laporan yang
-- tidak pernah dianalisis agent. Jalankan SETELAH schema.sql.
--   agent    : verdict dari OpenClaw (ada analisis + keyakinan)
--   operator : tolak/validasi manual oleh operator
--   sistem   : diterima otomatis karena agent tak terjangkau
-- ============================================================

alter table pengaduan
  add column if not exists diputuskan_oleh text
  check (diputuskan_oleh in ('agent', 'operator', 'sistem'));

-- Backfill baris lama dari teks alasan yang ditulis route validasi.
update pengaduan set diputuskan_oleh = 'operator'
  where diputuskan_oleh is null and alasan like 'Ditolak manual%';
update pengaduan set diputuskan_oleh = 'sistem'
  where diputuskan_oleh is null and alasan like 'Validasi AI tidak tersedia%';
update pengaduan set diputuskan_oleh = 'agent'
  where diputuskan_oleh is null and status <> 'menunggu' and alasan is not null;

-- Plat luar Jawa Timur dari seed lama disamakan dengan armada.
update pengaduan set plat = 'W 6612 OP' where plat = 'DK 5566 OP';
update pengaduan set plat = 'W 9042 CD' where plat = 'DK 5678 CD';
