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
create policy "trucks_baca_publik"   on trucks   for select using (true);
create policy "trucks_tulis_service" on trucks   for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- drivers: publik baca, tulis service
create policy "drivers_baca_publik"  on drivers  for select using (true);
create policy "drivers_tulis_service" on drivers for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- trips: publik baca (peta rute), tulis service
create policy "trips_baca_publik"    on trips    for select using (true);
create policy "trips_tulis_service"  on trips    for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- positions: publik baca (realtime peta), tulis service
create policy "positions_baca_publik"  on positions for select using (true);
create policy "positions_tulis_service" on positions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- events: publik baca, tulis service
create policy "events_baca_publik"    on events   for select using (true);
create policy "events_tulis_service"  on events   for all    using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- pengaduan: PUBLIK BISA INSERT (portal tanpa login), baca untuk semua, update hanya service
create policy "pengaduan_insert_publik" on pengaduan for insert with check (true);
create policy "pengaduan_baca_publik"   on pengaduan for select using (true);
create policy "pengaduan_update_service" on pengaduan for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- chat_logs: tulis service (bisa juga publik kalau mau log chat anonim, tapi MVP service saja)
create policy "chat_tulis_service" on chat_logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------- REALTIME ----------
-- Aktifkan Realtime untuk tabel positions & events supaya peta bisa subscribe.
alter publication supabase_realtime add table positions;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table trips;
