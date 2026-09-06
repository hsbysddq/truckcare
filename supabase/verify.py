#!/usr/bin/env python3
"""Verifikasi project Supabase Antar siap dipakai (baca + tulis + hapus).

Pemakaian:
    SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... python3 verify.py

Cek: trucks terbaca (anon), insert pengaduan (anon, sesuai RLS publik),
update status (service), hapus baris uji (service). Tanpa framework.
"""

import json
import os
import sys
import urllib.request

URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
ANON = os.environ.get("SUPABASE_ANON_KEY", "")
SERVICE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def panggil(method, tabel, kunci, params="", badan=None, prefer=None):
    headers = {
        "apikey": kunci,
        "Authorization": "Bearer " + kunci,
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    data = json.dumps(badan).encode() if badan is not None else None
    req = urllib.request.Request(
        "%s/rest/v1/%s%s" % (URL, tabel, params),
        data=data,
        method=method,
        headers=headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            mentah = r.read().decode()
            return r.status, json.loads(mentah) if mentah else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]


def main():
    if not URL or not ANON or not SERVICE:
        print("Isi SUPABASE_URL + SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY dulu.")
        return 1

    kode, truk = panggil("GET", "trucks", ANON, "?select=plat,nama&order=nama&limit=20")
    assert kode == 200, ("baca trucks gagal", kode, truk)
    assert isinstance(truk, list) and len(truk) >= 10, (
        "seed belum jalan?",
        len(truk or []),
    )
    print("1. baca trucks (anon): %d baris OK" % len(truk))

    uji = {
        "plat": "DK 0000 ZZ",
        "deskripsi": "[UJI OTOMATIS verify.py, aman dihapus]",
    }
    kode, dibuat = panggil("POST", "pengaduan", ANON, "", uji, "return=representation")
    assert kode in (200, 201), ("insert pengaduan (anon) gagal", kode, dibuat)
    pid = dibuat[0]["id"]
    print("2. insert pengaduan (anon): OK")

    kode, _ = panggil(
        "PATCH",
        "pengaduan",
        SERVICE,
        "?id=eq.%s" % pid,
        {"status": "ditolak", "alasan": "baris uji verify.py"},
    )
    assert kode in (200, 204), ("update status (service) gagal", kode)
    print("3. update status (service): OK")

    kode, _ = panggil("DELETE", "pengaduan", SERVICE, "?id=eq.%s" % pid)
    assert kode in (200, 204), ("hapus baris uji gagal", kode)
    print("4. hapus baris uji (service): OK")
    print("Supabase siap.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
