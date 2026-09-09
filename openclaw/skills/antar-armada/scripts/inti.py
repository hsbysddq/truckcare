"""Utilitas bersama untuk skill OpenClaw Antar — koneksi Supabase + hitung ETA.

Angka dihitung deterministik dari data, bukan dari LLM.
Retry logic untuk transient errors, in-memory cache untuk posisi.
"""

import json
import math
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# In-memory cache: posisi berubah tiap ~3 detik, cache 8 detik cukup
_cache: dict = {}
_CACHE_TTL = float(os.environ.get("CACHE_TTL", "8"))


def _now():
    return time.monotonic()


def supabase_get(tabel: str, params: str = "", use_cache: bool = False) -> list:
    """GET ke Supabase REST; kembalikan list row. Retry 1x pada transient error."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set")

    cache_key = f"{tabel}?{params}"
    if use_cache and cache_key in _cache:
        ts, data = _cache[cache_key]
        if _now() - ts < _CACHE_TTL:
            return data

    url = f"{SUPABASE_URL}/rest/v1/{tabel}?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read().decode())
            if use_cache:
                _cache[cache_key] = (_now(), data)
            return data
        except Exception:
            if attempt == 0:
                time.sleep(0.3 * (attempt + 1))
                continue
            raise


def haversine_km(a_lat, a_lon, b_lat, b_lon) -> float:
    """Jarak geodesik dalam km."""
    R = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp = math.radians(b_lat - a_lat)
    dl = math.radians(b_lon - a_lon)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def posisi_terbaru_per_truk(limit: int = 200) -> dict:
    """Posisi terbaru per truk, dari tabel positions. Cache 8 detik."""
    rows = supabase_get(
        "positions", f"select=*&order=ts.desc&limit={limit}", use_cache=True
    )
    terbaru: dict = {}
    for r in rows:
        if r["truk_id"] not in terbaru:
            terbaru[r["truk_id"]] = r
    return terbaru


def trip_aktif_per_truk() -> dict:
    """Trip berjalan per truk."""
    rows = supabase_get("trips", "select=*&status=eq.berjalan")
    return {r["truk_id"]: r for r in rows}


def truk_by_id() -> dict:
    rows = supabase_get("trucks", "select=*")
    return {r["id"]: r for r in rows}


def hitung_eta(trip, posisi) -> dict:
    """ETA deterministik: sisa jarak waypoint / kecepatan rata-rata + toleransi berhenti."""
    mentah = trip.get("waypoints") or []
    wp = [{"lat": w[0], "lon": w[1]} if isinstance(w, list) else w for w in mentah]
    if not wp or not posisi:
        return {"eta_menit": None, "progres": None}

    lat, lon = posisi["lat"], posisi["lon"]
    jarak_ke_wp = [(w, haversine_km(lat, lon, w["lat"], w["lon"])) for w in wp]
    target = min(jarak_ke_wp, key=lambda x: x[1])
    jarak_sisa = target[1]
    kecepatan = posisi.get("kecepatan") or 0
    if kecepatan < 5:
        kecepatan = 40
    eta_menit = (jarak_sisa / kecepatan) * 60 if kecepatan > 0 else None

    total = sum(
        haversine_km(wp[i]["lat"], wp[i]["lon"], wp[i + 1]["lat"], wp[i + 1]["lon"])
        for i in range(len(wp) - 1)
    )
    ditempuh = haversine_km(wp[0]["lat"], wp[0]["lon"], lat, lon)
    progres = min(ditempuh / total, 1.0) if total > 0 else 0
    return {
        "eta_menit": round(eta_menit) if eta_menit else None,
        "progres": round(progres * 100),
    }


def jumlah_truk() -> int:
    """Query ringan: hitung total truk tanpa fetch semua data."""
    rows = supabase_get("trucks", "select=id")
    return len(rows)
