#!/usr/bin/env python3
"""Uji plumbing openclaw/server.py tanpa Supabase (tanpa jaringan ke DB).

Jalankan: python3 test_server.py
(menyalakan server di 127.0.0.1:8765 sesaat, lalu menembak endpointnya)
"""

import json
import os
import subprocess
import sys
import time
import urllib.request

SINI = os.path.dirname(os.path.abspath(__file__))
PORT = "8765"
DASAR = "http://127.0.0.1:" + PORT


def panggil(method, jalur, badan=None):
    data = json.dumps(badan).encode() if badan is not None else None
    req = urllib.request.Request(
        DASAR + jalur,
        data=data,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


def main():
    env = dict(os.environ)
    env.pop("SUPABASE_URL", None)  # pastikan skrip CLI gagal -> jalur 502 teruji
    env.pop("SUPABASE_SERVICE_ROLE_KEY", None)
    env["PORT"] = PORT
    proc = subprocess.Popen(
        [sys.executable, "server.py"],
        cwd=SINI,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    try:
        for _ in range(50):
            try:
                kode, _ = panggil("GET", "/health")
                if kode == 200:
                    break
            except OSError:
                time.sleep(0.2)
        else:
            raise AssertionError("server tidak menyala")

        kode, isi = panggil("GET", "/health")
        assert (kode, isi) == (200, {"ok": True}), (kode, isi)

        kode, _ = panggil("GET", "/tidak-ada")
        assert kode == 404, kode

        kode, _ = panggil("GET", "/api/chat")
        assert kode in (404, 405, 501), kode  # GET di endpoint POST ditolak

        kode, _ = panggil("POST", "/api/chat", {})
        assert kode == 400, kode

        # tanpa Supabase env, skrip CLI gagal -> 502 JSON (bukan crash/exit)
        kode, isi = panggil("POST", "/api/chat", {"pesan": "truk 4 sampai mana?"})
        assert kode == 502 and "error" in isi, (kode, isi)

        kode, _ = panggil("POST", "/api/validasi-pengaduan", {})
        assert kode == 400, kode

        kode, isi = panggil("POST", "/api/validasi-pengaduan", {"pengaduan_id": "x"})
        assert kode == 502 and "error" in isi, (kode, isi)

        # body bukan JSON -> 400, bukan 500
        req = urllib.request.Request(
            DASAR + "/api/chat",
            data=b"{rusak",
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        try:
            urllib.request.urlopen(req, timeout=10)
            raise AssertionError("seharusnya 400")
        except urllib.error.HTTPError as e:
            assert e.code == 400, e.code

        print("7 pemeriksaan lulus")
    finally:
        proc.terminate()
        proc.wait(timeout=10)


if __name__ == "__main__":
    main()
