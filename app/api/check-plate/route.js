import { NextResponse } from "next/server";
import { getActiveTrucks } from "@/lib/trucks";
import { plateKey } from "@/lib/format";

// Pola plat tanpa spasi (input sudah dinormalisasi lewat plateKey).
const POLA_KUNCI = /^[A-Z]{1,2}\d{1,4}[A-Z]{1,3}$/;

// POST /api/check-plate  { plate: "L 8821 AB" }  ->  { found: true | false }
//
// Endpoint PUBLIK untuk umpan balik cepat di form pengaduan. Sengaja hanya
// menjawab ada/tidak: jangan pernah mengembalikan nama pengemudi, model,
// posisi, atau data truk lain. Pencocokan sesungguhnya tetap dilakukan agent
// saat laporan diproses (app/api/complaints/[id]/route.js).
//
// Input dinormalisasi (huruf kapital, spasi dibuang) sehingga "l8821ab" dan
// "L 8821 AB" dianggap sama. Rate limit per IP: MAKS_PER_MENIT permintaan.

const MAKS_PER_MENIT = 20;
const JENDELA_MS = 60_000;
const CACHE_PLAT_MS = 30_000;

// Penyimpanan di memori proses (cukup untuk satu instance; untuk multi
// instance ganti dengan store bersama seperti Redis).
const store = (globalThis.__circleTCheckPlate ??= {
  hits: new Map(), // ip -> [timestamp, ...]
  plates: null, // Set plateKey
  platesAt: 0,
});

function ipDari(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "lokal";
}

function terlaluBanyak(ip) {
  const now = Date.now();
  const list = (store.hits.get(ip) ?? []).filter((t) => now - t < JENDELA_MS);
  if (list.length >= MAKS_PER_MENIT) {
    store.hits.set(ip, list);
    return true;
  }
  list.push(now);
  store.hits.set(ip, list);
  // Bersihkan IP lain yang sudah lama diam supaya map tidak tumbuh terus.
  if (store.hits.size > 1000) {
    for (const [k, v] of store.hits) {
      if (!v.some((t) => now - t < JENDELA_MS)) store.hits.delete(k);
    }
  }
  return false;
}

async function daftarPlat() {
  const now = Date.now();
  if (store.plates && now - store.platesAt < CACHE_PLAT_MS) return store.plates;
  const trucks = await getActiveTrucks();
  store.plates = new Set(trucks.map((t) => plateKey(t.plateNumber)));
  store.platesAt = now;
  return store.plates;
}

export async function POST(req) {
  const headers = { "Cache-Control": "no-store" };
  if (terlaluBanyak(ipDari(req))) {
    return NextResponse.json(
      { error: "terlalu banyak permintaan, coba lagi sebentar" },
      { status: 429, headers: { ...headers, "Retry-After": "60" } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const kunci = plateKey(typeof body?.plate === "string" ? body.plate : "");
  if (!POLA_KUNCI.test(kunci)) {
    return NextResponse.json({ found: false }, { status: 400, headers });
  }

  const plates = await daftarPlat();
  return NextResponse.json({ found: plates.has(kunci) }, { headers });
}
