-- ============================================================
-- Antar — Row Level Security (RLS) + Realtime
-- Model keamanan MVP:
--   - Publik (anon): bisa BACA posisi/events/trips (untuk peta),
--     dan BISA INSERT pengaduan (portal publik tanpa login).
--   - Tulis data master & validasi: service role (server-side only).
-- ============================================================

-- ---------- ENABLE RLS ----------
alter table trucks      enable row level security;
alter table drivers     enable row level security;
alter table trips       enable row level security;
alter table positions   enable row level security;
alter table events      enable row level security;
alter table pengaduan   enable row level security;
alter table chat_logs   enable row level security;

-- ---------- KEBIJAKAN ----------

-- trucks: publik baca (untuk peta/list), tulis hanya service role
drop policy if exists "trucks_baca_publik" on trucks;
create policy "trucks_baca_publik"   on trucks   for select using (true);
drop policy if exists "trucks_tulis_service" on trucks;
create policy "trucks_tulis_service" on trucks   for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- drivers: publik baca, tulis service
drop policy if exists "drivers_baca_publik" on drivers;
create policy "drivers_baca_publik"  on drivers  for select using (true);
drop policy if exists "drivers_tulis_service" on drivers;
create policy "drivers_tulis_service" on drivers for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- trips: publik baca (peta rute), tulis service
drop policy if exists "trips_baca_publik" on trips;
create policy "trips_baca_publik"    on trips    for select using (true);
drop policy if exists "trips_tulis_service" on trips;
create policy "trips_tulis_service"  on trips    for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- positions: publik baca (realtime peta), tulis service
drop policy if exists "positions_baca_publik" on positions;
create policy "positions_baca_publik"  on positions for select using (true);
drop policy if exists "positions_tulis_service" on positions;
create policy "positions_tulis_service" on positions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- events: publik baca, tulis service
drop policy if exists "events_baca_publik" on events;
create policy "events_baca_publik"    on events   for select using (true);
drop policy if exists "events_tulis_service" on events;
create policy "events_tulis_service"  on events   for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- pengaduan: PUBLIK BISA INSERT (portal tanpa login), baca untuk semua, update hanya service
drop policy if exists "pengaduan_insert_publik" on pengaduan;
create policy "pengaduan_insert_publik" on pengaduan for insert with check (true);
drop policy if exists "pengaduan_baca_publik" on pengaduan;
create policy "pengaduan_baca_publik"   on pengaduan for select using (true);
drop policy if exists "pengaduan_update_service" on pengaduan;
create policy "pengaduan_update_service" on pengaduan for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- chat_logs: tulis service (bisa juga publik kalau mau log chat anonim, tapi MVP service saja)
drop policy if exists "chat_tulis_service" on chat_logs;
create policy "chat_tulis_service" on chat_logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------- REALTIME ----------
-- Aktifkan Realtime untuk tabel positions & events supaya peta bisa subscribe.
-- Bungkus DO block supaya aman di-rerun (add table tidak idempotent).
do $$
begin
  alter publication supabase_realtime add table positions;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table events;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table trips;
exception when duplicate_object then null;
end $$;
