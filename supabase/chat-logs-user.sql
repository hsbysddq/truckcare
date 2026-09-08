-- ============================================================
-- Antar — Migration: chat_logs per user
-- Jalankan di Supabase SQL Editor SETELAH schema.sql + rls.sql.
-- Riwayat chat AI kini terikat ke akun Supabase Auth yang login.
-- ============================================================

alter table chat_logs
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_chat_logs_user_ts on chat_logs (user_id, ts desc);
