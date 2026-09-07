# Handoff TruckCare (Circle T)

Terakhir diperbarui: 7 Sep 2026. Repo web lomba AI HackFest 2026
(submit 30 Sep). Scope repo ini: website + modul VPS (openclaw, simulasi,
telegram). Video demo + artikel lomba dikerjakan PIC lain, bukan di sini.

## Yang sudah jalan

- Landing Circle T, login (masih dummy), dashboard: Overview, Armada,
  Chat AI, Peta, Pengaduan, Analitik, Pengaturan.
- Form pengaduan publik `/pengaduan` (anonim, upload foto opsional).
- Chat AI via OpenClaw di VPS (`OPENCLAW_ENDPOINT`), fallback luring.
- Bot Telegram: tombol Status Armada, Rekap Hari Ini, Pengaduan Menunggu;
  akses dibatasi allowlist tabel `bot_akses` (owner bootstrap via
  `TELEGRAM_CHAT_ID`).
- Analitik: tren + metrik pengaduan dan insiden ngebut live dari Supabase.
  Chart solar masih contoh (skema belum punya data BBM).

## PR (semua merged ke master per 7 Sep 2026 malam)

- #3 merged: data layer + form pengaduan publik.
- #4 merged: halaman peta live (+ fix review: kosongkan saat sumber mati,
  lastUpdate dari positions.ts).
- #5 merged: analitik live (+ fix review: CSV aman browser, komentar
  server-only).
- #6 merged: halaman Pengaturan + allowlist bot Telegram (+ fix review:
  API digate login, validasi UUID, bot lempar error).
- Temuan review Copilot di ketiganya sudah dibereskan sebelum merge.

## Env yang wajib ada

Lihat `.env.local.example` (web) dan `telegram/.env.example` (bot).
Di Vercel Production wajib: `OPENCLAW_ENDPOINT`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Setiap tambah env: Redeploy.

## VPS (aktif batch 2: 6-10 Sep)

- `103.30.146.216:4422`, root. Service: antar-simulasi, antar-skill
  (OpenClaw `:8765`), antar-telegram. Deploy bot: salin
  `telegram/src/index.js` ke `/opt/antar/telegram/src/`, restart service.
- 10 Sep: backup (dump DB, zip modul) lalu matikan rapi.

## SQL yang sudah dijalankan di Supabase

`schema.sql`, `rls.sql`, `storage.sql`, `seed.sql`, `bot-akses.sql`.

## Rencana ke depan (belum dikerjakan)

- Login Google via Supabase Auth (butuh OAuth client Google + enable
  provider di dashboard Supabase, lalu kode: `@supabase/ssr`, callback,
  middleware session beneran).
- Captcha Turnstile di form pengaduan + pindah insert lewat route
  `POST /api/pengaduan` terverifikasi, cabut policy
  `pengaduan_insert_publik`.
- Panel Aktivitas Agent + grafik kecepatan per truk: masih dummy.
