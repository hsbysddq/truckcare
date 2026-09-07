-- ============================================================
-- Antar — Bucket foto pengaduan (Supabase Storage)
-- Jalankan di Supabase SQL Editor SETELAH schema.sql + rls.sql.
-- Form /pengaduan upload via anon key, jadi butuh policy publik.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('foto-pengaduan', 'foto-pengaduan', true)
on conflict (id) do nothing;

-- Publik boleh upload foto (anon key dari form)
drop policy if exists "foto_insert_publik" on storage.objects;
create policy "foto_insert_publik" on storage.objects
  for insert with check (bucket_id = 'foto-pengaduan');

-- Publik boleh baca (getPublicUrl)
drop policy if exists "foto_baca_publik" on storage.objects;
create policy "foto_baca_publik" on storage.objects
  for select using (bucket_id = 'foto-pengaduan');

-- Tulis/hapus selain insert hanya service role
drop policy if exists "foto_tulis_service" on storage.objects;
create policy "foto_tulis_service" on storage.objects
  for all using (auth.role() = 'service_role' and bucket_id = 'foto-pengaduan')
  with check (auth.role() = 'service_role' and bucket_id = 'foto-pengaduan');
