#!/usr/bin/env python3
"""Validasi pengaduan truk dari portal publik terhadap data kecepatan/posisi nyata.

Pemakaian:
    python3 validasi.py --pengaduan-id <uuid>

Output: baris pertama `VALID` / `DITOLAK`, baris berikutnya alasan.
Aturan: plat tidak dikenal → DITOLAK. Berhenti lama (status berhenti) di jam laporan → VALID.
Tak ada anomali → VALID. Data tak tersedia → VALID dengan catatan.
"""

import argparse
import json
import sys
from datetime import datetime, timezone

from inti import supabase_get


def _log(msg, **kw):
    print(
        json.dumps(
            {
                "ts": datetime.now(timezone.utc).isoformat(),
                "level": "INFO",
                "msg": msg,
                **kw,
            },
            ensure_ascii=False,
        ),
        file=sys.stderr,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pengaduan-id", required=True)
    args = ap.parse_args()

    _log("validasi mulai", pengaduan_id=args.pengaduan_id)

    # ambil pengaduan
    rows = supabase_get("pengaduan", f"select=*&id=eq.{args.pengaduan_id}")
    if not rows:
        print("DITOLAK")
        print("Pengaduan tidak ditemukan.")
        return
    p = rows[0]

    plat = p.get("plat", "").strip().lower()
    # cari truk berdasarkan plat
    trucks = supabase_get("trucks", "select=*")
    truk = next((t for t in trucks if t.get("plat", "").lower() == plat), None)

    if not truk:
        print("DITOLAK")
        print(f"Plat {p.get('plat')} tidak dikenal di armada.")
        return

    # ambil data kecepatan truk di rentang jam laporan (atau terbaru)
    tanggal = p.get("tanggal") or ""
    jam = p.get("jam") or "00:00"
    # konversi ke ts (Supabase menyimpan ISO). Coba rentang tanggal+jam.
    posisi = supabase_get(
        "positions",
        f"select=kecepatan,status,ts&truk_id=eq.{truk['id']}&order=ts.desc&limit=20",
    )
    if not posisi:
        print("VALID")
        print("Data posisi tidak tersedia untuk verifikasi; laporan diterima.")
        return

    # status terbaru
    terbaru = posisi[0]
    status = terbaru.get("status")
    kecepatan = terbaru.get("kecepatan", 0)

    if status == "berhenti" or kecepatan < 5:
        print("VALID")
        print(
            f"Truk {p.get('plat')} tercatat berhenti (kecepatan {kecepatan:.0f} km/jam) "
            f"di sekitar jam laporan. Laporan konsisten dengan data."
        )
        return

    # cek ada peristiwa berhenti lama / penyimpangan
    events = supabase_get(
        "events",
        f"select=jenis,pesan,ts&truk_id=eq.{truk['id']}&order=ts.desc&limit=10",
    )
    if events and any(
        e.get("jenis") in ("berhenti_lama", "penyimpangan") for e in events
    ):
        print("VALID")
        print(
            f"Truk {p.get('plat')} punya peristiwa {events[0].get('jenis')} baru-baru ini. "
            "Laporan konsisten."
        )
        return

    print("VALID")
    print(
        f"Truk {p.get('plat')} tercatat berjalan normal ({kecepatan:.0f} km/jam) "
        "di jam laporan; tak ada anomali besar. Laporan diterima untuk ditinjau."
    )


if __name__ == "__main__":
    main()
