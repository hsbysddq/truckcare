-- ============================================================
-- Antar — Seed master (10 truk + 10 driver)
-- Jalankan di Supabase SQL Editor SETELAH schema.sql.
-- Nama "Truk N" disengaja: chat AI mencocokkan "truk 4" persis ke nama ini.
-- (Simulasi tidak menimpa nama: upsert ignoreDuplicates.)
-- ============================================================

insert into trucks (plat, nama, tipe) values
  ('L 8821 AB', 'Truk 1',  'distribusi'),
  ('L 9042 CD', 'Truk 2',  'distribusi'),
  ('L 1187 EF', 'Truk 3',  'distribusi'),
  ('L 5560 GH', 'Truk 4',  'distribusi'),
  ('L 3324 IJ', 'Truk 5',  'distribusi'),
  ('L 7743 KL', 'Truk 6',  'distribusi'),
  ('L 2298 MN', 'Truk 7',  'distribusi'),
  ('L 6612 OP', 'Truk 8',  'distribusi'),
  ('L 4405 QR', 'Truk 9',  'distribusi'),
  ('L 8890 ST', 'Truk 10', 'distribusi')
on conflict (plat) do nothing;

insert into drivers (nama, no_hp) values
  ('Driver 1',  '-'), ('Driver 2',  '-'), ('Driver 3',  '-'),
  ('Driver 4',  '-'), ('Driver 5',  '-'), ('Driver 6',  '-'),
  ('Driver 7',  '-'), ('Driver 8',  '-'), ('Driver 9',  '-'),
  ('Driver 10', '-')
on conflict do nothing;

-- Contoh pengaduan (2 menunggu) supaya dashboard pengaduan tidak kosong di
-- DB fresh. Idempotent via where not exists: aman di-rerun, tidak dobel.
-- Trips/positions tidak di-seed: simulasi mengisinya otomatis tiap jalan.
insert into pengaduan (plat, jam, deskripsi, status)
select 'L 9042 CD', '09:40', 'Truk ngebut di Jalan Raya Waru, nyalip dari kiri hampir menyerempet motor.', 'menunggu'
where not exists (
  select 1 from pengaduan
  where deskripsi = 'Truk ngebut di Jalan Raya Waru, nyalip dari kiri hampir menyerempet motor.'
);

insert into pengaduan (plat, jam, deskripsi, status)
select 'L 6612 OP', '07:15', 'Truk melaju kencang di simpang dekat permukiman pagi hari.', 'menunggu'
where not exists (
  select 1 from pengaduan
  where deskripsi = 'Truk melaju kencang di simpang dekat permukiman pagi hari.'
);
