# Handoff TruckCare (Circle T)

Terakhir diperbarui: 10 Sep 2026. Repo web lomba AI HackFest 2026
(submit 30 Sep). Scope repo ini: website + modul VPS (openclaw, simulasi,
telegram). Video demo + artikel lomba dikerjakan PIC lain, bukan di sini.

## Yang sudah jalan (per 10 Sep 2026)

- Landing Circle T, login **Supabase Auth (email/password)** + Turnstile,
  dashboard: Overview, Armada, Chat AI, Peta, Pengaduan, Analitik, Pengaturan.
- Form pengaduan publik `/pengaduan` (anonim, captcha Turnstile, insert lewat
  `POST /api/pengaduan` terverifikasi; policy insert publik dicabut).
- Chat AI: tool lokal deterministik (jadwal, statistik pengaduan, daftar
  tunggu, anomali solar, status armada + kartu, driver_truk dengan resolusi
  "truck itu", kondisi_truk per plat), fallback OpenClaw VPS. Konteks truk
  aktif dari halaman truk (?truk=PLAT): saran cepat menyertakan plat dan
  jawaban diarahkan ke truk itu. Riwayat persisten per user + tombol hapus
  riwayat. System prompt editable di Pengaturan (tabel `settings`, kunci
  `agent_prompt`).
- Bot Telegram: tabel Status Armada kolom Jenis + Plat (bukan penomoran
  "Truk NN"), link peta, `/list` dan `/detail <plat>`; tombol inline
  (Status Armada / Rekap Hari Ini / Pengaduan Menunggu); allowlist
  `bot_akses`. Rate limit 30/menit non-owner, owner bebas batas.
- Armada: 15 truk Jatim, jenis asli di list (6 CDD, 5 Fuso, 4 Trailer),
  shift 1 truk = 1 driver, detail lengkap (pengemudi, odometer & solar
  simulasi, progres hidup dari trip), filter status/jenis.
- Jadwal + Pengemudi sinkron simulasi (tabel `schedules` dipelihara sim;
  sim hanya menimpa jadwal ber-`actual_departure` miliknya, jadwal manual
  admin di halaman Jadwal tidak dihapus).
- Analitik 100% live: tren aduan, ngebut >80, waktu validasi riil, dan
  solar dari tabel `fuel_readings` (seed 90 hari, 5 anomali terdeteksi).
- Pengaduan: analisis otomatis berbasis kode (teman), kolom
  keputusan/catatan/analisis lengkap, UUID divalidasi di route.
- Pengaturan: tab navigasi (Akun / Bot Telegram / AI Agent), card akun.

## PR merged (#8-#37, sesi 9-10 Sep)

#8 keterangan model AI, #9 link peta bot + Turnstile pengaduan, #10
simulasi 15 truk + shift, #11 tabel pengaduan bot + captcha login +
system prompt, #12 sidebar expand, #13 statistik pengaduan chat, #14
pengaturan seksi, #15 foto bukti fixed, #16 sinkron jadwal, #17 tab
pengaturan, #18 detail armada, #19 logout sejajar, #20 kolom telegram +
guard Leaflet, #21 progres + hapus chat, #22 jenis truk, #23 solar +
pending chat, #25 fix 500 pengaduan, #27 closed (duplikat fix armada),
#28 status armada chat, #29 kartu armada chat, #30 driver chat, #31
analitik live, #32 BBM live.

#33 rate limit bot (owner bebas limit, default 30/menit) + cleanup widget
Turnstile saat unmount. #34 chat jawab per plat + bot pakai jenis+plat &
`/detail <plat>` + sim hanya hapus jadwal miliknya (jadwal manual admin
bertahan). #35 saran & jawaban chat mengikuti konteks truk aktif (?truk).
#36 tombol inline Telegram tidak menggantung (answerCallbackQuery lebih
dulu) + command `/list`. #37 jawaban kondisi_truk dibedakan per intent
(posisi / status / rekap / rangkum) + dataCard.

Aturan: PR minta izin dulu sebelum merge (sudah ada kesepakatan konteks
"merge kalau tidak konflik & sudah di commit terbaru").

## Env yang wajib ada

Lihat `.env.local.example`. Di Vercel Production wajib:
`OPENCLAW_ENDPOINT`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`,
`TURNSTILE_HOSTNAMES=circletindonesia.vercel.app`. Setiap tambah env:
Redeploy. Domain prod: `circletindonesia.vercel.app` (bukan
`truckcare.vercel.app` — itu app orang lain).

## VPS (`103.30.146.216:4422`, root)

- Service: antar-simulasi (15 truk + schedules + driver, JUMLAH=15),
  antar-skill (OpenClaw `:8765`), antar-telegram (tabel + link peta),
  antar-notif. Deploy manual: scp file → `/opt/antar/...` → restart.
- Sesi 9-10 Sep: antar-telegram & antar-simulasi sudah di-restart ke versi
  master terbaru (telegram index.js+tabel.js, simulasi index.js +
  seeded-random.js yang baru dari refactor armada teman).
- Batch berakhir 10 Sep: backup (dump DB, zip modul) lalu matikan rapi.
- AI lokal (Ollama model kecil) direkomendasikan, BELUM dipasang
  (tunggu koordinasi pemilik VPS). Spesifikasi: 4 vCPU, 3.8 GB RAM.

## SQL yang sudah dijalankan di Supabase

`schema.sql`, `rls.sql`, `storage.sql`, `seed.sql`, `bot-akses.sql`,
`chat-logs-user.sql`, `migrasi-plat-jatim.sql`, `seed-dummy-15-30.sql`
(15 truk + 30 driver), `cabut-insert-publik.sql`,
`pengaduan-keputusan.sql`, `pengaduan-catatan-array.sql`,
`pengaduan-analisis.sql`, `agent-settings.sql`, `fuel-readings.sql`
(1350 baris). BELUM dijalankan (jangan, tanpa koordinasi):
`trucks-jenis.sql` (membuat 20 truk, simulasi cuma 15 rute).

## Gotcha (pelajaran sesi ini)

- Cache Turbopack menyembunyikan error build — verifikasi jujur:
  `rm -rf .next` atau build tanpa `.env.local`.
- Halaman dynamic lolos build tapi 500 saat dibuka (kasus
  `/dashboard/armada` pasca-merge).
- PostgREST `max-rows` 1000 memotong diam-diam — paginasi bila >1000.
- Jangan `pkill -f <pola>` satu baris dengan perintah lain (bunuh shell
  sendiri). Jangan `git checkout <branch> -- <file>` sembarangan
  (menimpa worktree).
- Repo dipakai dua sesi bersamaan — commit cepat, jangan reset branch
  orang, jangan ambil alih branch `feat/*` yang bukan milikmu.
- Turnstile tidak render di browser otomatis (wajar); user asli normal.
- MCP Supabase terpasang di opencode (remote, OAuth) untuk kerja DB.
- Tombol inline Telegram terasa "mati" bila `answerCallbackQuery` dipanggil
  SETELAH memuat data (query + kirim pesan bisa lewat batas tunggu) — jawab
  callback lebih dulu, lalu kirim hasil.
- Refactor besar di master (mis. `4db6bcd` analitik + cache) bisa membuat
  PR fix lama pada file sama menjadi superseded — saat konflik, bandingkan
  kedua versi; kadang hasil yang benar adalah versi master terbaru.
- Dua PR yang mengubah file sama (`telegram/src/index.js`) perlu di-merge
  berurutan dan di-rebase/merge master antar-PR, bukan merge paralel.

## Rencana ke depan (belum dikerjakan)

- Login Google: TIDAK PERLU (keputusan user).
- Panel Aktivitas Agent + grafik kecepatan per truk: masih dummy.
- VPS batch berakhir 10 Sep: backup (dump DB, zip modul) lalu matikan rapi.
- Koordinasi dengan teman: `trucks-jenis.sql`, fitur analisis pengaduan
  miliknya (kolom evidence), dan halaman Pengemudi/Jadwal barunya.
