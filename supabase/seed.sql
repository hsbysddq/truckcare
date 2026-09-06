-- ============================================================
-- Antar — Seed master (10 truk + 10 driver)
-- Jalankan di Supabase SQL Editor SETELAH schema.sql.
-- Nama "Truk N" disengaja: chat AI mencocokkan "truk 4" persis ke nama ini.
-- (Simulasi tidak menimpa nama: upsert ignoreDuplicates.)
-- ============================================================

insert into trucks (plat, nama, tipe) values
  ('DK 1234 AB', 'Truk 1',  'distribusi'),
  ('DK 5678 CD', 'Truk 2',  'distribusi'),
  ('DK 9012 EF', 'Truk 3',  'distribusi'),
  ('DK 3456 GH', 'Truk 4',  'distribusi'),
  ('DK 7890 IJ', 'Truk 5',  'distribusi'),
  ('DK 1122 KL', 'Truk 6',  'distribusi'),
  ('DK 3344 MN', 'Truk 7',  'distribusi'),
  ('DK 5566 OP', 'Truk 8',  'distribusi'),
  ('DK 7788 QR', 'Truk 9',  'distribusi'),
  ('DK 9900 ST', 'Truk 10', 'distribusi')
on conflict (plat) do nothing;

insert into drivers (nama, no_hp) values
  ('Driver 1',  '-'), ('Driver 2',  '-'), ('Driver 3',  '-'),
  ('Driver 4',  '-'), ('Driver 5',  '-'), ('Driver 6',  '-'),
  ('Driver 7',  '-'), ('Driver 8',  '-'), ('Driver 9',  '-'),
  ('Driver 10', '-')
on conflict do nothing;
