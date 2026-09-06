---
name: antar-armada
description: "Jawab pertanyaan soal armada truk Antar (posisi, ETA, keterlambatan, rekap) dan validasi pengaduan truk dari portal publik. Baca data dari Supabase, hitung ETA/keterlambatan secara deterministik, dan balas dalam Bahasa Indonesia."
metadata:
  openclaw:
    requires:
      - python3
    env:
      - SUPABASE_URL
      - SUPABASE_SERVICE_ROLE_KEY
---

# Antar Armada

Skill untuk AI Hackfest 2026: monitoring armada truk distribusi realtime (10 truk) dengan AI.

## Kemampuan

1. **Chat armada** — jawab pertanyaan pemilik: posisi truk, ETA, keterlambatan, rekap harian.
2. **Validasi pengaduan** — cek laporan truk dari portal publik terhadap data kecepatan/posisi
   nyata, putuskan valid/ditolak.

## Prinsip

- **Angka dari data, bukan dari LLM.** ETA & keterlambatan dihitung deterministik dari Supabase
  (rata-rata kecepatan, sisa jarak, waktu berhenti). LLM hanya merangkai kalimat.
- Selalu jawab dalam **Bahasa Indonesia**, ringkas dan ramah.
- Kalau data tidak tersedia, katakan jujur, jangan mengarang.

## Cara pakai

Semua lewat CLI tipis (`scripts/`), dipanggil OpenClaw saat ada tool call.

### Chat armada

```bash
python3 scripts/chat.py "truk 4 sampai mana?"
python3 scripts/chat.py "kenapa truk 4 telat?"
python3 scripts/chat.py "rekap perjalanan hari ini"
python3 scripts/chat.py "berapa banyak truk yang berhenti?"
```

Skrip membaca data dari Supabase (env `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`),
menghitung ETA/keterlambatan, lalu mencetak jawaban siap kirim.

### Validasi pengaduan

```bash
python3 scripts/validasi.py --pengaduan-id <uuid>
```

Skrip mengambil pengaduan + data kecepatan truk pada jam tersebut, lalu mencetak
`VALID` atau `DITOLAK` + alasan. Aturan:
- Plat tidak dikenal di armada → DITOLAK.
- Truk berhenti > 30 menit di jam yang dilaporkan → VALID (laporan "berhenti lama" cocok).
- Truk melaju normal tanpa peristiwa → VALID (laporan umum), tapi ditandai "tak ada anomali".
- Data tidak tersedia → VALID dengan catatan "tak bisa diverifikasi" (jangan blokir laporan).

## HTTP tipis (seam ke Next.js)

`OPENCLAW_ENDPOINT` di web menunjuk ke `openclaw/server.py` (stdlib saja,
Python 3.9+, tanpa auth, batasi di level jaringan):

```bash
HOST=0.0.0.0 PORT=8765 python3 server.py
```

Uji plumbing tanpa Supabase: `python3 test_server.py` (7 pemeriksaan).
Di rocky-server via Tailscale: `OPENCLAW_ENDPOINT=http://100.79.21.46:8765`.

## Keamanan

- Masukan (plat, deskripsi, id) **tidak tepercaya** — lewatkan sebagai argumen, jangan
  di-interpolasi ke shell. Skrip memakai `subprocess` dengan argumen terpisah, tidak ada shell kedua.
- Jangan pernah ekspos `SUPABASE_SERVICE_ROLE_KEY` ke output.
