-- ============================================================
-- Circle T — Indeks performa untuk query dashboard.
-- Jalankan di Supabase SQL Editor. Idempotent (if not exists).
--
-- Sudah ada sebelumnya (tidak dibuat ulang di sini):
--   positions (truk_id, ts desc)        idx_positions_truk_ts   (schema.sql)
--   positions (trip_id, ts desc)        idx_positions_trip_ts   (schema.sql)
--   pengaduan (status, created_at desc) idx_pengaduan_status    (schema.sql)
--   pengaduan (deleted_at)              idx_pengaduan_deleted_at (pengaduan-keputusan.sql)
--   pengaduan (analysis_status)         idx_pengaduan_analysis_status (pengaduan-analisis.sql)
--   schedules (truck_id, planned_departure) + (planned_departure) (schedules.sql)
--   agent_runs (started_at desc)        idx_agent_runs_started_at (agent-runs.sql)
--   fuel_readings unique (truck_id, tanggal) (fuel-readings.sql)
--   drivers (truck_id)                  idx_drivers_truck_id (drivers-truck-id.sql)
--
-- Catatan nama kolom: tabel telemetri di skema ini bernama positions dengan
-- kolom (truk_id, ts), bukan telemetry (truck_id, recorded_at).
-- ============================================================

-- positions: urut waktu global (posisi terakhir, retensi simulator) dan
-- insiden ngebut (kecepatan > 80) yang dipakai Analitik.
create index if not exists idx_positions_ts
  on positions (ts desc);
create index if not exists idx_positions_ngebut_ts
  on positions (ts desc)
  where kecepatan > 80;

-- pengaduan: daftar dashboard (belum dihapus, terbaru dulu), tren harian
-- Analitik (tanggal), dan tautan ke truk/pengemudi.
create index if not exists idx_pengaduan_aktif_created
  on pengaduan (created_at desc)
  where deleted_at is null;
create index if not exists idx_pengaduan_tanggal
  on pengaduan (tanggal desc);
create index if not exists idx_pengaduan_plat
  on pengaduan (plat);
create index if not exists idx_pengaduan_truck_id
  on pengaduan (truck_id);
create index if not exists idx_pengaduan_driver_id
  on pengaduan (driver_id);

-- schedules: filter rentang (planned_arrival >= from) dan per pengemudi.
create index if not exists idx_schedules_driver_departure
  on schedules (driver_id, planned_departure desc);
create index if not exists idx_schedules_planned_arrival
  on schedules (planned_arrival);
create index if not exists idx_schedules_status
  on schedules (status)
  where status <> 'batal';

-- agent_runs: riwayat per pengaduan dan rata-rata durasi validasi harian.
create index if not exists idx_agent_runs_complaint
  on agent_runs (complaint_id, started_at);
create index if not exists idx_agent_runs_finished
  on agent_runs (finished_at desc)
  where finished_at is not null;

-- trips / events: trip berjalan per truk, peristiwa per truk.
create index if not exists idx_trips_truk_status
  on trips (truk_id, status, mulai desc);
create index if not exists idx_events_truk_ts
  on events (truk_id, ts desc);

-- fuel_readings: rentang tanggal untuk grafik solar.
create index if not exists idx_fuel_readings_tanggal
  on fuel_readings (tanggal desc);

-- trucks: daftar truk aktif urut nama.
create index if not exists idx_trucks_status_nama
  on trucks (status, nama);

-- Perbarui statistik planner setelah indeks dibuat.
analyze positions;
analyze pengaduan;
analyze schedules;
analyze agent_runs;
