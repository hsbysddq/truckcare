// Helper server-only untuk baca/tulis Supabase via REST
// (tanpa @supabase/supabase-js). Dipakai dari route handler app/api/*
// dan server component. Jangan dipakai di komponen client.
// Baca pakai anon, tulis/validasi pakai service role.

// Ekstensi .js eksplisit supaya berkas ini juga bisa dimuat node polos
// untuk verifikasi (lihat /tmp/opencode/cek-analitik.mjs).
import { truckTypeFromTipe, truckTypeMeta } from "./truck-types.js";
import { cacheJarangBerubah } from "./cache.js";
import { BATAS_KECEPATAN_KPJ, kelompokkanInsiden } from "./speed-limit.js";

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
// activeOnly (default true): hanya trucks.status = 'aktif'. Panggil lewat
// lib/trucks.js getActiveTrucks(), bukan langsung dari halaman.
export async function getTrucksShape({ activeOnly = true } = {}) {
  if (!URL || !ANON) throw new Error("Env Supabase belum diisi di .env.local");

  // Truk & pengemudi jarang berubah: dari cache (lib/cache.js, 60 detik).
  // Posisi terakhir & trip berjalan berubah tiap detik: selalu segar.
  const [trukMentah, posTerakhir, tripBerjalan, drv] = await Promise.all([
    daftarTrukCache(activeOnly),
    posisiTerakhir(),
    baca("trips", "?select=truk_id,driver_id,asal,tujuan,mulai,waypoints&status=eq.berjalan&order=mulai.desc&limit=200", ANON),
    daftarPengemudiCache(),
  ]);
  const driverNama = Object.fromEntries((drv || []).map((d) => [d.id, d.nama]));

  const tripAktif = {};
  for (const t of tripBerjalan || []) {
    if (t && !tripAktif[t.truk_id]) tripAktif[t.truk_id] = t;
  }

  return (trukMentah || []).map((t) => {
    const p = posTerakhir[t.id] ?? null;
    const trip = tripAktif[t.id] ?? null;
    const type = truckTypeFromTipe(t.tipe, t.plat);
    const jenis = truckTypeMeta(type);
    // Progres perjalanan: simulasi memajukan 1 menit perjalanan per 1 detik
    // nyata sejak trip.mulai, jadi (detik berlalu / tiba_menit akhir) x 100.
    const akhir = trip?.waypoints?.at(-1)?.tiba_menit ?? 0;
    const elapsedDetik = trip?.mulai
      ? (Date.now() - new Date(trip.mulai).getTime()) / 1000
      : 0;
    const progressPct =
      akhir > 0
        ? Math.max(0, Math.min(100, Math.round((elapsedDetik / akhir) * 100)))
        : 0;
    return {
      id: t.id,
      plateNumber: t.plat,
      nama: t.nama,
      // Flag aktif dari kolom trucks.status ('aktif' | 'nonaktif').
      active: t.status !== "nonaktif",
      type,
      vehicleType: jenis.label,
      vehicleTypeShort: jenis.short,
      tankCapacityLiters: jenis.tankLiters,
      model: jenis.label,
      driverId: trip?.driver_id ?? null,
      driverName: trip?.driver_id ? driverNama[trip.driver_id] ?? null : null,
      status: p ? statusDariPosisi(p) : (t.status === "aktif" ? "bergerak" : "istirahat"),
      lat: p?.lat ?? null,
      lng: p?.lon ?? null,
      speedKph: p?.kecepatan ?? 0,
      // Telemetri odometer & solar tidak dikirim GPS; isi angka simulasi
      // deterministik (stabil per truk) supaya dashboard tak kosong.
      odometerKm: bilanganStabil(t.plat, 60000, 280000),
      fuelLevelPct: bilanganStabil(t.plat, 40, 90),
      origin: trip?.asal ?? null,
      destination: trip?.tujuan ?? null,
      progressPct,
      tripStatus: p?.status ?? "jalan",
      lastUpdate: p?.ts ?? null,
    };
  });
}

// ---------- DATA JARANG BERUBAH (cache 60 detik) ----------
// Daftar truk (aktif / semua) dan pengemudi. Dibagi ke semua halaman:
// Armada, Overview, Peta, Jadwal, Pengemudi, Pengaduan, Analitik, chat.
const daftarTrukCache = cacheJarangBerubah(
  async (activeOnly) =>
    baca("trucks", `?select=id,plat,nama,tipe,status${activeOnly ? "&status=eq.aktif" : ""}&order=nama&limit=200`, ANON),
  ["daftar-truk"]
);
// drivers tak punya RLS select publik; baca via service role.
export const daftarPengemudiCache = cacheJarangBerubah(
  async () => baca("drivers", "?select=id,nama,no_hp&order=nama&limit=200", SERVICE),
  ["daftar-pengemudi"]
);

// Panggil fungsi SQL (supabase/analitik-agregat.sql) lewat PostgREST RPC.
export async function panggilRpc(nama, args = {}, kunci = ANON) {
  if (!URL || !kunci) throw new Error("Env Supabase belum diisi di .env.local");
  const res = await fetch(`${URL}/rest/v1/rpc/${nama}`, {
    method: "POST",
    headers: base(kunci),
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC ${nama} gagal: ${res.status}`);
  return res.json();
}

// Posisi terakhir tiap truk aktif: RPC posisi_terakhir (15 probe indeks).
// Cadangan bila fungsi SQL belum dibuat: 200 baris terbaru diurutkan ts.
async function posisiTerakhir() {
  try {
    const rows = await panggilRpc("posisi_terakhir");
    return Object.fromEntries((rows || []).map((p) => [p.truk_id, p]));
  } catch {
    const rows = await baca("positions", "?select=truk_id,lat,lon,kecepatan,status,ts&order=ts.desc&limit=200", ANON);
    const out = {};
    for (const p of rows || []) if (p && !out[p.truk_id]) out[p.truk_id] = p;
    return out;
  }
}

// Nilai stabil deterministik dari sebuah string (bukan random; konsisten
// antar request) untuk mengisi UI simulasi: [min, max] inklusif.
function bilanganStabil(kunci, min, max) {
  let h = 0;
  for (const c of String(kunci)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return min + (h % (max - min + 1));
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
    `?select=id,plat,tanggal,jam,deskripsi,status,alasan,diputuskan_oleh,decided_by,decided_by_name,decided_at,operator_note,operator_note_at,operator_notes,decision_reason,deleted_at,delete_reason,foto_url,created_at,analysis_status,analyzed_at,verdict,reasoning,evidence,truck_id,driver_id,analysis_error${
      includeDeleted ? "" : "&deleted_at=is.null"
    }&order=created_at.desc&limit=200`,
    ANON
  );
  return (rows || []).map((r) => {
    const decisionSource = r.decided_by ?? sumberKeputusan(r);
    const ev = r.evidence && typeof r.evidence === "object" ? r.evidence : {};
    // Hasil analisis agent (lib/complaint-analysis.js) disimpan terpisah dari
    // keputusan akhir supaya keputusan operator tetap bisa dibandingkan.
    const agentAnalysis = r.verdict
      ? {
          verdict: r.verdict,
          reasoning: r.reasoning ?? null,
          analyzedAt: r.analyzed_at ?? null,
          confidence: r.verdict === "sedang_diperiksa" || r.verdict === "luar_armada" ? "sedang" : "tinggi",
          findings: [
            ev.plate ? `Plat cocok: ${ev.plate}${ev.truckType ? ` (${ev.truckType})` : ""}` : null,
            ev.maxSpeedKph != null ? `Kecepatan tertinggi ${ev.maxSpeedKph} km/jam, batas ${ev.speedLimitKph ?? 80} km/jam` : null,
            ev.driverUncertain ? "Pengemudi tidak dapat dipastikan" : ev.driver?.name ? `Pengemudi bertugas: ${ev.driver.name}` : null,
          ].filter(Boolean),
        }
      : null;
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
    agentConfidence: agentAnalysis?.confidence ?? (decisionSource === "agent" ? "tinggi" : null),
    agentReasoning: agentAnalysis?.reasoning ?? r.alasan ?? null,
    agentFindings: agentAnalysis?.findings ?? [],
    agentAnalysis,
    analysisStatus: r.analysis_status ?? "menunggu",
    analysisError: r.analysis_error ?? null,
    speedSeries: Array.isArray(ev.speedSeries) ? ev.speedSeries : [],
    recordedSpeed: ev.maxSpeedKph ?? null,
    speedLimit: ev.speedLimitKph ?? null,
    coordinates: ev.peak ? { lat: ev.peak.lat, lng: ev.peak.lng } : null,
    vehicleType: ev.truckType ?? null,
    driverName: ev.driver?.name ?? null,
    driverId: ev.driver?.id ?? r.driver_id ?? null,
    driverUncertain: Boolean(ev.driverUncertain),
    truckId: r.truck_id ?? ev.truckId ?? null,
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
    daftarPengemudiCache(),
    baca(
      "trips",
      "?select=truk_id,driver_id,asal,tujuan,mulai,status&status=eq.berjalan&order=mulai.desc&limit=50",
      ANON
    ),
    daftarTrukCache(true),
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

// Ambang pelanggaran: satu sumber di lib/speed-limit.js (perbandingan '>').
const BATAS_NGEBUT_KPJ = BATAS_KECEPATAN_KPJ;

// Dipakai /api/analytics supaya halaman Analitik memakai data sinkron dari
// Supabase, bukan data contoh. fuelDaily hanya membawa info jenis/kapasitas
// (tanpa points) karena skema tak punya telemetri BBM; bagian solar di
// dashboard menampilkan status kosong secara jujur.
function tanggalWIB(iso) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function jamWIB(iso) {
  const jam = Number(
    new Date(iso).toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    })
  );
  // Beberapa engine mengembalikan "24" untuk tengah malam.
  return Number.isFinite(jam) ? jam % 24 : 0;
}

// Sumber analitik live. Agregasi dilakukan di DATABASE (fungsi SQL di
// supabase/analitik-agregat.sql, GROUP BY per hari/jam/truk), sehingga yang
// dikirim ke server hanya puluhan-ratusan baris ringkasan, bukan ratusan
// ribu baris telemetri. Jendela = 2 x rentang + 1 hari (periode berjalan +
// periode pembanding di lib/analytics.js).
// Cadangan bila fungsi SQL belum dibuat: baris mentah, tetap DIBATASI
// rentang waktu dan limit, lalu dikelompokkan di sini.
export async function getAnalyticsSourceLive({ rangeDays = 90 } = {}) {
  if (!URL || !ANON) throw new Error("Env Supabase belum diisi di .env.local");
  const hari = Math.max(7, Math.min(2 * (Number(rangeDays) || 90) + 1, 200));
  const now = new Date();
  const sejakMs = now.getTime() - hari * 864e5;
  const sejakTanggal = tanggalWIB(new Date(sejakMs).toISOString());
  const KUNCI = SERVICE || ANON;

  const [truk, bbm] = await Promise.all([
    daftarTrukCache(true),
    baca(
      "fuel_readings",
      `?select=truck_id,tanggal,liters,refill&tanggal=gte.${sejakTanggal}&order=tanggal.asc&limit=5000`,
      ANON
    ).catch(() => []),
  ]);

  let agregat;
  try {
    const [ngebut, aduan, validasi] = await Promise.all([
      // Ambang 80 tertanam di fungsi SQL (sama dengan BATAS_KECEPATAN_KPJ)
      // supaya indeks parsial idx_positions_ngebut_ts terpakai.
      panggilRpc("analitik_ngebut", { p_hari: hari }, KUNCI),
      panggilRpc("analitik_pengaduan_harian", { p_hari: hari }, KUNCI),
      panggilRpc("analitik_validasi_harian", { p_hari: hari }, KUNCI).catch(() => []),
    ]);
    agregat = { ngebut, aduan, validasi };
  } catch {
    agregat = await agregatDariBarisMentah({ sejakMs, sejakTanggal, KUNCI });
  }
  return shapeAnalyticsSource({ truk, ...agregat, bbm, now });
}

// Jalur cadangan: baris mentah dibatasi rentang waktu, dikelompokkan ke
// bentuk yang sama dengan hasil fungsi SQL.
async function agregatDariBarisMentah({ sejakMs, sejakTanggal, KUNCI }) {
  const sejakIso = new Date(sejakMs).toISOString();
  const [posisi, aduanMentah, runs] = await Promise.all([
    baca(
      "positions",
      `?select=truk_id,lat,lon,kecepatan,ts&kecepatan=gt.${BATAS_NGEBUT_KPJ}&ts=gte.${encodeURIComponent(sejakIso)}&order=ts.desc&limit=5000`,
      ANON
    ),
    baca(
      "pengaduan",
      `?select=plat,tanggal,status,created_at,decided_at,decided_by&deleted_at=is.null&tanggal=gte.${sejakTanggal}&limit=5000`,
      ANON
    ),
    SERVICE
      ? baca(
          "agent_runs",
          `?select=started_at,finished_at&finished_at=gte.${encodeURIComponent(sejakIso)}&limit=5000`,
          SERVICE
        ).catch(() => [])
      : Promise.resolve([]),
  ]);
  void KUNCI;

  // Titik > batas dikelompokkan jadi INSIDEN (episode: titik berturutan
  // berjarak <= JEDA_INSIDEN_MENIT), sama dengan fungsi SQL analitik_ngebut;
  // satu periode ngebut beberapa titik dihitung satu insiden.
  const ngebutMap = new Map();
  for (const e of kelompokkanInsiden(posisi || [])) {
    const tanggal = tanggalWIB(e.mulai);
    const jam = jamWIB(e.mulai);
    const k = `${tanggal}|${jam}|${e.truk_id}`;
    const g = ngebutMap.get(k) ?? { tanggal, jam, truk_id: e.truk_id, jumlah: 0, lat: 0, lon: 0, kecepatan_maks: 0 };
    g.jumlah += 1;
    g.lat += e.lat;
    g.lon += e.lon;
    g.kecepatan_maks = Math.max(g.kecepatan_maks, e.kecepatanMaks);
    ngebutMap.set(k, g);
  }
  const ngebut = [...ngebutMap.values()].map((g) => ({ ...g, lat: g.lat / g.jumlah, lon: g.lon / g.jumlah }));

  const aduanMap = new Map();
  for (const r of aduanMentah || []) {
    if (!r?.tanggal) continue;
    const k = `${r.tanggal}|${r.plat}|${r.status}|${r.decided_by ?? ""}`;
    const g = aduanMap.get(k) ?? { tanggal: r.tanggal, plat: r.plat, status: r.status, decided_by: r.decided_by ?? null, jumlah: 0, totalDetik: 0, nDetik: 0 };
    g.jumlah += 1;
    if (r.decided_at && r.created_at) {
      const detik = (new Date(r.decided_at).getTime() - new Date(r.created_at).getTime()) / 1000;
      if (detik > 0) {
        g.totalDetik += detik;
        g.nDetik += 1;
      }
    }
    aduanMap.set(k, g);
  }
  const aduan = [...aduanMap.values()].map(({ totalDetik, nDetik, ...g }) => ({
    ...g,
    rata_detik: nDetik ? totalDetik / nDetik : null,
  }));

  const validasiMap = new Map();
  for (const r of runs || []) {
    if (!r?.finished_at || !r?.started_at) continue;
    const tanggal = tanggalWIB(r.finished_at);
    const detik = (new Date(r.finished_at).getTime() - new Date(r.started_at).getTime()) / 1000;
    if (!(detik > 0)) continue;
    const g = validasiMap.get(tanggal) ?? { tanggal, jumlah: 0, total: 0 };
    g.jumlah += 1;
    g.total += detik;
    validasiMap.set(tanggal, g);
  }
  const validasi = [...validasiMap.values()].map((g) => ({ tanggal: g.tanggal, jumlah: g.jumlah, rata_detik: g.total / g.jumlah }));
  return { ngebut, aduan, validasi };
}

// Bentuk sumber analitik (murni, tanpa I/O) dari baris AGREGAT:
//   ngebut   [{tanggal, jam, truk_id, jumlah, lat, lon, kecepatan_maks}]
//            (jumlah = INSIDEN/episode, bukan titik telemetri)
//   aduan    [{tanggal, plat, status, decided_by, jumlah, rata_detik}]
//   validasi [{tanggal, jumlah, rata_detik}]
//   bbm      [{truck_id, tanggal, liters, refill}]  (1 baris/truk/hari)
// Bentuk keluaran = getAnalyticsSource() di lib/data.js; semua hitungan
// tetap di lib/analytics.js. speedingEvents membawa `count` (bobot).
export function shapeAnalyticsSource({ truk, ngebut = [], aduan = [], validasi = [], bbm = [], now = new Date() }) {
  const plates = (truk || []).map((t) => t.plat);
  const platDariId = Object.fromEntries((truk || []).map((t) => [t.id, t.plat]));
  // Plat laporan warga bisa beda spasi/huruf; samakan ke plat truk aktif.
  const kunci = (p) => String(p ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const platDariKunci = Object.fromEntries((truk || []).map((t) => [kunci(t.plat), t.plat]));
  const metaDariPlat = Object.fromEntries(
    (truk || []).map((t) => [t.plat, truckTypeMeta(truckTypeFromTipe(t.tipe, t.plat))])
  );
  const statusTren = (s) =>
    s === "valid" ? "tervalidasi" : s === "ditolak" ? "ditolak" : "perluDitinjau";

  // Pengaduan: kelompok (hari, plat, status, pemutus) dibentangkan sesuai
  // jumlahnya (puluhan-ratusan baris, murah) supaya lib/analytics.js tetap
  // menghitung per laporan. lib/analytics.js menyaring lewat plateNumber:
  // laporan truk nonaktif / luar armada otomatis tidak ikut.
  const complaintEvents = [];
  for (const g of aduan || []) {
    if (!g?.tanggal) continue;
    const n = Math.max(1, Number(g.jumlah) || 1);
    for (let i = 0; i < n; i += 1) {
      complaintEvents.push({
        date: String(g.tanggal).slice(0, 10),
        plateNumber: platDariKunci[kunci(g.plat)] ?? null,
        status: statusTren(g.status),
        // "Diselesaikan otomatis" = diputuskan agent (kolom decided_by).
        decidedBy: g.decided_by ?? null,
        avgSeconds: Number(g.rata_detik) > 0 ? Math.round(Number(g.rata_detik)) : 0,
      });
    }
  }

  // Insiden ngebut: satu baris per (hari, jam, truk) dengan bobot count.
  const speedingEvents = (ngebut || [])
    .filter((g) => g?.tanggal && platDariId[g.truk_id])
    .map((g) => {
      const lat = Number(g.lat);
      const lon = Number(g.lon);
      const adaTitik = Number.isFinite(lat) && Number.isFinite(lon);
      return {
        date: String(g.tanggal).slice(0, 10),
        hour: Math.max(0, Math.min(23, Number(g.jam) || 0)),
        plateNumber: platDariId[g.truk_id],
        count: Math.max(1, Number(g.jumlah) || 1),
        location: adaTitik
          ? { label: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, lat: +lat.toFixed(3), lng: +lon.toFixed(3) }
          : null,
      };
    });

  // Rata-rata waktu validasi per hari: dari agent_runs bila ada, selain itu
  // dari selisih decided_at - created_at pengaduan.
  let validationDaily = (validasi || [])
    .filter((g) => g?.tanggal && Number(g.rata_detik) > 0)
    .map((g) => ({ date: String(g.tanggal).slice(0, 10), avgSeconds: Math.round(Number(g.rata_detik) * 10) / 10 }));
  if (!validationDaily.length) {
    const perHari = {};
    for (const g of aduan || []) {
      if (!(Number(g?.rata_detik) > 0)) continue;
      const k = String(g.tanggal).slice(0, 10);
      const n = Math.max(1, Number(g.jumlah) || 1);
      perHari[k] ??= { total: 0, n: 0 };
      perHari[k].total += Number(g.rata_detik) * n;
      perHari[k].n += n;
    }
    validationDaily = Object.entries(perHari).map(([date, v]) => ({
      date,
      avgSeconds: Math.round((v.total / v.n) * 10) / 10,
    }));
  }

  // Level BBM per truk dari fuel_readings; anomali = turun tajam tanpa isi
  // ulang: melewati 1.5x pemakaian harian, atau >50% level saat tangki sudah
  // rendah (variasi normal maks 1.2x). Dihitung di sini supaya konsisten
  // antara dashboard dan chat.
  const bbmByTruk = {};
  for (const r of bbm || []) {
    if (!r?.truck_id || !r?.tanggal) continue;
    (bbmByTruk[r.truck_id] ??= []).push(r);
  }
  const AMBANG_ANOMALI = 1.5;
  const AMBANG_FRAKSI = 0.5;

  return {
    plates,
    // Kunci tanggal string YYYY-MM-DD (WIB): lib/analytics.js membandingkan
    // tanggal secara leksikal dan memanggil addDays(iso, n) pada string.
    endDate: tanggalWIB(now.toISOString()),
    complaintEvents,
    speedingEvents,
    validationDaily,
    fuelAnomalyThresholdFactor: AMBANG_ANOMALI,
    fuelDaily: (truk || []).map((t) => {
      const meta = metaDariPlat[t.plat] ?? {};
      const rows = (bbmByTruk[t.id] || [])
        .slice()
        .sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1));
      let prev = null;
      const points = rows.map((r) => {
        const liters = Number(r.liters);
        const delta = prev == null ? 0 : Math.round((liters - prev) * 10) / 10;
        const drop = prev == null ? 0 : Math.round((prev - liters) * 10) / 10;
        const refill = !!r.refill;
        const harian = meta.dailyUseLiters ?? 25;
        const anomaly =
          !refill &&
          (drop > AMBANG_ANOMALI * harian ||
            (prev > 0 && drop / prev > AMBANG_FRAKSI && drop > 0.5 * harian));
        prev = liters;
        return {
          date: r.tanggal,
          liters,
          deltaLiters: delta,
          refill,
          anomaly,
        };
      });
      return {
        plateNumber: t.plat,
        vehicleType: meta.label ?? null,
        capacityLiters: meta.tankLiters ?? null,
        points,
      };
    }),
    manualEstimateMinutes: 15,
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
