// Helper server untuk baca/tulis Supabase via REST (tanpa @supabase/supabase-js).
// Dipakai hanya dari app/api/*. Jangan dipakai di komponen client.
// Baca pakai anon, tulis/validasi pakai service role.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function base(kunci) {
  if (!URL) throw new Error("Isi NEXT_PUBLIC_SUPABASE_URL di .env.local");
  return {
    apikey: kunci,
    Authorization: `Bearer ${kunci}`,
    "Content-Type": "application/json",
  };
}

export function supabaseUrl() {
  if (!URL) throw new Error("Isi NEXT_PUBLIC_SUPABASE_URL di .env.local");
  return URL;
}

function statusDariPosisi(p) {
  if (!p) return "istirahat";
  return (p.kecepatan ?? 0) > 5 ? "bergerak" : "istirahat";
}

// GET /api/trucks — daftar armada gabung posisi terakhir per truk, shape nyamain lib/data.js.
export async function getTrucksShape() {
  if (!URL || !ANON) throw new Error("Env Supabase belum diisi di .env.local");

  const [trukMentah, posisiMentah, tripBerjalan] = await Promise.all([
    baca("trucks", "?select=id,plat,nama,tipe,status&order=nama&limit=100", ANON),
    baca("positions", "?select=truk_id,lat,lon,kecepatan,status,ts&order=ts.desc&limit=200", ANON),
    baca("trips", "?select=truk_id,asal,tujuan,mulai&status=eq.berjalan&order=mulai.desc&limit=200", ANON),
  ]);

  const posTerakhir = {};
  for (const p of posisiMentah || []) {
    if (p && !posTerakhir[p.truk_id]) posTerakhir[p.truk_id] = p;
  }

  const tripAktif = {};
  for (const t of tripBerjalan || []) {
    if (t && !tripAktif[t.truk_id]) tripAktif[t.truk_id] = t;
  }

  return (trukMentah || []).map((t) => {
    const p = posTerakhir[t.id] ?? null;
    const trip = tripAktif[t.id] ?? null;
    return {
      id: t.id,
      plateNumber: t.plat,
      nama: t.nama,
      model: t.tipe ?? "Truk Distribusi",
      driverName: null,
      status: p ? statusDariPosisi(p) : (t.status === "aktif" ? "bergerak" : "istirahat"),
      lat: p?.lat ?? null,
      lng: p?.lon ?? null,
      speedKph: p?.kecepatan ?? 0,
      fuelLevelPct: null,
      origin: trip?.asal ?? null,
      destination: trip?.tujuan ?? null,
      progressPct: 0,
      tripStatus: p?.status ?? "jalan",
      lastUpdate: p?.ts ?? null,
    };
  });
}

const MAP_STATUS = {
  menunggu: "pending",
  valid: "tervalidasi",
  ditolak: "ditolak",
  "perlu-ditinjau": "perlu-ditinjau",
};

// GET /api/complaints — daftar pengaduan baca dari Supabase, shape nyamain lib/data.js.
export async function getComplaintsShape() {
  const rows = await baca(
    "pengaduan",
    "?select=id,plat,tanggal,jam,deskripsi,status,alasan,foto_url,created_at&order=created_at.desc&limit=100",
    ANON
  );
  return (rows || []).map((r) => ({
    id: r.id,
    judul: r.deskripsi,
    lokasi: "",
    plateNumber: r.plat,
    incidentAt: r.tanggal ? `${r.tanggal}${r.jam ? `, ${r.jam}` : ""}` : r.created_at,
    relativeTime: null,
    reporterNote: r.deskripsi,
    status: MAP_STATUS[r.status] ?? r.status,
    statusMentah: r.status,
    agentConfidence: "tinggi",
    agentReasoning: r.alasan ?? null,
    agentFindings: [],
    speedSeries: [],
    recordedSpeed: null,
    speedLimit: null,
    coordinates: null,
    vehicleType: null,
    driverName: null,
    text: r.deskripsi,
    foto_url: r.foto_url,
    created_at: r.created_at,
  }));
}

// Validasi/tulis pakai service role.
export async function baca(tabel, params = "", kunci = ANON) {
  if (!URL || !kunci) throw new Error("Env Supabase belum diisi di .env.local");
  const res = await fetch(`${URL}/rest/v1/${tabel}${params}`, { headers: base(kunci) });
  if (!res.ok) throw new Error(`GET ${tabel} gagal: ${res.status}`);
  return res.json();
}

async function tulis(tabel, method, params, badan) {  if (!URL || !SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local");
  const res = await fetch(`${URL}/rest/v1/${tabel}${params}`, {
    method,
    headers: base(SERVICE),
    body: badan ? JSON.stringify(badan) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${tabel} gagal: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// Catat chat ke chat_logs (service role). Best-effort: gagal = false,
// jangan pernah lempar supaya respons chat tidak ikut rusak.
export async function catatChat(tanya, jawab, mode) {
  try {
    if (!URL || !SERVICE || !tanya || !jawab) return false;
    await tulis(
      "chat_logs",
      "POST",
      "",
      { tanya, jawab, mode: mode === "llm" ? "llm" : "luring" }
    );
    return true;
  } catch {
    return false;
  }
}
