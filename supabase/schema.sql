-- ============================================================
-- Antar — Skema Supabase (Postgres)
-- Jalankan di Supabase SQL Editor, urut dari atas ke bawah.
-- ============================================================

-- ---------- MASTER ----------
create table if not exists trucks (
  id          uuid primary key default gen_random_uuid(),
  plat        text not null unique,
  nama        text not null,
  tipe        text,
  status      text not null default 'aktif',      -- aktif | nonaktif
  created_at  timestamptz not null default now()
);

create table if not exists drivers (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  no_hp       text,
  foto        text,
  rating      numeric(3,2) default 0,
  created_at  timestamptz not null default now()
);

-- ---------- PERJALANAN ----------
create table if not exists trips (
  id          uuid primary key default gen_random_uuid(),
  truk_id     uuid references trucks(id) on delete cascade,
  driver_id   uuid references drivers(id) on delete set null,
  asal        text not null,
  tujuan      text not null,
  waypoints   jsonb not null default '[]',        -- [{lat, lon, label, tiba_menit}]
  mulai       timestamptz not null default now(),
  selesai     timestamptz,
  status      text not null default 'berjalan',   -- berjalan | selesai | batal
  created_at  timestamptz not null default now()
);

-- ---------- POSISI REAL-TIME ----------
create table if not exists positions (
  id          bigint generated always as identity primary key,
  trip_id     uuid references trips(id) on delete cascade,
  truk_id     uuid references trucks(id) on delete cascade,
  lat         double precision not null,
  lon         double precision not null,
  kecepatan   double precision not null default 0,   -- km/jam
  status      text not null default 'jalan',         -- jalan | berhenti
  ts          timestamptz not null default now()
);

create index if not exists idx_positions_truk_ts on positions (truk_id, ts desc);
create index if not exists idx_positions_trip_ts on positions (trip_id, ts desc);

-- ---------- PERISTIWA ----------
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references trips(id) on delete cascade,
  truk_id     uuid references trucks(id) on delete cascade,
  jenis       text not null,          -- berhenti_lama | penyimpangan | tiba | muat | bongkar
  pesan       text,
  ts          timestamptz not null default now()
);

-- ---------- PENGADUAN PUBLIK ----------
create table if not exists pengaduan (
  id          uuid primary key default gen_random_uuid(),
  plat        text not null,
  tanggal     date not null default current_date,
  jam         time,
  deskripsi   text not null,
  foto_url    text,
  status      text not null default 'menunggu',  -- menunggu | valid | ditolak
  alasan      text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_pengaduan_status on pengaduan (status, created_at desc);

-- ---------- CHAT LOG ----------
create table if not exists chat_logs (
  id          uuid primary key default gen_random_uuid(),
  tanya       text not null,
  jawab       text not null,
  mode        text not null default 'llm',        -- llm | luring
  ts          timestamptz not null default now()
);
