-- ============================================================
-- Circle T — Rentang data historis yang benar-benar ada (READ-ONLY).
-- Jalankan di Supabase SQL Editor. Versi REST: node scripts/inspect-range.js
--
-- Nama kolom di skema ini: telemetry -> positions, recorded_at -> ts,
-- complaints -> pengaduan (created_at ada), speed_kph -> kecepatan.
-- ============================================================

-- 1. Rentang telemetri. Bila hanya beberapa jam/hari terakhir, seed historis
--    tidak pernah masuk (atau dihapus retensi simulator lama, 3 hari).
select min(ts) as ts_awal, max(ts) as ts_akhir, count(*) as baris,
       count(*) filter (where trip_id is null)     as baris_seed,
       count(*) filter (where trip_id is not null) as baris_simulator
from positions;

-- 2. Baris telemetri per hari (WIB), 90 hari terakhir.
select (ts at time zone 'Asia/Jakarta')::date as tgl,
       count(*) as baris,
       count(*) filter (where kecepatan > 80) as di_atas_80,
       count(distinct truk_id) as truk
from positions
where ts >= now() - interval '90 days'
group by 1
order by 1;

-- 3. Rentang pengaduan.
select min(created_at) as awal, max(created_at) as akhir, count(*) as baris,
       count(*) filter (where evidence->>'seed' = 'true') as baris_seed,
       min(tanggal) as tanggal_awal, max(tanggal) as tanggal_akhir
from pengaduan
where deleted_at is null;
