#!/usr/bin/env python3
"""HTTP tipis di depan skill OpenClaw Antar — satu-satunya seam yang hilang
antara Next.js (`OPENCLAW_ENDPOINT`) dan skrip CLI (`scripts/`).

Dipakai:
    python3 server.py                 # 127.0.0.1:8765
    HOST=0.0.0.0 PORT=8765 python3 server.py   # di VPS lomba

Endpoint:
    GET  /health                  -> {"ok": true}
    POST /api/chat                {"pesan": "..."} -> {"jawaban": "...", "mode": "llm"|"luring"}
    POST /api/validasi-pengaduan  {"pengaduan_id": "<uuid>"} (atau {"pengaduan": {"id": ...}})
                                  -> {"status": "valid"|"ditolak", "alasan": "..."}

Hanya stdlib, jalan di Python 3.9+ (rocky-server). Tidak ada auth:
akses dibatasi di level jaringan (Tailscale / firewall VPS), bukan di sini.
ponytail: kalau nanti butuh publik, taruh reverse proxy + token di depan,
jangan tambah auth ke file ini.
"""

import json
import os
import subprocess
import sys
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

SINI = os.path.dirname(os.path.abspath(__file__))
SKRIP = os.path.join(SINI, "skills", "antar-armada", "scripts")
PYTHON = os.environ.get("OPENCLAW_PYTHON", sys.executable or "python3")
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8765"))
TIMEOUT_CHAT = int(os.environ.get("TIMEOUT_CHAT", "25"))
TIMEOUT_VALIDASI = int(os.environ.get("TIMEOUT_VALIDASI", "15"))
MAKS_BADAN = 64 * 1024  # tolak body > 64 KB
# LLM hanya merangkai kalimat; angka dan fakta selalu dari skrip deterministik.
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "").rstrip("/")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "")
LLM_TIMEOUT = int(os.environ.get("LLM_TIMEOUT", "10"))


def jalankan(argumen, timeout):
    """Jalankan skrip CLI tanpa shell; kembalikan (rc, stdout, stderr_akhir)."""
    try:
        selesai = subprocess.run(
            [PYTHON] + argumen,
            cwd=SKRIP,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return None, "", "skrip kehabisan waktu"
    baris_err = (selesai.stderr or "").strip().splitlines()
    # detail hanya di log service, ke klien pesan generik (jangan bocorkan env/URL/kunci)
    if selesai.returncode != 0:
        sys.stderr.write(
            "skrip gagal rc=%d: %s\n"
            % (selesai.returncode, baris_err[-1] if baris_err else "-")
        )
    return (
        selesai.returncode,
        (selesai.stdout or "").strip(),
        "skrip gagal, lihat log service",
    )


def rangkai(pertanyaan, jawaban):
    """Minta LLM merangkai ulang jawaban template jadi bahasa natural.

    Kembalikan string, atau None kalau LLM tak dikonfigurasi / gagal.
    Angka dan fakta tidak boleh berubah: prompt melarang, template jadi jaring.
    """
    if not (LLM_BASE_URL and LLM_API_KEY and LLM_MODEL):
        return None
    badan = {
        "model": LLM_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Kamu asisten armada Circle T. Rangkai ulang JAWABAN menjadi "
                    "bahasa Indonesia natural yang ringkas (maks 3 kalimat). "
                    "JANGAN ubah angka, nama, plat nomor, atau fakta apa pun."
                ),
            },
            {
                "role": "user",
                "content": "PERTANYAAN: %s\nJAWABAN: %s" % (pertanyaan, jawaban),
            },
        ],
        "max_tokens": 300,
    }
    try:
        req = urllib.request.Request(
            LLM_BASE_URL + "/chat/completions",
            data=json.dumps(badan).encode(),
            headers={
                "Authorization": "Bearer " + LLM_API_KEY,
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=LLM_TIMEOUT) as r:
            mentah = r.read().decode()
        # 9router menempelkan "data: [DONE]" di ekor; ambil objek JSON pertama.
        data, _ = json.JSONDecoder().raw_decode(mentah)
        teks = (data["choices"][0]["message"].get("content") or "").strip()
        return teks or None
    except Exception as e:  # ponytail: jatuh ke template, detail cuma di log
        sys.stderr.write("LLM gagal, pakai template: %s\n" % e)
        return None


class Tangan(BaseHTTPRequestHandler):
    server_version = "AntarSkill/1.0"

    def _kirim(self, kode, objek):
        badan = json.dumps(objek).encode()
        self.send_response(kode)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(badan)))
        self.end_headers()
        self.wfile.write(badan)

    def _baca_json(self):
        try:
            panjang = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return None
        if panjang <= 0 or panjang > MAKS_BADAN:
            return None
        try:
            return json.loads(self.rfile.read(panjang).decode())
        except (ValueError, UnicodeDecodeError):
            return None

    def log_message(self, format, *args):  # log satu baris ke stderr
        sys.stderr.write("%s %s\n" % (self.address_string(), format % args))

    def do_GET(self):
        if urlparse(self.path).path == "/health":
            self._kirim(200, {"ok": True})
        else:
            self._kirim(404, {"error": "tidak dikenal"})

    def do_POST(self):
        jalur = urlparse(self.path).path
        if jalur == "/api/chat":
            self._chat()
        elif jalur == "/api/validasi-pengaduan":
            self._validasi()
        else:
            self._kirim(404, {"error": "tidak dikenal"})

    def _chat(self):
        badan = self._baca_json()
        pesan = (badan or {}).get("pesan")
        if not pesan or not isinstance(pesan, str):
            self._kirim(400, {"error": "pesan wajib diisi"})
            return
        rc, keluar, err = jalankan(["chat.py", pesan], TIMEOUT_CHAT)
        if rc != 0:
            self._kirim(502, {"error": "agent gagal: %s" % (err or "skrip gagal")})
            return
        # LLM merangkai ulang; gagal/mati = pakai jawaban template (mode luring).
        kalimat = rangkai(pesan, keluar)
        if kalimat:
            self._kirim(200, {"jawaban": kalimat, "mode": "llm"})
        else:
            self._kirim(200, {"jawaban": keluar, "mode": "luring"})

    def _validasi(self):
        badan = self._baca_json() or {}
        pid = badan.get("pengaduan_id") or badan.get("id")
        if not pid and isinstance(badan.get("pengaduan"), dict):
            pid = badan["pengaduan"].get("id")
        if not pid or not isinstance(pid, str):
            self._kirim(400, {"error": "pengaduan_id wajib"})
            return
        rc, keluar, err = jalankan(
            ["validasi.py", "--pengaduan-id", pid], TIMEOUT_VALIDASI
        )
        if rc != 0:
            self._kirim(502, {"error": "agent gagal: %s" % (err or "skrip gagal")})
            return
        baris = keluar.splitlines()
        pertama = baris[0].strip().upper() if baris else ""
        status = "ditolak" if pertama == "DITOLAK" else "valid"
        alasan = "\n".join(baris[1:]).strip() or None
        self._kirim(200, {"status": status, "alasan": alasan})


def main():
    httpd = HTTPServer((HOST, PORT), Tangan)
    print(
        "Skill server Antar di http://%s:%d (skrip: %s)" % (HOST, PORT, SKRIP),
        flush=True,
    )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
