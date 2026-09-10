-- ============================================================
-- Circle T — Cek insiden kecepatan langsung di database (READ-ONLY).
-- Jalankan di Supabase SQL Editor, satu blok demi satu, dan bandingkan
-- dengan grafik Analitik. Versi REST-nya: node scripts/inspect-speeding.js
--
-- Nama kolom di skema ini (bukan telemetry/speed_kph/recorded_at/is_active):
--   telemetry     -> positions      speed_kph  -> kecepatan
--   recorded_at   -> ts             truck_id   -> truk_id
--   plate_number  -> trucks.plat    is_active  -> trucks.status = 'aktif'
-- Ambang: kecepatan > 80 (BATAS_KECEPATAN_KPJ di lib/speed-limit.js).
-- ============================================================

-- 1. Berapa baris telemetri di atas ambang?
select count(*) as baris_di_atas_80
from positions
where kecepatan > 80;

-- 2. Milik truk mana, dan apakah truknya aktif?
select p.truk_id, tr.plat, tr.status = 'aktif' as aktif, count(*) as baris,
       min(p.ts) as paling_lama, max(p.ts) as paling_baru
from positions p
join trucks tr on tr.id = p.truk_id
where p.kecepatan > 80
group by p.truk_id, tr.plat, tr.status
order by baris desc;

-- 2b. Baris di atas ambang yang truknya TIDAK ada di tabel trucks (yatim).
select count(*) as yatim
from positions p
left join trucks tr on tr.id = p.truk_id
where p.kecepatan > 80 and tr.id is null;

-- 3. Kecepatan tertinggi dan rentang waktu seluruh telemetri.
select max(kecepatan) as kecepatan_maks, min(ts) as ts_awal, max(ts) as ts_akhir, count(*) as total_baris
from positions;

-- 4. Insiden (episode) per rentang, persis seperti yang dihitung halaman
--    Analitik lewat fungsi analitik_ngebut (supabase/analitik-agregat.sql).
--    Bila fungsi belum ada, perintah ini gagal: jalankan file itu dulu.
select
  count(*) filter (where tanggal >= (now() at time zone 'Asia/Jakarta')::date - 6)  as insiden_7_hari,
  count(*) filter (where tanggal >= (now() at time zone 'Asia/Jakarta')::date - 29) as insiden_30_hari,
  count(*)                                                                          as insiden_90_hari,
  count(distinct truk_id)                                                           as truk_terlibat
from (select tanggal, truk_id, jumlah from analitik_ngebut(90), generate_series(1, jumlah)) x;

-- 5. Baris seed masih ada? (seed menulis trip_id null; simulator lama
--    menghapus SEMUA positions lebih tua dari ANTAR_RETENSI_HARI).
select count(*) filter (where trip_id is null) as baris_seed,
       count(*) filter (where trip_id is not null) as baris_simulator,
       min(ts) filter (where trip_id is null) as seed_paling_lama
from positions;
