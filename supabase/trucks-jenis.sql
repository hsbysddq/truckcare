-- ============================================================
-- Circle T — Migration: jenis armada pada tabel trucks (kolom tipe).
-- Tiga jenis saja: 'cdd' (Colt Diesel Double, tangki 100 L),
-- 'fuso' (tangki 200 L), 'trailer' (tangki 400 L). Label, kapasitas, dan
-- konsumsi per jenis ada di lib/truck-types.js.
-- Komposisi 20 truk: 10 CDD, 7 Fuso, 3 Trailer (armada logistik Jawa Timur).
-- Jalankan di Supabase SQL Editor SETELAH seed.sql (dan seed-dummy-15-30.sql
-- bila dipakai). Idempotent: aman di-rerun.
-- ============================================================

-- Truk 16-20 (bila belum ada). Kolom nama tetap diisi untuk kompatibilitas
-- lama (chat AI); dashboard tidak lagi menampilkan "Truk N".
insert into trucks (plat, nama, tipe, status) values
  ('L 2210 BC',  'Truk 16', 'cdd',     'aktif'),
  ('W 7781 DE',  'Truk 17', 'cdd',     'aktif'),
  ('N 3315 FG',  'Truk 18', 'fuso',    'aktif'),
  ('AG 1290 HJ', 'Truk 19', 'cdd',     'aktif'),
  ('L 6634 KM',  'Truk 20', 'trailer', 'aktif')
on conflict (plat) do nothing;

-- Jenis per plat (10 CDD, 7 Fuso, 3 Trailer).
update trucks set tipe = 'fuso'    where plat in ('L 8821 AB', 'W 9042 CD', 'W 3324 IJ', 'AG 4405 QR', 'L 8890 ST', 'W 1234 NV', 'N 3315 FG');
update trucks set tipe = 'trailer' where plat in ('W 1187 EF', 'L 5560 GH', 'L 6634 KM');
update trucks set tipe = 'cdd'     where plat in ('N 7743 KL', 'N 2298 MN', 'W 6612 OP', 'L 9911 MU', 'N 7788 OP', 'AG 5566 PQ', 'B 3344 RS', 'L 2210 BC', 'W 7781 DE', 'AG 1290 HJ');

-- Sisa baris lain (mis. nilai lama 'distribusi'): jatuhkan ke fuso.
update trucks set tipe = 'fuso' where tipe is null or tipe not in ('cdd', 'fuso', 'trailer');

alter table trucks drop constraint if exists trucks_tipe_check;
alter table trucks add constraint trucks_tipe_check check (tipe in ('cdd', 'fuso', 'trailer'));

comment on column trucks.tipe is 'Jenis armada: cdd (tangki 100 L) | fuso (200 L) | trailer (400 L). Lihat lib/truck-types.js.';

select tipe, count(*) from trucks group by tipe order by tipe;
