-- ============================================================
-- Antar — Allowlist akses bot Telegram
-- Jalankan di Supabase SQL Editor SETELAH schema.sql + rls.sql.
-- Bot dan API dashboard baca/tulis tabel ini pakai service role.
-- RLS aktif TANPA policy publik: anon ditolak, service_role bypass.
-- TELEGRAM_CHAT_ID di .env tetap jadi owner bootstrap anti-lockout.
-- ============================================================

create table if not exists bot_akses (
  id          uuid primary key default gen_random_uuid(),
  chat_id     text not null unique,
  nama        text,
  created_at  timestamptz not null default now()
);

alter table bot_akses enable row level security;
