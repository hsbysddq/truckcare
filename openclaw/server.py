#!/usr/bin/env python3
"""HTTP tipis di depan skill OpenClaw Antar — satu-satunya seam yang hilang
antara Next.js (`OPENCLAW_ENDPOINT`) dan skrip CLI (`scripts/`).

Dipakai:
    python3 server.py                 # 127.0.0.1:8765
    HOST=0.0.0.0 PORT=8765 python3 server.py   # di VPS lomba

Endpoint:
    GET  /health                  -> {"ok": true, "supabase": "ok"|"error", "llm": "configured"|"not_configured"}
    POST /api/chat                {"pesan": "..."} -> {"jawaban": "...", "mode": "llm"|"luring"}
    POST /api/validasi-pengaduan  {"pengaduan_id": "<uuid>"} (atau {"pengaduan": {"id": ...}})
                                  -> {"status": "valid"|"ditolak", "alasan": "..."}

Auth: X-API-KEY header wajib cocok dengan OPENCLAW_API_KEY env. Kosong = no auth (dev).
"""

import json
import os
import signal
import subprocess
import sys
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

from log import get_logger

log = get_logger("openclaw-server")

SINI = os.path.dirname(os.path.abspath(__file__))
SKRIP = os.path.join(SINI, "skills", "antar-armada", "scripts")
PYTHON = os.environ.get("OPENCLAW_PYTHON", sys.executable or "python3")
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8765"))
TIMEOUT_CHAT = int(os.environ.get("TIMEOUT_CHAT", "25"))
TIMEOUT_VALIDASI = int(os.environ.get("TIMEOUT_VALIDASI", "15"))
MAKS_BADAN = 64 * 1024  # tolak body > 64 KB
# Auth: kalau OPENCLAW_API_KEY di-set, semua request wajib bawa header ini.
API_KEY = os.environ.get("OPENCLAW_API_KEY", "")
# LLM hanya merangkai kalimat; angka dan fakta selalu dari skrip deterministik.
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "").rstrip("/")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "")
LLM_TIMEOUT = int(os.environ.get("LLM_TIMEOUT", "10"))

httpd = None


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
    if selesai.returncode != 0:
        log.error(
            "skrip gagal",
            extra={
                "rc": selesai.returncode,
                "stderr": baris_err[-1] if baris_err else "-",
            },
        )
    return (
        selesai.returncode,
        (selesai.stdout or "").strip(),
        "skrip gagal, lihat log service",
    )


def cek_supabase():
    """Cek koneksi Supabase (read-only)."""
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        return "not_configured"
    try:
        req = urllib.request.Request(
            f"{url}/rest/v1/trucks?select=id&limit=1",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            r.read()
        return "ok"
    except Exception:
        return "error"


def rangkai(pertanyaan, jawaban):
    """Minta LLM merangkai ulang jawaban template jadi bahasa natural."""
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
        data, _ = json.JSONDecoder().raw_decode(mentah)
        teks = (data["choices"][0]["message"].get("content") or "").strip()
        return teks or None
    except Exception as e:
        log.warning("LLM gagal, pakai template", extra={"error": str(e)})
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

    def _cek_auth(self):
        """Validasi X-API-KEY kalau OPENCLAW_API_KEY di-set."""
        if not API_KEY:
            return True
        return self.headers.get("X-API-KEY") == API_KEY

    def log_message(self, format, *args):
        log.info(
            "request",
            extra={
                "client": self.address_string(),
                "method": args[0] if args else "",
                "path": args[1] if len(args) > 1 else "",
                "status": args[2] if len(args) > 2 else "",
            },
        )

    def do_GET(self):
        jalur = urlparse(self.path).path
        if jalur == "/health":
            supabase = cek_supabase()
            llm = (
                "configured"
                if (LLM_BASE_URL and LLM_API_KEY and LLM_MODEL)
                else "not_configured"
            )
            self._kirim(200, {"ok": True, "supabase": supabase, "llm": llm})
        else:
            self._kirim(404, {"error": "tidak dikenal"})

    def do_POST(self):
        if not self._cek_auth():
            log.warning("auth gagal", extra={"client": self.address_string()})
            self._kirim(401, {"error": "X-API-KEY tidak valid"})
            return
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
        awal = time.monotonic()
        rc, keluar, err = jalankan(["chat.py", pesan], TIMEOUT_CHAT)
        durasi_ms = round((time.monotonic() - awal) * 1000)
        if rc != 0:
            log.error("chat gagal", extra={"rc": rc, "durasi_ms": durasi_ms})
            self._kirim(502, {"error": "agent gagal: %s" % (err or "skrip gagal")})
            return
        kalimat = rangkai(pesan, keluar)
        mode = "llm" if kalimat else "luring"
        log.info("chat selesai", extra={"mode": mode, "durasi_ms": durasi_ms})
        self._kirim(200, {"jawaban": kalimat or keluar, "mode": mode})

    def _validasi(self):
        badan = self._baca_json() or {}
        pid = badan.get("pengaduan_id") or badan.get("id")
        if not pid and isinstance(badan.get("pengaduan"), dict):
            pid = badan["pengaduan"].get("id")
        if not pid or not isinstance(pid, str):
            self._kirim(400, {"error": "pengaduan_id wajib"})
            return
        awal = time.monotonic()
        rc, keluar, err = jalankan(
            ["validasi.py", "--pengaduan-id", pid], TIMEOUT_VALIDASI
        )
        durasi_ms = round((time.monotonic() - awal) * 1000)
        if rc != 0:
            log.error("validasi gagal", extra={"rc": rc, "durasi_ms": durasi_ms})
            self._kirim(502, {"error": "agent gagal: %s" % (err or "skrip gagal")})
            return
        baris = keluar.splitlines()
        pertama = baris[0].strip().upper() if baris else ""
        status = "ditolak" if pertama == "DITOLAK" else "valid"
        alasan = "\n".join(baris[1:]).strip() or None
        log.info("validasi selesai", extra={"status": status, "durasi_ms": durasi_ms})
        self._kirim(200, {"status": status, "alasan": alasan})


def shutdown(sig, frame):
    global httpd
    log.info("shutdown dimulai", extra={"signal": sig})
    if httpd:
        httpd.shutdown()
    log.info("shutdown selesai")


def main():
    global httpd
    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)
    httpd = HTTPServer((HOST, PORT), Tangan)
    log.info("server mulai", extra={"host": HOST, "port": PORT, "skrip": SKRIP})
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        log.info("server berhenti")


if __name__ == "__main__":
    main()
