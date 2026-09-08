# Handoff TruckCare (Circle T)

Terakhir diperbarui: 8 Sep 2026. Repo web lomba AI HackFest 2026
(submit 30 Sep). Scope repo ini: website + modul VPS (openclaw, simulasi,
telegram). Video demo + artikel lomba dikerjakan PIC lain, bukan di sini.

## Yang sudah jalan

- Landing Circle T, login **Supabase Auth (email/password)**, dashboard:
  Overview, Armada, Chat AI, Peta, Pengaduan, Analitik, Pengaturan.
- Form pengaduan publik `/pengaduan` (anonim, upload foto opsional).
- Chat AI via OpenClaw di VPS (`OPENCLAW_ENDPOINT`), fallback luring.
  - Riwayat chat **persisten per user** (kolom `user_id` di `chat_logs`),
    `GET /api/agent/chat` mengembalikan history user login.
  - Konteks armada (driver + trip berjalan) disertakan ke OpenClaw supaya
    jawaban AI menyebut data aktual (best-effort: gagal = chat tetap jalan).
- Bot Telegram: tombol Status Armada, Rekap Hari Ini, Pengaduan Menunggu;
  akses dibatasi allowlist tabel `bot_akses` (owner bootstrap via
  `TELEGRAM_CHAT_ID`). Status Armada tampil sebagai tabel monospace
  (`<pre>`, fallback teks polos kalau parse HTML gagal).
  Logika data bot disamakan dengan web: ambang jalan > 5 km/jam, limit
  positions 200, trip berjalan pilih `mulai` terbaru per truk.
- Sinkron bot vs peta (8 Sep): `baca()` pakai `cache: no-store`,
  `/api/trucks` = `force-dynamic`, Overview polling 5 detik seperti Peta.
  Catatan: ID 19 digit (`53709590...`) bukan chat ID valid (user ID cuma
  9-10 digit) — ambil ID benar dari log `journalctl -u antar-telegram`.
- Analitik: tren + metrik pengaduan dan insiden ngebut live dari Supabase.
  Chart solar masih contoh (skema belum punya data BBM).
- **Akun login:** `admin@circlet.id` / `circleT2026` (data dummy, ganti bebas).
- **Pengaturan OpenClaw:** tombol Periksa Ulang Koneksi + panduan langkah
  non-teknis bila terputus.
- Sidebar collapsible (icon-only), logout Supabase, nama user asli dari session.

## PR (semua merged ke master per 8 Sep 2026)

- #3 merged: data layer + form pengaduan publik.
- #4 merged: halaman peta live (+ fix review: kosongkan saat sumber mati,
  lastUpdate dari positions.ts).
- #5 merged: analitik live (+ fix review: CSV aman browser, komentar
  server-only).
- #6 merged: halaman Pengaturan + allowlist bot Telegram (+ fix review:
  API digate login, validasi UUID, bot lempar error).
- #7 merged: login Supabase Auth + riwayat chat per user + status VPS.
  Temuan review Copilot di ketiganya sudah dibereskan sebelum merge.

## Env yang wajib ada

Lihat `.env.local.example` (web) dan `telegram/.env.example` (bot).
Di Vercel Production wajib: `OPENCLAW_ENDPOINT`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Setiap tambah env: Redeploy.

## VPS (aktif batch 2: 6-10 Sep)

- `103.30.146.216:4422`, root. Service: antar-simulasi, antar-skill
  (OpenClaw `:8765`), antar-telegram. Deploy bot: salin
  `telegram/src/index.js` + `telegram/src/tabel.js` (baru, 8 Sep) ke
  `/opt/antar/telegram/src/`, restart service.
- 10 Sep: backup (dump DB, zip modul) lalu matikan rapi.

## SQL yang sudah dijalankan di Supabase

`schema.sql`, `rls.sql`, `storage.sql`, `seed.sql`, `bot-akses.sql`,
`chat-logs-user.sql` (kolom `user_id` + index di `chat_logs`).

## Rencana ke depan (belum dikerjakan)

- Login Google via Supabase Auth (butuh OAuth client Google + enable
  provider di dashboard Supabase, lalu kode: `@supabase/ssr`, callback,
  middleware session beneran).
- Captcha Turnstile di form pengaduan + pindah insert lewat route
  `POST /api/pengaduan` terverifikasi, cabut policy
  `pengaduan_insert_publik`.
- Panel Aktivitas Agent + grafik kecepatan per truk: masih dummy.