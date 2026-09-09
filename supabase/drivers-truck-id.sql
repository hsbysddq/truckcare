-- ============================================================
-- Circle T — Migration: pengemudi tetap per truk (drivers.truck_id).
-- Identitas armada didefinisikan di scripts/fleet-data.js (15 truk + 15
-- pengemudi dengan id tetap); scripts/seed.js mengisi kolom ini lewat upsert.
-- Siapa yang sedang membawa truk pada suatu waktu tetap dibaca dari jadwal
-- (schedules); kolom ini adalah penugasan default.
-- Jalankan di Supabase SQL Editor SETELAH schema.sql. Idempotent.
-- ============================================================

alter table drivers
  add column if not exists truck_id uuid null references trucks(id) on delete set null;

create index if not exists idx_drivers_truck_id on drivers (truck_id);

comment on column drivers.truck_id is 'Truk tetap pengemudi ini (scripts/fleet-data.js). Null bila tidak ditugaskan.';
