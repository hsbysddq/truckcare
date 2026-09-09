-- ============================================================
-- Circle T — Agregasi di sisi database untuk dashboard.
-- Dipanggil lewat PostgREST RPC (POST /rest/v1/rpc/<nama>) oleh
-- lib/supabase.js. Yang dikirim ke aplikasi hanya baris hasil GROUP BY,
-- bukan ratusan ribu baris telemetri mentah.
-- Jalankan di Supabase SQL Editor SETELAH schema.sql (+ migrasi pengaduan,
-- agent-runs.sql, fuel-readings.sql) dan indeks-performa.sql. Idempotent.
--
-- Bila fungsi ini belum ada, aplikasi otomatis memakai jalur cadangan
-- (baris mentah dibatasi rentang waktu), jadi urutan deploy aman.
-- ============================================================

-- Posisi terakhir tiap truk aktif: 15 probe indeks (truk_id, ts desc),
-- bukan mengurutkan seluruh tabel positions.
create or replace function posisi_terakhir()
returns table (
  truk_id   uuid,
  lat       double precision,
  lon       double precision,
  kecepatan double precision,
  status    text,
  ts        timestamptz
)
language sql stable
as $$
  select p.truk_id, p.lat, p.lon, p.kecepatan, p.status, p.ts
  from trucks t
  cross join lateral (
    select truk_id, lat, lon, kecepatan, status, ts
    from positions
    where truk_id = t.id
    order by ts desc
    limit 1
  ) p
  where t.status = 'aktif';
$$;

-- Insiden ngebut per (hari WIB, jam WIB, truk): jumlah + titik rata-rata.
-- p_hari = jendela ke belakang (periode + pembanding periode sebelumnya).
create or replace function analitik_ngebut(p_hari int default 180, p_batas numeric default 80)
returns table (
  tanggal date,
  jam     int,
  truk_id uuid,
  jumlah  bigint,
  lat     double precision,
  lon     double precision
)
language sql stable
as $$
  select
    (p.ts at time zone 'Asia/Jakarta')::date            as tanggal,
    extract(hour from p.ts at time zone 'Asia/Jakarta')::int as jam,
    p.truk_id,
    count(*)                                             as jumlah,
    avg(p.lat)                                           as lat,
    avg(p.lon)                                           as lon
  from positions p
  join trucks t on t.id = p.truk_id and t.status = 'aktif'
  where p.kecepatan > p_batas
    and p.ts >= now() - make_interval(days => p_hari)
  group by 1, 2, 3
  order by 1 desc, 2;
$$;

-- Pengaduan per (tanggal, plat, status, pemutus): jumlah + rata-rata detik
-- validasi (decided_at - created_at). Baris soft-delete tidak ikut.
create or replace function analitik_pengaduan_harian(p_hari int default 180)
returns table (
  tanggal    date,
  plat       text,
  status     text,
  decided_by text,
  jumlah     bigint,
  rata_detik numeric
)
language sql stable
as $$
  select
    tanggal, plat, status, decided_by,
    count(*) as jumlah,
    avg(extract(epoch from (decided_at - created_at)))
      filter (where decided_at is not null and decided_at > created_at) as rata_detik
  from pengaduan
  where deleted_at is null
    and tanggal >= current_date - p_hari
  group by 1, 2, 3, 4
  order by 1 desc;
$$;

-- Rata-rata durasi run agent per hari (agent_runs hanya bisa dibaca service
-- role; fungsi ini security definer supaya anon hanya melihat agregatnya).
create or replace function analitik_validasi_harian(p_hari int default 180)
returns table (
  tanggal    date,
  jumlah     bigint,
  rata_detik numeric
)
language sql stable security definer
set search_path = public
as $$
  select
    (finished_at at time zone 'Asia/Jakarta')::date as tanggal,
    count(*) as jumlah,
    avg(extract(epoch from (finished_at - started_at))) as rata_detik
  from agent_runs
  where finished_at is not null
    and finished_at >= now() - make_interval(days => p_hari)
  group by 1
  order by 1 desc;
$$;

grant execute on function posisi_terakhir() to anon, authenticated, service_role;
grant execute on function analitik_ngebut(int, numeric) to anon, authenticated, service_role;
grant execute on function analitik_pengaduan_harian(int) to anon, authenticated, service_role;
grant execute on function analitik_validasi_harian(int) to anon, authenticated, service_role;

-- Cek cepat:
-- select * from posisi_terakhir();
-- select count(*) from analitik_ngebut(181);
-- select count(*) from analitik_pengaduan_harian(181);
