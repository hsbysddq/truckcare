// Analisis otomatis pengaduan (server-only). Seluruh perhitungan kecepatan
// dan pencocokan waktu dilakukan KODE ini, bukan model bahasa; model (bila
// OPENCLAW_ENDPOINT terisi) hanya dipakai menyusun ulang kalimat penjelasan
// dari angka yang sudah dihitung, dan hasilnya selalu punya cadangan templat.
//
// analyzeComplaint(id):
//   a) normalisasi plat -> cari di trucks; tidak ada -> luar_armada, berhenti
//   b) telemetri (positions) 30 menit sebelum-sesudah kejadian: maks, rata-rata,
//      koordinat titik tercepat
//   c) pengemudi bertugas dari schedules (truck_id + rentang waktu); tidak ada
//      jadwal cocok -> "tidak dapat dipastikan" (tidak menebak)
//   d) verdict: terbukti / tidak_terbukti / sedang_diperiksa
//   e) simpan verdict, reasoning, evidence + satu baris agent_runs
// Kolom: lihat supabase/pengaduan-analisis.sql.

import { baca, tulis } from "./supabase.js";
import { plateKey } from "./format.js";
import { truckTypeFromTipe, truckTypeMeta } from "./truck-types.js";

export const SPEED_LIMIT_KPH = 80;
export const WINDOW_MINUTES = 30;
// "Sedikit di atas batas" = lewat batas tapi tidak lebih dari margin ini.
export const MARGIN_KPH = 10;
// "Jauh di bawah batas" = maks di bawah nilai ini dianggap tidak terbukti.
export const FAR_BELOW_KPH = 70;
export const STATIONARY_KPH = 5;
// Jam laporan ditulis dalam waktu Indonesia bagian barat.
const TZ_OFFSET = "+07:00";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function pad(n) {
  return String(n).padStart(2, "0");
}

// Rentang waktu kejadian. Tanpa jam: satu hari penuh (ditandai di evidence).
export function incidentWindow(tanggal, jam) {
  const hasTime = typeof jam === "string" && /^\d{1,2}:\d{2}/.test(jam);
  const t = hasTime ? jam.slice(0, 5) : "12:00";
  const center = new Date(`${tanggal}T${t}:00${TZ_OFFSET}`);
  if (Number.isNaN(center.getTime())) return null;
  if (!hasTime) {
    return {
      start: new Date(`${tanggal}T00:00:00${TZ_OFFSET}`),
      end: new Date(`${tanggal}T23:59:59${TZ_OFFSET}`),
      center,
      hasTime: false,
    };
  }
  return {
    start: new Date(center.getTime() - WINDOW_MINUTES * 60000),
    end: new Date(center.getTime() + WINDOW_MINUTES * 60000),
    center,
    hasTime: true,
  };
}

// Statistik telemetri: maks, rata-rata, titik tercepat, deret untuk grafik.
export function summarizeTelemetry(points) {
  if (!points.length) return null;
  let max = null;
  let sum = 0;
  for (const p of points) {
    const v = Number(p.kecepatan) || 0;
    sum += v;
    if (!max || v > max.speed) max = { speed: v, lat: p.lat, lng: p.lon, ts: p.ts };
  }
  const step = Math.max(1, Math.ceil(points.length / 60));
  const series = points
    .filter((_, i) => i % step === 0)
    .map((p) => {
      const d = new Date(p.ts);
      const wib = new Date(d.getTime() + 7 * 3600000);
      return { label: `${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}`, speedKph: Math.round(Number(p.kecepatan) || 0) };
    });
  return {
    maxSpeedKph: Math.round(max.speed),
    avgSpeedKph: Math.round(sum / points.length),
    sampleCount: points.length,
    peak: { lat: Number(max.lat), lng: Number(max.lng), ts: max.ts },
    speedSeries: series,
  };
}

// Jadwal yang mencakup waktu kejadian (realisasi bila ada, rencana bila belum).
export function matchSchedule(schedules, at) {
  const t = at.getTime();
  return (
    schedules.find((s) => {
      if (s.status === "batal") return false;
      const dep = new Date(s.actual_departure ?? s.planned_departure).getTime();
      const arr = new Date(s.actual_arrival ?? s.planned_arrival).getTime();
      return dep <= t && t <= arr;
    }) ?? null
  );
}

// Aturan verdict (deterministik).
export function decideVerdict({ telemetry, driverUncertain }) {
  if (!telemetry) return { verdict: "sedang_diperiksa", reason: "tanpa_telemetri" };
  const v = telemetry.maxSpeedKph;
  if (v > SPEED_LIMIT_KPH + MARGIN_KPH) {
    return driverUncertain
      ? { verdict: "sedang_diperiksa", reason: "pengemudi_tidak_pasti" }
      : { verdict: "terbukti", reason: "melebihi_batas" };
  }
  if (v > SPEED_LIMIT_KPH) return { verdict: "sedang_diperiksa", reason: "sedikit_di_atas" };
  if (v <= STATIONARY_KPH) return { verdict: "tidak_terbukti", reason: "diam" };
  if (v <= FAR_BELOW_KPH) return { verdict: "tidak_terbukti", reason: "jauh_di_bawah" };
  return { verdict: "sedang_diperiksa", reason: "mendekati_batas" };
}

// Kalimat penjelasan dari angka (templat, tanpa model).
export function composeReasoning({ plate, truckType, telemetry, window, driver, driverUncertain, decision }) {
  const jam = window.hasTime
    ? `pukul ${pad(window.center.getUTCHours() + 7 > 23 ? window.center.getUTCHours() + 7 - 24 : window.center.getUTCHours() + 7)}:${pad(window.center.getUTCMinutes())} ±${WINDOW_MINUTES} menit`
    : "sepanjang hari kejadian (jam tidak disebutkan pelapor)";
  const parts = [];
  if (!telemetry) {
    parts.push(`Tidak ada rekaman perjalanan ${plate} (${truckType}) pada ${jam}, sehingga laporan belum bisa dicocokkan dengan data.`);
  } else {
    parts.push(
      `Rekaman perjalanan ${plate} (${truckType}) pada ${jam} mencatat kecepatan tertinggi ${telemetry.maxSpeedKph} km/jam dan rata-rata ${telemetry.avgSpeedKph} km/jam dari ${telemetry.sampleCount} titik data; batas yang dipakai ${SPEED_LIMIT_KPH} km/jam.`
    );
    if (decision.reason === "melebihi_batas") parts.push(`Kecepatan tertinggi melampaui batas ${telemetry.maxSpeedKph - SPEED_LIMIT_KPH} km/jam, sehingga laporan dinyatakan terbukti.`);
    if (decision.reason === "sedikit_di_atas") parts.push(`Selisihnya hanya ${telemetry.maxSpeedKph - SPEED_LIMIT_KPH} km/jam di atas batas, masih perlu ditinjau tim.`);
    if (decision.reason === "diam") parts.push("Truk tercatat diam sepanjang rentang waktu itu, sehingga laporan tidak terbukti.");
    if (decision.reason === "jauh_di_bawah") parts.push("Kecepatan jauh di bawah batas, sehingga laporan tidak terbukti.");
    if (decision.reason === "mendekati_batas") parts.push("Kecepatan mendekati batas tanpa melampauinya, perlu ditinjau tim.");
  }
  if (driverUncertain) {
    parts.push("Pengemudi yang bertugas tidak dapat dipastikan karena tidak ada jadwal yang cocok dengan waktu kejadian.");
  } else if (driver?.name) {
    parts.push(`Pengemudi bertugas menurut jadwal: ${driver.name}.`);
  }
  return parts.join(" ");
}

// Opsional: minta model merangkai ulang kalimat dari angka yang SAMA. Angka
// tidak boleh berubah; bila gagal/timeout, pakai templat.
async function polesDenganModel(templat, angka) {
  const endpoint = process.env.OPENCLAW_ENDPOINT;
  if (!endpoint) return templat;
  try {
    const res = await fetch(`${endpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        pesan:
          "Tulis ulang penjelasan berikut menjadi 2-3 kalimat bahasa Indonesia yang rapi untuk operator armada. " +
          "JANGAN mengubah, menambah, atau menghilangkan angka apa pun. Data: " +
          JSON.stringify(angka) +
          "\nTeks: " +
          templat,
      }),
      cache: "no-store",
    });
    if (!res.ok) return templat;
    const data = await res.json();
    const teks = String(data?.jawaban ?? data?.text ?? "").trim();
    // Validasi: semua angka penting harus tetap muncul.
    const wajib = [angka.maxSpeedKph, angka.avgSpeedKph, SPEED_LIMIT_KPH].filter((n) => n != null).map(String);
    return teks && wajib.every((n) => teks.includes(n)) ? teks : templat;
  } catch {
    return templat;
  }
}

async function catatRun({ complaintId, trigger, startedAt, outcome, notes }) {
  try {
    await tulis("agent_runs", "POST", "", {
      trigger_type: trigger === "pengguna" ? "pengguna" : "otomatis",
      complaint_id: complaintId,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      outcome,
      notes: notes ? String(notes).slice(0, 500) : null,
    });
  } catch {
    // Tabel agent_runs belum ada / gagal: jangan gagalkan analisis.
  }
}

const OUTCOME = { terbukti: "valid", tidak_terbukti: "ditolak", sedang_diperiksa: "perlu-ditinjau", luar_armada: "perlu-ditinjau" };
const STATUS_DB = { terbukti: "valid", tidak_terbukti: "ditolak", sedang_diperiksa: "perlu-ditinjau" };
const LABEL = { terbukti: "Terbukti", tidak_terbukti: "Tidak terbukti", sedang_diperiksa: "Sedang diperiksa" };

export async function analyzeComplaint(id, { trigger = "otomatis" } = {}) {
  if (!SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi");
  const startedAt = new Date().toISOString();
  const rows = await baca("pengaduan", `?select=id,plat,tanggal,jam,status,decided_by&id=eq.${encodeURIComponent(id)}`, SERVICE);
  const laporan = rows?.[0];
  if (!laporan) throw new Error("pengaduan tidak ditemukan");
  const belumDiputuskanManusia = laporan.decided_by !== "operator";

  await tulis("pengaduan", "PATCH", `?id=eq.${encodeURIComponent(id)}`, { analysis_status: "berjalan", analysis_error: null });

  try {
    // a) plat -> truk
    const kunci = plateKey(laporan.plat);
    // Hanya truk aktif (trucks.status = 'aktif'); nonaktif dianggap luar armada.
    const trucks = await baca("trucks", "?select=id,plat,tipe&status=eq.aktif&limit=200", SERVICE);
    const truck = (trucks || []).find((t) => plateKey(t.plat) === kunci) ?? null;
    if (!truck) {
      const reasoning = `Plat ${laporan.plat} tidak terdaftar di armada, sehingga tidak ada data perjalanan yang bisa dicocokkan.`;
      await tulis("pengaduan", "PATCH", `?id=eq.${encodeURIComponent(id)}`, {
        analysis_status: "luar_armada",
        analyzed_at: new Date().toISOString(),
        verdict: "luar_armada",
        reasoning,
        evidence: { plate: laporan.plat, speedLimitKph: SPEED_LIMIT_KPH },
        truck_id: null,
        driver_id: null,
        ...(belumDiputuskanManusia && laporan.status === "menunggu" ? { status: "luar_armada" } : {}),
      });
      await catatRun({ complaintId: id, trigger, startedAt, outcome: OUTCOME.luar_armada, notes: reasoning });
      return { verdict: "luar_armada", reasoning };
    }
    const typeKey = truckTypeFromTipe(truck.tipe, truck.plat);
    const truckType = truckTypeMeta(typeKey).label;

    // b) telemetri pada rentang kejadian
    const window = incidentWindow(laporan.tanggal, laporan.jam);
    if (!window) throw new Error("tanggal kejadian tidak valid");
    const positions = await baca(
      "positions",
      `?select=lat,lon,kecepatan,ts&truk_id=eq.${truck.id}&ts=gte.${encodeURIComponent(window.start.toISOString())}&ts=lte.${encodeURIComponent(window.end.toISOString())}&order=ts.asc&limit=2000`,
      SERVICE
    );
    const telemetry = summarizeTelemetry(positions || []);

    // c) pengemudi bertugas dari jadwal (tidak menebak)
    const schedules = await baca(
      "schedules",
      `?select=id,driver_id,planned_departure,planned_arrival,actual_departure,actual_arrival,status,drivers(nama)&truck_id=eq.${truck.id}&planned_departure=lte.${encodeURIComponent(window.end.toISOString())}&planned_arrival=gte.${encodeURIComponent(new Date(window.start.getTime() - 12 * 3600000).toISOString())}&order=planned_departure.asc&limit=50`,
      SERVICE
    );
    const jadwal = matchSchedule(schedules || [], window.center);
    const driver = jadwal?.driver_id ? { id: jadwal.driver_id, name: jadwal.drivers?.nama ?? null, scheduleId: jadwal.id } : null;
    const driverUncertain = !driver;

    // d) verdict
    const decision = decideVerdict({ telemetry, driverUncertain });
    const templat = composeReasoning({ plate: truck.plat, truckType, telemetry, window, driver, driverUncertain, decision });
    const reasoning = await polesDenganModel(templat, {
      plate: truck.plat,
      maxSpeedKph: telemetry?.maxSpeedKph ?? null,
      avgSpeedKph: telemetry?.avgSpeedKph ?? null,
      speedLimitKph: SPEED_LIMIT_KPH,
      verdict: LABEL[decision.verdict],
    });

    // e) simpan
    const evidence = {
      plate: truck.plat,
      truckId: truck.id,
      truckType,
      speedLimitKph: SPEED_LIMIT_KPH,
      windowStart: window.start.toISOString(),
      windowEnd: window.end.toISOString(),
      hasTime: window.hasTime,
      maxSpeedKph: telemetry?.maxSpeedKph ?? null,
      avgSpeedKph: telemetry?.avgSpeedKph ?? null,
      sampleCount: telemetry?.sampleCount ?? 0,
      peak: telemetry?.peak ?? null,
      speedSeries: telemetry?.speedSeries ?? [],
      driver,
      driverUncertain,
      reason: decision.reason,
    };
    const findings = [
      `Plat cocok: ${truck.plat} (${truckType})`,
      telemetry ? `Kecepatan tertinggi ${telemetry.maxSpeedKph} km/jam, batas ${SPEED_LIMIT_KPH} km/jam` : "Telemetri tidak tersedia pada rentang kejadian",
      driverUncertain ? "Pengemudi tidak dapat dipastikan (tanpa jadwal cocok)" : `Pengemudi bertugas: ${driver.name ?? "-"}`,
    ];
    const update = {
      analysis_status: "selesai",
      analyzed_at: new Date().toISOString(),
      verdict: decision.verdict,
      reasoning,
      evidence,
      truck_id: truck.id,
      driver_id: driver?.id ?? null,
      analysis_error: null,
    };
    // Status laporan hanya diubah bila belum diputuskan manusia.
    if (belumDiputuskanManusia && laporan.status !== "luar_armada") {
      Object.assign(update, {
        status: STATUS_DB[decision.verdict],
        diputuskan_oleh: "agent",
        decided_by: "agent",
        decided_by_name: null,
        decided_at: update.analyzed_at,
        alasan: reasoning,
        decision_reason: findings,
      });
    }
    await tulis("pengaduan", "PATCH", `?id=eq.${encodeURIComponent(id)}`, update);
    await catatRun({ complaintId: id, trigger, startedAt, outcome: OUTCOME[decision.verdict], notes: reasoning });
    return { verdict: decision.verdict, reasoning, evidence };
  } catch (e) {
    await tulis("pengaduan", "PATCH", `?id=eq.${encodeURIComponent(id)}`, {
      analysis_status: "gagal",
      analyzed_at: new Date().toISOString(),
      analysis_error: String(e?.message ?? e).slice(0, 300),
    }).catch(() => {});
    await catatRun({ complaintId: id, trigger, startedAt, outcome: "gagal", notes: e?.message });
    throw e;
  }
}
