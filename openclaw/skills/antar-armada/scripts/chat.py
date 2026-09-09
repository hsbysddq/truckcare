#!/usr/bin/env python3
"""Chat armada — jawab pertanyaan pemilik tentang posisi/ETA/keterlambatan/rekap.

Pemakaian:
    python3 chat.py "truk 4 sampai mana?"
    python3 chat.py "kenapa truk 4 telat?"
    python3 chat.py "rekap perjalanan hari ini"
"""

import re
import sys
from datetime import datetime, timezone
from typing import Optional

from inti import (
    posisi_terbaru_per_truk,
    trip_aktif_per_truk,
    truk_by_id,
    hitung_eta,
    haversine_km,
    jumlah_truk,
)

import os, json


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


def cari_truk(plat_atau_nomor: str, trucks: dict) -> Optional[str]:
    """Cocokkan 'truk 4' atau 'DK 1234 AB' ke id truk."""
    q = plat_atau_nomor.lower()
    for tid, t in trucks.items():
        nama = t.get("nama", "").lower()
        plat = t.get("plat", "").lower()
        # "truk 4" → nama "Truk 4"
        if q.replace("truk", "").strip() in nama.replace("truk", "").strip():
            return tid
        if plat and q.replace(" ", "") in plat.replace(" ", ""):
            return tid
    return None


def jawab_umum(pertanyaan: str) -> str:
    """Pertanyaan yang tidak menyebut truk spesifik."""
    q = pertanyaan.lower()
    posisi = posisi_terbaru_per_truk()
    trips = trip_aktif_per_truk()
    trucks = truk_by_id()

    if "berhenti" in q or "stop" in q:
        berhenti = [p for p in posisi.values() if p.get("status") == "berhenti"]
        if not berhenti:
            return (
                "Saat ini tidak ada truk yang berhenti. Semua armada berjalan normal."
            )
        nama = [trucks.get(p["truk_id"], {}).get("nama", "?") for p in berhenti]
        return f"Ada {len(berhenti)} truk berhenti: {', '.join(nama)}."

    if "rekap" in q or "hari ini" in q:
        if not posisi:
            return "Belum ada data perjalanan hari ini."
        jalan = sum(1 for p in posisi.values() if p.get("status") == "jalan")
        berhenti = len(posisi) - jalan
        return (
            f"Rekap hari ini: {len(posisi)} truk aktif, {jalan} berjalan, "
            f"{berhenti} berhenti. Semua dalam pantauan."
        )

    if "berapa" in q and "truk" in q:
        return f"Total {jumlah_truk()} truk terdaftar di armada."

    # default: daftar status
    if not posisi:
        return "Belum ada data posisi. Simulasi mungkin belum berjalan."
    baris = []
    for tid, p in list(posisi.items())[:10]:
        t = trucks.get(tid, {})
        trip = trips.get(tid)
        nama = t.get("nama", tid[:8])
        st = "jalan" if p.get("status") == "jalan" else "berhenti"
        kecepatan = p.get("kecepatan", 0)
        tujuan = trip.get("tujuan", "?") if trip else "?"
        baris.append(f"{nama}: {st} ({kecepatan:.0f} km/jam) menuju {tujuan}")
    return "Status armada:\n" + "\n".join(baris)


def jawab_truk(pertanyaan: str) -> str:
    """Pertanyaan yang menyebut truk spesifik (posisi/ETA/telat)."""
    q = pertanyaan.lower()
    posisi = posisi_terbaru_per_truk()
    trips = trip_aktif_per_truk()
    trucks = truk_by_id()

    # ekstrak nomor truk
    m = re.search(r"truk\s*(\d+)", q)
    if not m:
        return jawab_umum(pertanyaan)
    nomor = m.group(1)
    tid = None
    for tid_, t in trucks.items():
        # cocok persis "truk 4" (bukan substring: "1" tidak boleh kena "Truk 10")
        if t.get("nama", "").lower().strip() == "truk " + nomor:
            tid = tid_
            break
    if not tid:
        return f"Tidak ada truk bernomor {nomor} di armada."

    p = posisi.get(tid)
    trip = trips.get(tid)
    if not p or not trip:
        return f"Truk {nomor} sedang tidak dalam perjalanan aktif."

    t = trucks[tid]
    eta = hitung_eta(trip, p)
    sisa = f"±{eta['eta_menit']} menit" if eta["eta_menit"] is not None else "segera"
    st = "berhenti" if p.get("status") == "berhenti" else "jalan"
    kecepatan = p.get("kecepatan", 0)

    if "telat" in q or "lambat" in q or "kenapa" in q:
        if st == "berhenti":
            return (
                f"Truk {nomor} ({t.get('plat')}) sedang berhenti (0 km/jam) di "
                f"perjalanan menuju {trip.get('tujuan')}. Kemungkinan berhenti lama "
                f"atau antre. ETA tersisa {sisa}."
            )
        if kecepatan < 20:
            return (
                f"Truk {nomor} bergerak lambat ({kecepatan:.0f} km/jam) menuju "
                f"{trip.get('tujuan')}. Bisa jadi macet. ETA tersisa {sisa}."
            )
        return (
            f"Truk {nomor} sebenarnya berjalan normal ({kecepatan:.0f} km/jam). "
            f"Mungkin terlambat dari jadwal, tapi tidak ada anomali kecepatan."
        )

    # posisi / sampai mana / ETA
    tujuan = trip.get("tujuan")
    progres = eta["progres"] if eta["progres"] is not None else "?"
    return (
        f"Truk {nomor} ({t.get('plat')}) sedang {st} menuju {tujuan}, "
        f"{progres}% perjalanan, kecepatan {kecepatan:.0f} km/jam. "
        f"ETA tersisa {sisa}."
    )


def main():
    pertanyaan = " ".join(sys.argv[1:]).strip()
    if not pertanyaan:
        print("Tolong beri pertanyaan.")
        return
    if "truk" in pertanyaan.lower():
        print(jawab_truk(pertanyaan))
    else:
        print(jawab_umum(pertanyaan))


if __name__ == "__main__":
    main()
