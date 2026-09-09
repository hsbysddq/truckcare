-- ============================================================
-- Circle T — Migration: alasan keputusan terstruktur dan catatan internal
-- berbentuk daftar pada tabel pengaduan (complaints). Jalankan di Supabase
-- SQL Editor SETELAH pengaduan-keputusan.sql.
--
--   decision_reason  jsonb  array string, 1-3 poin ringkas alasan keputusan.
--                           Diisi route keputusan: dari temuan agent bila ada,
--                           atau kalimat alasan operator.
--   operator_notes   jsonb  array {by, at, text} catatan internal operator,
--                           tampil sebagai timeline. Kolom lama operator_note /
--                           operator_note_at tetap diisi dengan catatan terbaru.
-- ============================================================

alter table pengaduan
  add column if not exists decision_reason jsonb not null default '[]'::jsonb,
  add column if not exists operator_notes  jsonb not null default '[]'::jsonb;

-- Backfill: alasan lama (teks) menjadi satu poin; catatan tunggal lama
-- menjadi entri pertama daftar.
update pengaduan
   set decision_reason = jsonb_build_array(alasan)
 where decision_reason = '[]'::jsonb and alasan is not null and alasan <> '';

update pengaduan
   set operator_notes = jsonb_build_array(jsonb_build_object(
         'by', coalesce(decided_by_name, 'operator'),
         'at', coalesce(operator_note_at, now()),
         'text', operator_note))
 where operator_notes = '[]'::jsonb and operator_note is not null and operator_note <> '';
