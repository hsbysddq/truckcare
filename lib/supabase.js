// Helper server-only untuk baca/tulis Supabase via REST
// (tanpa @supabase/supabase-js). Dipakai dari route handler app/api/*
// dan server component. Jangan dipakai di komponen client.
// Baca pakai anon, tulis/validasi pakai service role.

// Ekstensi .js eksplisit supaya berkas ini juga bisa dimuat node polos
// untuk verifikasi (lihat /tmp/opencode/cek-analitik.mjs).
import { getAnalytics as getAnalyticsDummy } from "./data.js";

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
  luar_armada: "luar-armada",
};

// GET /api/complaints — daftar pengaduan baca dari Supabase, shape nyamain lib/data.js.
// Siapa yang memutuskan: kolom diputuskan_oleh (lihat
// supabase/pengaduan-diputuskan-oleh.sql); baris lama tanpa kolom ditebak
// dari teks alasan yang ditulis route validasi. null = belum diproses.
function sumberKeputusan(r) {
  if (r.diputuskan_oleh) return r.diputuskan_oleh;
  if (r.status === "menunggu" || !r.alasan) return null;
  if (/^Ditolak manual/i.test(r.alasan)) return "operator";
  if (/^Validasi AI tidak tersedia/i.test(r.alasan)) return "sistem";
  return "agent";
}

// includeDeleted: sertakan baris soft-delete (deleted_at terisi) untuk
// filter "Terhapus" di dashboard. Default hanya yang belum dihapus.
export async function getComplaintsShape({ includeDeleted = false } = {}) {
  const rows = await baca(
    "pengaduan",
    `?select=id,plat,tanggal,jam,deskripsi,status,alasan,diputuskan_oleh,decided_by,decided_by_name,decided_at,operator_note,operator_note_at,operator_notes,decision_reason,deleted_at,delete_reason,foto_url,created_at${
      includeDeleted ? "" : "&deleted_at=is.null"
    }&order=created_at.desc&limit=200`,
    ANON
  );
  return (rows || []).map((r) => {
    const decisionSource = r.decided_by ?? sumberKeputusan(r);
    return {
    id: r.id,
    judul: r.deskripsi,
    lokasi: "",
    plateNumber: r.plat,
    incidentAt: r.tanggal ? `${r.tanggal}${r.jam ? `, ${r.jam}` : ""}` : r.created_at,
    relativeTime: null,
    reporterNote: r.deskripsi,
    status: MAP_STATUS[r.status] ?? r.status,
    statusMentah: r.status,
    decisionSource,
    decidedBy: r.decided_by ?? decisionSource,
    decidedByName: r.decided_by_name ?? null,
    decidedAt: r.decided_at ?? null,
    operatorNote: r.operator_note ?? null,
    operatorNoteAt: r.operator_note_at ?? null,
    operatorNotes: Array.isArray(r.operator_notes) && r.operator_notes.length
      ? r.operator_notes
      : r.operator_note
        ? [{ by: r.decided_by_name ?? null, at: r.operator_note_at ?? null, text: r.operator_note }]
        : [],
    decisionReasons: Array.isArray(r.decision_reason) && r.decision_reason.length
      ? r.decision_reason
      : r.alasan && r.status !== "menunggu"
        ? [r.alasan]
        : [],
    deletedAt: r.deleted_at ?? null,
    deleteReason: r.delete_reason ?? null,
    // Keyakinan hanya bermakna bila agent yang menganalisis.
    agentConfidence: decisionSource === "agent" ? "tinggi" : null,
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
    };
  });
}

// Validasi/tulis pakai service role.
export async function baca(tabel, params = "", kunci = ANON) {
  if (!URL || !kunci) throw new Error("Env Supabase belum diisi di .env.local");
  // ponytail: no-store di satu titik ini menjaga SEMUA route API tetap live.
  // Tanpa ini fetch server Next bisa di-cache (data peta beku, bot terlihat
  // tidak sinkron). Kalau nanti butuh cache, tambah opsi per-panggilan.
  const res = await fetch(`${URL}/rest/v1/${tabel}${params}`, {
    headers: base(kunci),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET ${tabel} gagal: ${res.status}`);
  return res.json();
}

export async function tulis(tabel, method, params, badan) {
  if (!URL || !SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local");
  const res = await fetch(`${URL}/rest/v1/${tabel}${params}`, {
    method,
    headers: { ...base(SERVICE), Prefer: "return=representation" },
    body: badan ? JSON.stringify(badan) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${tabel} gagal: ${res.status}`);
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

// Catat chat ke chat_logs (service role). Best-effort: gagal = false,
// jangan pernah lempar supaya respons chat tidak ikut rusak.
export async function catatChat(tanya, jawab, mode, userId = null) {
  try {
    if (!URL || !SERVICE || !tanya || !jawab) return false;
    await tulis(
      "chat_logs",
      "POST",
      "",
      {
        tanya,
        jawab,
        mode: mode === "llm" ? "llm" : "luring",
        user_id: userId,
      }
    );
    return true;
  } catch {
    return false;
  }
}

// Riwayat chat user (service role), terbaru di akhir. Limit 50 pasangan.
export async function ambilRiwayatChat(userId) {
  const baris = await baca(
    "chat_logs",
    `?select=tanya,jawab,ts&user_id=eq.${encodeURIComponent(userId)}&order=ts.desc&limit=50`,
    SERVICE
  );
  return (baris || [])
    .slice()
    .reverse()
    .flatMap((r) => [
      { id: `user-${r.ts}`, role: "user", text: r.tanya },
      { id: `agent-${r.ts}`, role: "agent", text: r.jawab },
    ]);
}

// Statistik pengaduan untuk tool lokal AI (bukan OpenClaw): total &
// rincian per status. Fail-safe: kalau DB bermasalah, balik null.
export async function statistikPengaduan() {
  const statuses = [
    { kunci: "menunggu", label: "menunggu validasi" },
    { kunci: "valid", label: "valid" },
    { kunci: "ditolak", label: "ditolak" },
    { kunci: "luar_armada", label: "luar armada" },
  ];
  try {
    const rows = await baca("pengaduan?select=status&limit=1000");
    const list = rows || [];
    const lain = {};
    let total = 0;
    for (const r of list) {
      total += 1;
      const s = r?.status || "lainnya";
      const ketemu = statuses.find((x) => x.kunci === s);
      if (ketemu) ketemu.jumlah = (ketemu.jumlah ?? 0) + 1;
      else lain[s] = (lain[s] ?? 0) + 1;
    }
    return { total, statuses, lain };
  } catch {
    return null;
  }
}

// Konteks armada (driver + trip berjalan) untuk disertakan ke AI agent,
// supaya jawaban chat bisa menyebut driver dan jadwal aktual.
export async function konteksArmada() {
  const [driverMentah, tripMentah, trukMentah] = await Promise.all([
    baca("drivers", "?select=id,nama,no_hp&order=nama&limit=100", ANON),
    baca(
      "trips",
      "?select=truk_id,driver_id,asal,tujuan,mulai,status&status=eq.berjalan&order=mulai.desc&limit=50",
      ANON
    ),
    baca("trucks", "?select=id,plat,nama&limit=100", ANON),
  ]);

  const trukDariId = Object.fromEntries(
    (trukMentah || []).map((t) => [t.id, t])
  );
  const driverDariId = Object.fromEntries(
    (driverMentah || []).map((d, i) => [d.id ?? i, d])
  );

  const trips = (tripMentah || []).map((t) => ({
    plat: trukDariId[t.truk_id]?.plat ?? null,
    namaTruk: trukDariId[t.truk_id]?.nama ?? null,
    driver: driverDariId[t.driver_id]?.nama ?? null,
    asal: t.asal,
    tujuan: t.tujuan,
    mulai: t.mulai,
  }));

  return {
    drivers: (driverMentah || []).map((d) => ({ nama: d.nama, noHp: d.no_hp })),
    trips,
  };
}

const BATAS_NGEBUT_KPJ = 80;
const BULAN_PENDEK = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const MAP_STATUS_TREN = {
  menunggu: "menunggu",
  valid: "tervalidasi",
  ditolak: "ditolak",
  "perlu-ditinjau": "perluDitinjau",
};

function kunciHari(date) {
  return date.toISOString().slice(0, 10);
}

function labelHari(kunci) {
  const [y, m, d] = kunci.split("-").map(Number);
  return `${d} ${BULAN_PENDEK[m - 1]}`;
}

// Analitik live dari Supabase, shape nyamain getAnalytics() di lib/data.js.
// Yang real: tren pengaduan 30 hari, metrik pengaduan, insiden ngebut per
// plat + sebaran lokasi (dari positions, kecepatan > 80 km/jam).
// Yang tetap contoh: konsumsi solar (skema tidak punya data BBM) dan
// rata-rata waktu validasi (pengaduan tidak punya kolom updated_at).
// ponytail: kalau skema nambah kolom BBM/updated_at, ganti dua bagian itu
// dengan agregasi beneran.
export async function getAnalyticsShape() {
  if (!URL || !ANON) throw new Error("Env Supabase belum diisi di .env.local");

  const [aduan, ngebut, truk] = await Promise.all([
    baca("pengaduan", "?select=tanggal,status&order=tanggal.desc&limit=2000", ANON),
    baca(
      "positions",
      `?select=truk_id,lat,lon,kecepatan&kecepatan=gt.${BATAS_NGEBUT_KPJ}&order=ts.desc&limit=500`,
      ANON
    ),
    baca("trucks", "?select=id,plat&limit=100", ANON),
  ]);

  const hariIni = new Date();
  const ember = [];
  for (let i = 29; i >= 0; i -= 1) {
    const kunci = kunciHari(new Date(hariIni.getTime() - i * 86400000));
    ember.push({
      kunci,
      date: labelHari(kunci),
      menunggu: 0,
      tervalidasi: 0,
      ditolak: 0,
      perluDitinjau: 0,
    });
  }
  const perKunci = Object.fromEntries(ember.map((e) => [e.kunci, e]));

  let valid = 0;
  let ditolak = 0;
  let mingguIni = 0;
  const batasMinggu = kunciHari(new Date(hariIni.getTime() - 6 * 86400000));
  for (const r of aduan || []) {
    const seri = MAP_STATUS_TREN[r.status] ?? "perluDitinjau";
    if (seri === "tervalidasi") valid += 1;
    if (seri === "ditolak") ditolak += 1;
    if (r.tanggal && r.tanggal >= batasMinggu) mingguIni += 1;
    const bak = r.tanggal ? perKunci[r.tanggal] : null;
    if (bak) bak[seri] += 1;
  }
  const total = (aduan || []).length;
  const dailyComplaintsTrend = ember.map(
    ({ kunci, ...tanpaKunci }) => tanpaKunci
  );

  const platDariId = Object.fromEntries(
    (truk || []).map((t) => [t.id, t.plat])
  );
  const ngebutPerPlat = {};
  const klaster = {};
  const trukNgebut = new Set();
  for (const p of ngebut || []) {
    const plat = platDariId[p.truk_id] ?? p.truk_id;
    ngebutPerPlat[plat] = (ngebutPerPlat[plat] ?? 0) + 1;
    trukNgebut.add(p.truk_id);
    const gLat = Math.round(p.lat * 100) / 100;
    const gLng = Math.round(p.lon * 100) / 100;
    const kunci = `${gLat.toFixed(2)},${gLng.toFixed(2)}`;
    if (!klaster[kunci]) {
      klaster[kunci] = { label: `${gLat.toFixed(2)}, ${gLng.toFixed(2)}`, lat: gLat, lng: gLng, count: 0 };
    }
    klaster[kunci].count += 1;
  }
  const speedingByPlate = Object.entries(ngebutPerPlat)
    .map(([plateNumber, count]) => ({ plateNumber, count }))
    .sort((a, b) => b.count - a.count);
  const violationLocations = Object.values(klaster)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    metrics: {
      complaintsProcessed: { total, thisWeek: mingguIni },
      autoResolvedPct: total === 0 ? 0 : Math.round(((valid + ditolak) / total) * 100),
      avgValidationSeconds: 8,
      manualEstimateMinutes: 15,
      speedingIncidents: {
        total: (ngebut || []).length,
        vehiclesInvolved: trukNgebut.size,
      },
    },
    dailyComplaintsTrend,
    fuelConsumptionByTruck: getAnalyticsDummy().fuelConsumptionByTruck,
    speedingByPlate,
    violationLocations,
  };
}

// ---------- AKSES BOT TELEGRAM (service role) ----------
// Tabel bot_akses dibuat via supabase/bot-akses.sql. Tulis/baca hanya
// service role; RLS tanpa policy publik sehingga anon selalu ditolak.
export async function daftarBotAkses() {
  const baris = await baca(
    "bot_akses",
    "?select=id,chat_id,nama,created_at&order=created_at.desc&limit=100",
    SERVICE
  );
  return (baris || []).map((r) => ({
    id: r.id,
    chatId: r.chat_id,
    nama: r.nama,
    createdAt: r.created_at,
  }));
}

export async function tambahBotAkses(chatId, nama) {
  const baris = await tulis("bot_akses", "POST", "", {
    chat_id: chatId,
    nama: nama || null,
  });
  const r = Array.isArray(baris) ? baris[0] : baris;
  if (!r) throw new Error("insert bot_akses gagal");
  return { id: r.id, chatId: r.chat_id, nama: r.nama, createdAt: r.created_at };
}

export async function hapusBotAkses(id) {
  await tulis("bot_akses", "DELETE", `?id=eq.${encodeURIComponent(id)}`);
  return true;
}
