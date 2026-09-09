-- ============================================================
-- Circle T — Migration: kolom catatan & alasan keputusan pengaduan.
-- Jalankan di Supabase SQL Editor SETELAH pengaduan-keputusan.sql.
--
-- Kode route app/api/complaints/[id] membaca/menulis dua kolom ini:
--   decision_reason  daftar poin alasan keputusan (array string)
--   operator_notes   riwayat catatan internal operator (array objek
--                    {by, at, text})
-- Tanpa kolom ini, daftar pengaduan 500 (PostgREST: kolom tak dikenal).
-- Idempotent: aman di-rerun.
-- ============================================================

alter table pengaduan
  add column if not exists decision_reason text[],
  add column if not exists operator_notes jsonb default '[]'::jsonb;
