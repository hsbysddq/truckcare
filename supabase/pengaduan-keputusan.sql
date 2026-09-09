-- ============================================================
-- Circle T — Migration: pencatatan keputusan, catatan internal, dan soft
-- delete pada tabel pengaduan (complaints). Jalankan di Supabase SQL Editor
-- SETELAH schema.sql dan pengaduan-diputuskan-oleh.sql.
--
-- Prinsip: isi laporan warga (plat, tanggal, jam, deskripsi, foto_url)
-- TIDAK PERNAH diubah. Yang boleh berubah hanya kolom di bawah ini.
--
--   decided_by        siapa yang memutuskan: agent | operator | sistem
--                     (sistem = diterima otomatis saat agent tak terjangkau)
--   decided_by_name   identitas operator (email login) bila operator
--   decided_at        waktu keputusan
--   operator_note     catatan internal operator (satu-satunya teks yang boleh diedit)
--   operator_note_at  waktu catatan terakhir diubah (untuk riwayat)
--   deleted_at        soft delete: terisi = tidak tampil di daftar utama
--   delete_reason     alasan penghapusan (wajib diisi dari dashboard)
-- ============================================================

alter table pengaduan
  add column if not exists decided_by text
    check (decided_by in ('agent', 'operator', 'sistem')),
  add column if not exists decided_by_name text,
  add column if not exists decided_at timestamptz,
  add column if not exists operator_note text,
  add column if not exists operator_note_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists delete_reason text;

-- Backfill dari kolom lama diputuskan_oleh (tetap dipertahankan untuk
-- kompatibilitas; kode baru menulis keduanya).
update pengaduan
   set decided_by = diputuskan_oleh
 where decided_by is null and diputuskan_oleh is not null;

create index if not exists idx_pengaduan_deleted_at on pengaduan (deleted_at)
  where deleted_at is null;

comment on column pengaduan.deleted_at is
  'Soft delete. Baris tetap tersimpan; daftar utama hanya menampilkan deleted_at is null.';
