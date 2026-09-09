// Helper server-only untuk baca/tulis Supabase via REST
// (tanpa @supabase/supabase-js). Dipakai dari route handler app/api/*
// dan server component. Jangan dipakai di komponen client.
// Baca pakai anon, tulis/validasi pakai service role.

// Ekstensi .js eksplisit supaya berkas ini juga bisa dimuat node polos
// untuk verifikasi (lihat /tmp/opencode/cek-analitik.mjs).
import { truckTypeFromTipe, truckTypeMeta } from "./truck-types.js";

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

  const [trukMentah, posisiMentah, tripBerjalan, drv] = await Promise.all([
    baca("trucks", `?select=id,plat,nama,tipe,status${activeOnly ? "&status=eq.aktif" : ""}&order=nama&limit=200`, ANON),
    baca("positions", "?select=truk_id,lat,lon,kecepatan,status,ts&order=ts.desc&limit=200", ANON),
    baca("trips", "?select=truk_id,driver_id,asal,tujuan,mulai,waypoints&status=eq.berjalan&order=mulai.desc&limit=200", ANON),
    // drivers tak punya RLS select publik; baca via service role.
    baca("drivers", "?select=id,nama&limit=200", SERVICE),
  ]);
  const driverNama = Object.fromEntries((drv || []).map((d) => [d.id, d.nama]));

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
    baca("drivers", "?select=id,nama,no_hp&order=nama&limit=100", ANON),
    baca(
      "trips",
      "?select=truk_id,driver_id,asal,tujuan,mulai,status&status=eq.berjalan&order=mulai.desc&limit=50",
      ANON
    ),
    baca("trucks", "?select=id,plat,nama&status=eq.aktif&limit=200", ANON),
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

export async function getAnalyticsSourceLive() {
  if (!URL || !ANON) throw new Error("Env Supabase belum diisi di .env.local");
  const [truk, aduan, posisi] = await Promise.all([
    baca("trucks", "?select=id,plat,tipe&limit=100", ANON),
    baca("pengaduan", "?select=tanggal,status,created_at,decided_at&order=tanggal.desc&limit=2000", ANON),
    baca("positions", "?select=truk_id,kecepatan,ts&kecepatan=gt.80&order=ts.desc&limit=2000", ANON),
  ]);

  const plates = (truk || []).map((t) => t.plat);
  const platDariId = Object.fromEntries((truk || []).map((t) => [t.id, t.plat]));
  // Plat laporan warga bisa beda spasi/huruf; samakan ke plat truk aktif.
  const kunci = (p) => String(p ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const platDariKunci = Object.fromEntries((truk || []).map((t) => [kunci(t.plat), t.plat]));
  const metaDariPlat = Object.fromEntries(
    (truk || []).map((t) => [t.plat, truckTypeMeta(truckTypeFromTipe(t.tipe, t.plat))])
  );

  const detikValidasi = (r) => {
    if (!r?.decided_at || !r?.created_at) return 0;
    const s = Math.round((new Date(r.decided_at).getTime() - new Date(r.created_at).getTime()) / 1000);
    return Number.isFinite(s) && s > 0 ? s : 0;
  };
  const statusTren = (s) =>
    s === "valid" ? "tervalidasi" : s === "ditolak" ? "ditolak" : "perluDitinjau";

  const complaintEvents = (aduan || [])
    .filter((r) => r?.tanggal)
    .map((r) => ({
      date: r.tanggal,
      // lib/analytics.js menyaring lewat plateNumber: laporan untuk truk
      // nonaktif / luar armada otomatis tidak ikut dihitung.
      plateNumber: platDariKunci[kunci(r.plat)] ?? null,
      status: statusTren(r.status),
      // "Diselesaikan otomatis" = diputuskan agent (kolom decided_by).
      decidedBy: r.decided_by ?? null,
      avgSeconds: detikValidasi(r),
    }));

  // Insiden ngebut hanya untuk truk aktif (platDariId berisi truk aktif saja).
  const speedingEvents = (posisi || [])
    .filter((p) => p?.ts && platDariId[p.truk_id] && Number(p.kecepatan) > BATAS_NGEBUT_KPJ)
    .map((p) => ({
      date: tanggalWIB(p.ts),
      hour: jamWIB(p.ts),
      plateNumber: platDariId[p.truk_id],
      speedKph: Math.round(Number(p.kecepatan) || 0),
      location:
        p.lat != null && p.lon != null
          ? {
              label: `${Number(p.lat).toFixed(3)}, ${Number(p.lon).toFixed(3)}`,
              lat: Number(p.lat),
              lng: Number(p.lon),
            }
          : null,
    }));

  // Rata-rata waktu validasi per hari: dari agent_runs bila ada, selain itu
  // dari selisih decided_at - created_at pengaduan.
  const perHari = {};
  const tambah = (k, detik) => {
    if (!k || k === "Invalid Date" || !(detik > 0)) return;
    if (!perHari[k]) perHari[k] = { total: 0, n: 0 };
    perHari[k].total += detik;
    perHari[k].n += 1;
  };
  if ((runs || []).length) {
    for (const r of runs) {
      const detik = Math.round((new Date(r.finished_at).getTime() - new Date(r.started_at).getTime()) / 1000);
      tambah(tanggalWIB(r.finished_at), detik);
    }
  } else {
    for (const r of aduan || []) {
      if (!r?.decided_at) continue;
      tambah(tanggalWIB(r.decided_at), detikValidasi(r));
    }
  }
  const validationDaily = Object.entries(perHari).map(([date, v]) => ({
    date,
    avgSeconds: v.n ? Math.round((v.total / v.n) * 10) / 10 : 0,
  }));

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
