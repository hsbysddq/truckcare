-- ============================================================
-- Antar — Seed dummy untuk simulasi sinkron (15 truk + 30 driver)
-- Jalankan di Supabase SQL Editor SETELAH schema.sql + seed.sql.
-- Idempotent: aman di-rerun, tidak mendobel data.
--
-- Kondisi awal (dari seed.sql yang sudah jalan): 10 truk + 10 driver
-- generik ("Driver 1..10", no_hp '-'). Skrip ini:
--   1. Menambah Truk 11-15  -> total trucks 15.
--   2. Mengganti nama Driver 1..10 yang masih generik  -> nama asli.
--   3. Menambah 20 driver baru -> total drivers 30 (nama asli).
-- Trips/positions tidak di-seed: simulasi VPS mengisinya tiap jalan.
-- ============================================================

-- ---------- 1. Truk 11-15 (ops pemilihan 10 existing tetap) ----------
insert into trucks (plat, nama, tipe, status) values
  ('L 9911 MU',  'Truk 11', 'distribusi', 'aktif'),
  ('W 1234 NV',  'Truk 12', 'distribusi', 'aktif'),
  ('N 7788 OP',  'Truk 13', 'distribusi', 'aktif'),
  ('AG 5566 PQ', 'Truk 14', 'distribusi', 'aktif'),
  ('B 3344 RS',  'Truk 15', 'distribusi', 'aktif')
on conflict (plat) do nothing;

-- ---------- 2. Ganti nama driver generik jadi nama asli ----------
-- Hanya baris yang masih 'Driver N' yang di-ubah; rerun = no-op.
update drivers set nama = 'Ahmad Fauzi',      no_hp = '0812 3456 701', rating = 4.8 where nama = 'Driver 1';
update drivers set nama = 'Bagus Prasetyo',   no_hp = '0813 4567 702', rating = 4.7 where nama = 'Driver 2';
update drivers set nama = 'Chandra Wijaya',   no_hp = '0812 5678 703', rating = 4.6 where nama = 'Driver 3';
update drivers set nama = 'Deni Setiawan',    no_hp = '0857 6789 704', rating = 4.9 where nama = 'Driver 4';
update drivers set nama = 'Eko Saputra',      no_hp = '0821 7890 705', rating = 4.5 where nama = 'Driver 5';
update drivers set nama = 'Fajar Ramadhan',   no_hp = '0811 8901 706', rating = 4.7 where nama = 'Driver 6';
update drivers set nama = 'Galih Nugroho',    no_hp = '0819 9012 707', rating = 4.6 where nama = 'Driver 7';
update drivers set nama = 'Hendra Gunawan',   no_hp = '0856 0123 708', rating = 4.8 where nama = 'Driver 8';
update drivers set nama = 'Irfan Maulana',    no_hp = '0823 1234 709', rating = 4.4 where nama = 'Driver 9';
update drivers set nama = 'Joko Santoso',     no_hp = '0812 2345 710', rating = 4.9 where nama = 'Driver 10';

-- ---------- 3. Tambah 20 driver baru ----------
insert into drivers (nama, no_hp, rating)
select d.nama, d.no_hp, d.rating
from (
  values
    ('Kadek Wirawan',     '0812 3456 711', 4.6),
    ('Lukman Hakim',      '0813 4567 712', 4.5),
    ('Made Subrata',      '0812 5678 713', 4.8),
    ('Nanang Firmansyah', '0857 6789 714', 4.4),
    ('Oktavianus Bima',   '0821 7890 715', 4.7),
    ('Putu Ariawan',      '0811 8901 716', 4.9),
    ('Rizky Hidayat',     '0819 9012 717', 4.6),
    ('Slamet Riyadi',     '0856 0123 718', 4.3),
    ('Taufik Hidayat',    '0823 1234 719', 4.8),
    ('Umar Hadi',         '0812 2345 720', 4.5),
    ('Wahyu Pratama',     '0812 3456 721', 4.7),
    ('Yoga Lesmana',      '0813 4567 722', 4.6),
    ('Zainal Abidin',     '0812 5678 723', 4.9),
    ('Andi Pratama',      '0857 6789 724', 4.5),
    ('Budi Hartono',      '0821 7890 725', 4.8),
    ('Candra Kirana',     '0811 8901 726', 4.6),
    ('Dimas Anggara',     '0819 9012 727', 4.7),
    ('Eka Kurniawan',     '0856 0123 728', 4.4),
    ('Fikri Maulana',     '0823 1234 729', 4.8),
    ('Gede Adnyana',      '0812 2345 730', 4.7)
) as d(nama, no_hp, rating)
where not exists (select 1 from drivers x where x.nama = d.nama);
