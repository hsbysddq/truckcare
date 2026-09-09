# VPS Deployment — TruckCare

Service di VPS: simulasi GPS, OpenClaw skill server, bot Telegram.

## Server

- IP: `103.30.146.216:4422` (root)
- OS: Rocky Linux 9.7
- Runtime: Python 3.9+, Node.js 18+

## Service List

| Service | Port | Systemd Unit | Fungsi |
|---------|------|--------------|--------|
| antar-simulasi | - | `antar-simulasi.service` | GPS simulation, kirim posisi ke Supabase |
| antar-skill | 8765 | `antar-skill.service` | OpenClaw HTTP server |
| antar-telegram | - | `antar-telegram.service` | Bot Telegram polling |

## Setup Awal

### 1. Clone & Install

```bash
cd /opt/antar
git clone <repo-url> .

# OpenClaw (Python, zero dependency)
# Sudah pakai stdlib saja, tidak perlu pip install

# Simulasi + Telegram (Node.js)
cd simulasi && npm install && cd ..
cd telegram && npm install && cd ..
```

### 2. Environment Variables

Copy `.env.example` ke `.env` di tiap modul, isi nilai:

```bash
# OpenClaw
cp openclaw/.env.example openclaw/.env
# Edit: isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENCLAW_API_KEY

# Simulasi
cp simulasi/.env.example simulasi/.env
# Edit: isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Telegram
cp telegram/.env.example telegram/.env
# Edit: isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
```

**Penting:** `OPENCLAW_API_KEY` harus sama di VPS (server.py) dan di Vercel (`.env.local`). Kalau kosong, auth nonaktif (hanya untuk dev).

### 3. Systemd Services

```bash
# Contoh unit file (sesuaikan path)
cat > /etc/systemd/system/antar-simulasi.service << 'EOF'
[Unit]
Description=Antar GPS Simulasi
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/antar/simulasi
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=5
EnvironmentFile=/opt/antar/simulasi/.env

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/antar-skill.service << 'EOF'
[Unit]
Description=Antar OpenClaw Skill Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/antar/openclaw
ExecStart=/usr/bin/python3 server.py
Restart=on-failure
RestartSec=5
EnvironmentFile=/opt/antar/openclaw/.env
Environment=HOST=0.0.0.0
Environment=PORT=8765

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/antar-telegram.service << 'EOF'
[Unit]
Description=Antar Telegram Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/antar/telegram
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=5
EnvironmentFile=/opt/antar/telegram/.env

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now antar-simulasi antar-skill antar-telegram
```

## Health Check

```bash
# OpenClaw (cek Supabase + LLM status)
curl http://localhost:8765/health
# → {"ok": true, "supabase": "ok", "llm": "configured"}

# Telegram bot
journalctl -u antar-telegram -f

# Simulasi
journalctl -u antar-simulasi -f
```

## Deploy Ulang

```bash
cd /opt/antar
git pull

# Restart service yang berubah
systemctl restart antar-skill    # kalau openclaw berubah
systemctl restart antar-telegram # kalau bot berubah
systemctl restart antar-simulasi # kalau simulasi berubah
```

## Logging

Semua service pakai structured JSON logging. Contoh filter:

```bash
# Lihat semua log OpenClaw
journalctl -u antar-skill -f | python3 -m json.tool

# Filter error saja
journalctl -u antar-skill -f | grep '"level":"ERROR"'
```

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Bot tidak merespon | Cek `TELEGRAM_BOT_TOKEN` valid, `/start` dari Telegram |
| Chat AI 401 | Pastikan `OPENCLAW_API_KEY` sama di VPS dan Vercel |
| Simulasi tidak gerak | Cek `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| Health check supabase: error | Cek koneksi VPS ke Supabase (`curl $SUPABASE_URL/rest/v1/trucks?select=id&limit=1`) |
