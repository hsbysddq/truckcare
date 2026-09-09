-- ============================================================
-- Circle T — Seed jadwal demo untuk halaman Pengemudi / Jadwal.
-- Jalankan di Supabase SQL Editor SETELAH schema.sql, seed.sql, dan
-- schedules.sql. Aman dijalankan ulang: baris seed lama (notes = 'seed-demo')
-- dihapus dulu.
--
-- Semua tanggal RELATIF terhadap hari ini (zona Asia/Jakarta), jadi demo
-- tetap benar kapan pun dijalankan. driver_id dan truck_id diambil dari
-- tabel drivers dan trucks yang ada (urut nama), bukan di-hardcode.
--
-- Sebaran untuk 30 pengemudi (rn = nomor urut pengemudi):
--   rn  1-12 : jadwal aktif hari ini (status berjalan, actual_arrival null)
--              -> Bertugas / Berhenti tergantung telemetri truknya,
--              plus riwayat tiap 3 hari selama 30 hari ke belakang
--   rn 13-22 : jadwal 1 dan 4 hari lalu (tidak hari ini) -> Istirahat,
--              plus riwayat tiap 7 hari selama 30 hari ke belakang
--   rn 23-30 : tanpa jadwal dalam 7 hari terakhir -> Tidak aktif
--              (hanya satu perjalanan 20 hari lalu untuk riwayat)
--
-- Tiap truk dipakai oleh 3 pengemudi (rn, rn+10, rn+20) dengan "slot" jam
-- berbeda (05:00, 11:00, 17:00), sehingga tidak melanggar constraint
-- schedules_no_overlap. Bila jumlah truk/pengemudi berbeda, pemetaan
-- memakai modulo jumlah truk yang ada.
-- ============================================================

delete from schedules where notes = 'seed-demo';

with
  d as (
    select id, row_number() over (order by nama, id) as rn from drivers
  ),
  t as (
    select id, plat, row_number() over (order by nama, id) as rn from trucks
  ),
  n_truk as (select greatest(count(*), 1) as n from t),
  m as (
    select
      d.id  as driver_id,
      d.rn,
      t.id  as truck_id,
      ((d.rn - 1) / (select n from n_truk)) + 1 as slot
    from d
    join t on t.rn = ((d.rn - 1) % (select n from n_truk)) + 1
  ),
  routes(i, origin, destination, jam) as (
    values
      (0, 'Surabaya', 'Malang',   5.0),
      (1, 'Sidoarjo', 'Pasuruan', 2.5),
      (2, 'Gresik',   'Surabaya', 1.5),
      (3, 'Malang',   'Kediri',   3.5),
      (4, 'Surabaya', 'Gresik',   1.5),
      (5, 'Pasuruan', 'Malang',   3.0),
      (6, 'Kediri',   'Malang',   3.5),
      (7, 'Sidoarjo', 'Krian',    1.0),
      (8, 'Surabaya', 'Pasuruan', 2.5),
      (9, 'Malang',   'Surabaya', 5.0)
  ),
  cargo(i, nama) as (
    values (0,'FMCG'), (1,'Material konstruksi'), (2,'Kontainer'), (3,'Solar industri'),
           (4,'Hasil pertanian'), (5,'Elektronik'), (6,'Bahan bangunan'), (7,'Retail')
  ),
  -- Hari ke belakang (0 = hari ini) per pengemudi.
  hari as (
    select rn, 0 as off from m where rn <= 12
    union all
    select m.rn, g.off from m, generate_series(3, 30, 3) as g(off) where m.rn <= 12
    union all
    select m.rn, g.off from m, unnest(array[1, 4]) as g(off) where m.rn between 13 and 22
    union all
    select m.rn, g.off from m, generate_series(9, 30, 7) as g(off) where m.rn between 13 and 22
    union all
    select rn, 20 as off from m where rn >= 23
  ),
  awal_hari as (
    -- Tengah malam hari ini di Asia/Jakarta, sebagai timestamptz.
    select (date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta') as ts
  ),
  baris as (
    select
      m.truck_id,
      m.driver_id,
      r.origin,
      r.destination,
      c.nama as cargo_type,
      h.off,
      -- slot 1 = 05:00, slot 2 = 11:00, slot 3 = 17:00 (durasi rute <= 5 jam)
      (select ts from awal_hari)
        - make_interval(days => h.off::int)
        + make_interval(hours => (5 + (m.slot - 1) * 6)::int) as dep,
      r.jam,
      -- tiap kelipatan 5 dari (rn + off): keberangkatan terlambat 75 menit
      (case when (m.rn + h.off) % 5 = 0 then 75 else 5 end)::int as telat_menit
    from hari h
    join m on m.rn = h.rn
    join routes r on r.i = ((m.rn + h.off) % 10)::int
    join cargo  c on c.i = ((m.rn + h.off) % 8)::int
  )
insert into schedules (
  truck_id, driver_id, origin, destination,
  planned_departure, planned_arrival, actual_departure, actual_arrival,
  status, cargo_type, notes
)
select
  truck_id,
  driver_id,
  origin,
  destination,
  dep,
  dep + make_interval(mins => (jam * 60)::int),
  dep + make_interval(mins => telat_menit),
  case when off = 0 then null
       else dep + make_interval(mins => telat_menit + (jam * 60)::int + 10) end,
  case when off = 0 then 'berjalan'
       when telat_menit > 30 then 'terlambat'
       else 'selesai' end,
  cargo_type,
  'seed-demo'
from baris
order by dep;

-- Ringkasan hasil seed.
select
  count(*)                                   as total_jadwal,
  count(*) filter (where status = 'berjalan') as aktif_hari_ini,
  count(distinct driver_id)                  as pengemudi_terjadwal
from schedules
where notes = 'seed-demo';
