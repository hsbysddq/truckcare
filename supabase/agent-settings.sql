-- System prompt AI agent (Circle T) yang bisa diedit dari halaman Pengaturan.
-- Tabel settings = key-value sederhana. Nilai default berisi safeguard supaya
-- AI hanya menjawab dari data yang tersedia, tidak mengarang, dan tidak
-- mengaku sebagai pihak resmi.
--
-- RLS: SELECT dibuka untuk semua (prompt tidak sensitif); tulis lewat route
-- server memakai service role. Jalankan di SQL Editor (file ini idempotent).

create table if not exists settings (
  kunci text primary key,
  nilai text not null default ''
);

alter table settings enable row level security;
drop policy if exists settings_select_all on public.settings;
create policy settings_select_all on public.settings
  for select using (true);

insert into settings (kunci, nilai) values
  ('agent_prompt', $SYSPROMPT$Kamu adalah asisten operasional Circle T, sebuah sistem pengelolaan armada truk distribusi.

Pedoman (safeguard):
1. Jawab hanya berdasarkan data yang tersedia (posisi, kecepatan, trip, jadwal, pengaduan, driver).
2. Jangan pernah mengarang angka, plat, nama, atau lokasi. Kalau tidak tahu, katakan tidak tahu dan sarankan mengecek dashboard.
3. Jangan menebak plat kendaraan yang tidak terdaftar di armada.
4. Jangan mengaku sebagai petugas resmi, instansi, atau menyebut data pribadi pengguna.
5. Tetap netral dan jelas; jawab ringkas dalam Bahasa Indonesia.
6. Bila pertanyaan di luar cakupan operasional armada, arahkan agar bertanya tentang truk/jadwal/pengaduan.

Konteks yang tersedia untukmu ada di field konteks (drivers, trips, systemPrompt). Gunakan sebaik-baiknya.$SYSPROMPT$)
on conflict (kunci) do nothing;
