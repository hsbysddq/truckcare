-- ============================================================
-- Antar — Tabel agent_runs: jejak setiap tugas yang dijalankan AI agent.
-- Dibaca panel "Aktivitas Agent" di Chat AI lewat GET /api/agent-activity
-- (service role). Diisi oleh agent (OpenClaw/VPS) tiap kali memproses
-- pengaduan, mengirim rekap Telegram, atau menjalankan pengecekan rutin.
-- Jalankan di Supabase SQL Editor SETELAH schema.sql + rls.sql.
-- ============================================================

create table if not exists agent_runs (
  id            uuid primary key default gen_random_uuid(),
  trigger_type  text not null check (trigger_type in ('otomatis', 'pengguna')),
  complaint_id  uuid null references pengaduan(id) on delete set null,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz null,
  outcome       text not null check (
    outcome in ('valid', 'ditolak', 'perlu-ditinjau', 'terkirim', 'selesai', 'gagal', 'berjalan')
  ),
  notes         text null
);

create index if not exists idx_agent_runs_started_at on agent_runs (started_at desc);

-- Hanya service role yang boleh baca/tulis; anon tidak punya policy.
alter table agent_runs enable row level security;
