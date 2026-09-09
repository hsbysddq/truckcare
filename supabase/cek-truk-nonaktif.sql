-- ============================================================
-- Circle T — Pemeriksaan data turunan yang merujuk truk NONAKTIF.
-- Dashboard hanya menampilkan trucks.status = 'aktif' (lib/trucks.js), jadi
-- telemetri/jadwal/pengaduan/agent_runs milik truk nonaktif tidak akan
-- terlihat di mana pun. Jalankan bagian 1 di Supabase SQL Editor dan
-- laporkan angkanya dulu; bagian 2 dan 3 adalah pilihan tindak lanjut,
-- JANGAN dijalankan sebelum diputuskan.
-- ============================================================

-- ---------- 1. Hitung (hanya membaca) ----------
with nonaktif as (
  select id, plat from trucks where status is distinct from 'aktif'
)
select 'trucks nonaktif' as jenis, count(*) as jumlah from nonaktif
union all
select 'positions', count(*) from positions where truk_id in (select id from nonaktif)
union all
select 'trips', count(*) from trips where truk_id in (select id from nonaktif)
union all
select 'events', count(*) from events where truk_id in (select id from nonaktif)
union all
select 'schedules', count(*) from schedules where truck_id in (select id from nonaktif)
union all
select 'pengaduan (plat cocok)', count(*)
  from pengaduan p
 where upper(replace(p.plat, ' ', '')) in (select upper(replace(plat, ' ', '')) from nonaktif)
union all
select 'agent_runs (lewat pengaduan)', count(*)
  from agent_runs r
  join pengaduan p on p.id = r.complaint_id
 where upper(replace(p.plat, ' ', '')) in (select upper(replace(plat, ' ', '')) from nonaktif);

-- Rincian per truk nonaktif.
select t.plat, t.nama, t.status,
       (select count(*) from positions where truk_id = t.id)  as positions,
       (select count(*) from trips     where truk_id = t.id)  as trips,
       (select count(*) from schedules where truck_id = t.id) as schedules,
       (select count(*) from pengaduan p
         where upper(replace(p.plat, ' ', '')) = upper(replace(t.plat, ' ', ''))) as pengaduan
  from trucks t
 where t.status is distinct from 'aktif'
 order by t.plat;

-- ---------- 2. PILIHAN A: aktifkan kembali truk yang punya data ----------
-- update trucks set status = 'aktif'
--  where status is distinct from 'aktif'
--    and (exists (select 1 from positions where truk_id = trucks.id)
--      or exists (select 1 from schedules where truck_id = trucks.id));

-- ---------- 3. PILIHAN B: hapus data turunan truk nonaktif ----------
-- (pengaduan TIDAK dihapus: bukti laporan warga; cukup soft delete bila perlu)
-- delete from events    where truk_id  in (select id from trucks where status is distinct from 'aktif');
-- delete from positions where truk_id  in (select id from trucks where status is distinct from 'aktif');
-- delete from trips     where truk_id  in (select id from trucks where status is distinct from 'aktif');
-- delete from schedules where truck_id in (select id from trucks where status is distinct from 'aktif');
