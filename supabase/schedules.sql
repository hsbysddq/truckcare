-- ============================================================
-- Antar — Tabel schedules: rencana perjalanan vs realisasi.
-- Dibaca/ditulis halaman Jadwal lewat /api/schedules; dibandingkan dengan
-- telemetri (positions) oleh lib/schedule-analysis.js untuk mendeteksi
-- penyimpangan. Jalankan di Supabase SQL Editor SETELAH schema.sql.
-- ============================================================

create table if not exists schedules (
  id                 uuid primary key default gen_random_uuid(),
  truck_id           uuid not null references trucks(id) on delete cascade,
  driver_id          uuid null references drivers(id) on delete set null,
  origin             text not null,
  destination        text not null,
  planned_departure  timestamptz not null,
  planned_arrival    timestamptz not null,
  actual_departure   timestamptz null,
  actual_arrival     timestamptz null,
  status             text not null default 'dijadwalkan'
    check (status in ('dijadwalkan', 'berjalan', 'selesai', 'terlambat', 'batal')),
  cargo_type         text null,
  notes              text null,
  created_at         timestamptz not null default now(),
  constraint schedules_arrival_after_departure
    check (planned_arrival > planned_departure)
);

create index if not exists idx_schedules_truck_departure
  on schedules (truck_id, planned_departure);
create index if not exists idx_schedules_planned_departure
  on schedules (planned_departure);

-- Cegah dua jadwal aktif satu truk yang waktunya bertabrakan (jadwal batal
-- tidak dihitung). Aplikasi juga memeriksa bentrok sebelum menyimpan.
create extension if not exists btree_gist;
alter table schedules
  add constraint schedules_no_overlap
  exclude using gist (
    truck_id with =,
    tstzrange(planned_departure, planned_arrival, '[)') with &&
  ) where (status <> 'batal');

alter table schedules enable row level security;
-- Baca boleh anon (dashboard membaca via anon + RLS), tulis hanya service role.
create policy schedules_select_anon on schedules
  for select using (true);
