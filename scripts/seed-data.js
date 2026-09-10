// Generator data TURUNAN demo Circle T (murni, tanpa I/O) dipakai
// scripts/seed.js. Identitas armada (truk, pengemudi) TIDAK dibuat di sini:
// pemanggil memberi FLEET_TRUCKS / FLEET_DRIVERS dari scripts/fleet-data.js.
// Seluruh keacakan lewat lib/seeded-random.js dengan benih tetap, jadi dua
// kali menjalankan generator menghasilkan data yang persis sama.
//
// Keluaran (relatif terhadap tanggal hari ini WIB):
//   positions  telemetri 90 hari ke belakang s.d. hari ini (trip_id null =
//              penanda baris seed; simulator hanya menghapus baris miliknya)
//   pengaduan  ±1 laporan/hari selama 90 hari, minimal 10 pada 7 hari terakhir,
//              ~70% diputuskan agent, ~20% operator, ~10% perlu ditinjau;
//              evidence.seed = true sebagai penanda
//   agentRuns  satu run per pengaduan (started_at/finished_at masuk akal)
//   schedules  jadwal tiap pengemudi pada truk tetapnya (notes 'seed-demo')
import { seededRandom, randBetween, randInt, randPick } from "../lib/seeded-random.js";
import { BATAS_KECEPATAN_KPJ } from "../lib/speed-limit.js";

export const HARI_RENTANG = 90;
// Ambang dari satu sumber (lib/speed-limit.js).
export const BATAS_KMJ = BATAS_KECEPATAN_KPJ;

const KOTA = {
  Surabaya: [-7.2575, 112.7521],
  Malang: [-7.9666, 112.6326],
  Sidoarjo: [-7.4478, 112.7183],
  Pasuruan: [-7.6453, 112.9075],
  Gresik: [-7.1554, 112.653],
  Kediri: [-7.848, 112.0178],
  Krian: [-7.4097, 112.5818],
};
const RUTE = [
  ["Surabaya", "Malang", 5.0],
  ["Sidoarjo", "Pasuruan", 2.5],
  ["Gresik", "Surabaya", 1.5],
  ["Malang", "Kediri", 3.5],
  ["Surabaya", "Gresik", 1.5],
  ["Pasuruan", "Malang", 3.0],
  ["Kediri", "Malang", 3.5],
  ["Sidoarjo", "Krian", 1.0],
  ["Surabaya", "Pasuruan", 2.5],
  ["Malang", "Surabaya", 5.0],
];
const MUATAN = ["FMCG", "Material konstruksi", "Kontainer", "Solar industri", "Hasil pertanian", "Elektronik", "Bahan bangunan", "Retail"];
const LOKASI = [
  "Jalan Raya Porong",
  "Tol Surabaya-Malang KM 32",
  "Jalan Ahmad Yani Surabaya",
  "Jalan Raya Gempol",
  "Bypass Krian",
  "Jalan Raya Lawang",
  "Tol Gempol-Pasuruan KM 12",
  "Jalan Raya Kepanjen",
];
const DESKRIPSI = [
  "Truk melaju sangat kencang di {lokasi}, menyalip dari bahu jalan.",
  "Truk ngebut dan hampir menyerempet motor di {lokasi}.",
  "Truk berjalan zig-zag dengan kecepatan tinggi di sekitar {lokasi}.",
  "Truk terlalu cepat saat melewati pasar di {lokasi}, banyak pejalan kaki.",
  "Truk membunyikan klakson panjang dan mengebut di {lokasi}.",
  "Truk menyalip dalam kondisi jalan padat di {lokasi}, sangat membahayakan.",
  "Truk melaju kencang di turunan {lokasi}, muatan terlihat goyang.",
  "Truk mengebut di {lokasi} saat hujan deras.",
];

const bulat = randInt;
const pilih = randPick;
function uuidDari(r) {
  const h = () => Math.floor(r() * 16).toString(16);
  const s = (n) => Array.from({ length: n }, h).join("");
  return `${s(8)}-${s(4)}-4${s(3)}-${"89ab"[Math.floor(r() * 4)]}${s(3)}-${s(12)}`;
}

// Tengah malam WIB untuk tanggal YYYY-MM-DD, sebagai epoch ms.
function awalHariWIB(tanggal) {
  return new Date(`${tanggal}T00:00:00+07:00`).getTime();
}
function tanggalWIB(ms) {
  return new Date(ms).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}
const iso = (ms) => new Date(ms).toISOString();
const jamStr = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta", hour12: false });

function titikRute(rute, frac) {
  const [a, b] = [KOTA[rute[0]], KOTA[rute[1]]];
  return { lat: a[0] + (b[0] - a[0]) * frac, lon: a[1] + (b[1] - a[1]) * frac };
}

// trucks : [{id, plat}]                 (FLEET_TRUCKS)
// drivers: [{id, nama, truck_id}]        (FLEET_DRIVERS; truck_id = truk tetap)
export function generateSeed({ trucks, drivers, now = Date.now(), benih = 20260910 }) {
  if (!trucks?.length) throw new Error("Tidak ada truk aktif untuk di-seed.");
  const r = seededRandom(benih);
  const hariIni = tanggalWIB(now);
  const awalHariIni = awalHariWIB(hariIni);
  const batasTs = now - 10 * 60 * 1000; // jangan menulis ke masa depan / menimpa posisi live
  const trukDariId = Object.fromEntries(trucks.map((t) => [t.id, t]));

  const positions = [];
  const schedules = [];
  const pengaduan = [];
  const agentRuns = [];

  // ---------- Jadwal: tiap pengemudi pada truk tetapnya ----------
  // Pengemudi tanpa truck_id (atau truknya tidak aktif) dilewati. Satu
  // pengemudi per truk, jadi tidak ada tumpang tindih (constraint no_overlap).
  const nD = drivers.length;
  const grupA = Math.max(1, Math.round(nD * 0.6));
  const grupB = Math.max(1, Math.round(nD * 0.27));
  const jadwalTruk = {}; // truckId -> [{depMs, arrMs, driverId}]
  drivers.forEach((d, i) => {
    const truk = trukDariId[d.truck_id];
    if (!truk) return;
    const rn = i + 1;
    const jam = 5 + (i % 3) * 3; // 05 / 08 / 11 (variasi jam berangkat)
    let hari = [];
    if (rn <= grupA) {
      hari = [0];
      for (let off = 3; off <= HARI_RENTANG; off += 3) hari.push(off);
    } else if (rn <= grupA + grupB) {
      hari = [1, 4];
      for (let off = 9; off <= HARI_RENTANG; off += 7) hari.push(off);
    } else {
      hari = [20, 50, 80];
    }
    for (const off of hari) {
      const rute = RUTE[(rn + off) % RUTE.length];
      const dep = awalHariIni - off * 864e5 + jam * 36e5;
      const arr = dep + rute[2] * 36e5;
      let status = "selesai";
      let actualDep = dep + bulat(r, -5, 20) * 6e4;
      let actualArr = arr + bulat(r, -10, 40) * 6e4;
      if (off === 0) {
        status = "berjalan";
        actualArr = null;
        if (actualDep > batasTs) actualDep = null;
      } else if (actualArr - arr > 30 * 6e4) {
        status = "terlambat";
      }
      schedules.push({
        truck_id: truk.id,
        driver_id: d.id,
        origin: rute[0],
        destination: rute[1],
        planned_departure: iso(dep),
        planned_arrival: iso(arr),
        actual_departure: actualDep == null ? null : iso(actualDep),
        actual_arrival: actualArr == null ? null : iso(actualArr),
        status,
        cargo_type: pilih(r, MUATAN),
        notes: "seed-demo",
      });
      (jadwalTruk[truk.id] ||= []).push({ depMs: dep, arrMs: arr, driverId: d.id });
    }
  });
  const pengemudiTetap = Object.fromEntries(drivers.filter((d) => d.truck_id).map((d) => [d.truck_id, d.id]));
  const pengemudiBertugas = (truckId, ms) => {
    const list = jadwalTruk[truckId] || [];
    const tepat = list.find((j) => ms >= j.depMs - 36e5 && ms <= j.arrMs + 36e5);
    if (tepat) return tepat.driverId;
    return pengemudiTetap[truckId] ?? null;
  };

  // ---------- Telemetri harian normal (< batas) ----------
  trucks.forEach((truk, ti) => {
    for (let off = HARI_RENTANG - 1; off >= 0; off -= 1) {
      const hari0 = awalHariIni - off * 864e5;
      const rute = RUTE[(ti + off) % RUTE.length];
      const mulai = hari0 + (5 + (ti % 3) * 6) * 36e5 + bulat(r, -20, 20) * 6e4;
      const durasi = rute[2] * 36e5;
      // 6 titik normal sepanjang perjalanan.
      for (let k = 0; k < 6; k += 1) {
        const ts = mulai + (durasi * (k + 0.5)) / 6;
        if (ts > batasTs) continue;
        const p = titikRute(rute, (k + 0.5) / 6);
        const kec = k === 5 ? 0 : bulat(r, 35, 70);
        positions.push({
          trip_id: null,
          truk_id: truk.id,
          lat: +p.lat.toFixed(5),
          lon: +p.lon.toFixed(5),
          kecepatan: kec,
          status: kec > 0 ? "jalan" : "berhenti",
          ts: iso(ts),
        });
      }
    }
  });

  // ---------- Insiden ngebut (episode beberapa titik berturutan) ----------
  // ~25-35 insiden sepanjang 90 hari, 3 dijamin dalam 7 hari terakhir.
  // Tidak merata: 5 truk "berat" menyumbang ~75%; jam lebih sering siang
  // menjelang sore (13-16) dan malam (20-23). Kecepatan 85-120 km/jam,
  // 4-7 titik berjarak 30 detik, diapit titik konteks < batas.
  const insiden = [];
  const trukBerat = [0, 2, 4, 9, 12].filter((i) => i < trucks.length).map((i) => trucks[i]);
  const pilihTrukInsiden = () => (trukBerat.length && r() < 0.75 ? pilih(r, trukBerat) : pilih(r, trucks));
  const jamInsiden = () => {
    const x = r();
    if (x < 0.45) return bulat(r, 13, 16);
    if (x < 0.8) return bulat(r, 20, 23);
    return bulat(r, 5, 23);
  };
  const titikPosisi = (truk, rute, frac, kec, ms) => ({
    trip_id: null,
    truk_id: truk.id,
    lat: +titikRute(rute, Math.min(1, Math.max(0, frac))).lat.toFixed(5),
    lon: +titikRute(rute, Math.min(1, Math.max(0, frac))).lon.toFixed(5),
    kecepatan: kec,
    status: "jalan",
    ts: iso(ms),
  });
  const buatInsiden = ({ truk, off, jam, menit, puncakMin = 85, puncakMaks = 120 }) => {
    const hari0 = awalHariIni - off * 864e5;
    const mulaiMs = hari0 + jam * 36e5 + menit * 6e4;
    if (mulaiMs + 4 * 60e3 > batasTs) return null; // jangan ke masa depan
    const rute = RUTE[(trucks.indexOf(truk) + off) % RUTE.length];
    const frac0 = 0.1 + r() * 0.7;
    const n = bulat(r, 4, 7);
    const puncak = bulat(r, puncakMin, puncakMaks);
    const titik = [];
    for (let k = 0; k < n; k += 1) {
      // Profil naik ke puncak lalu turun; semua titik >= 85 (> batas).
      const tengah = (n - 1) / 2;
      const dekatPuncak = 1 - Math.abs((k - tengah) / (tengah || 1));
      const kec = Math.round(85 + (puncak - 85) * (0.5 + 0.5 * dekatPuncak));
      titik.push(titikPosisi(truk, rute, frac0 + k * 0.02, kec, mulaiMs + k * 30e3));
    }
    const konteks = [
      titikPosisi(truk, rute, frac0 - 0.04, bulat(r, 55, 68), mulaiMs - 60e3),
      titikPosisi(truk, rute, frac0 - 0.02, bulat(r, 68, 78), mulaiMs - 30e3),
      titikPosisi(truk, rute, frac0 + n * 0.02, bulat(r, 66, 78), mulaiMs + n * 30e3),
      titikPosisi(truk, rute, frac0 + (n + 1) * 0.02, bulat(r, 50, 64), mulaiMs + (n + 1) * 30e3),
    ];
    positions.push(...konteks, ...titik);
    const e = {
      truk,
      off,
      plat: truk.plat,
      mulai: iso(mulaiMs),
      mulaiMs,
      selesaiMs: mulaiMs + (n - 1) * 30e3,
      puncak: Math.max(...titik.map((t) => t.kecepatan)),
      titik,
      deret: [...konteks, ...titik].sort((x, y) => (x.ts < y.ts ? -1 : 1)),
    };
    insiden.push(e);
    return e;
  };
  const JUMLAH_INSIDEN_DASAR = 24;
  const offDasar = [1, 3, 5]; // dijamin ada di 7 hari terakhir
  while (offDasar.length < JUMLAH_INSIDEN_DASAR) offDasar.push(bulat(r, 0, HARI_RENTANG - 1));
  for (const off of offDasar) buatInsiden({ truk: pilihTrukInsiden(), off, jam: jamInsiden(), menit: bulat(r, 0, 59) });
  const insidenPadaHari = (off) => insiden.filter((e) => e.off === off);

  // Deret kecepatan untuk grafik bukti di panel Pengaduan (label HH:MM WIB),
  // shape sama dengan summarizeTelemetry di lib/complaint-analysis.js.
  const deretBukti = (points) =>
    points.map((p) => ({ label: jamStr(new Date(p.ts).getTime()).slice(0, 5), speedKph: p.kecepatan }));

  // ---------- Pengaduan + agent_runs ----------
  // Jumlah per hari: 7 hari terakhir dijamin >= 10 laporan, sisanya 0-3/hari.
  // Pengaduan VALID selalu jatuh pada truk & waktu yang punya insiden di
  // telemetri (70% menempel ke insiden hari itu; sisanya insiden baru), jadi
  // grafik bukti kecepatan di Pengaduan cocok dengan Analitik.
  for (let off = HARI_RENTANG - 1; off >= 0; off -= 1) {
    const hari0 = awalHariIni - off * 864e5;
    let n;
    if (off <= 2) n = 2;
    else if (off <= 6) n = 1 + (r() < 0.4 ? 1 : 0);
    else n = [0, 1, 1, 1, 2, 2, 3][Math.floor(r() * 7)];
    for (let i = 0; i < n; i += 1) {
      // Hari ini: kejadian harus sudah lewat (minimal 40 menit sebelum sekarang).
      const maksJam = off === 0 ? Math.floor((batasTs - 30 * 6e4 - hari0) / 36e5) : 22;
      if (maksJam < 6) continue;
      const x = r();
      const oleh = x < 0.7 ? "agent" : x < 0.9 ? "operator" : null;

      let truk = pilih(r, trucks);
      let kejadian = hari0 + bulat(r, 6, maksJam) * 36e5 + bulat(r, 0, 59) * 6e4;
      let episode = null;
      const padaHari = insidenPadaHari(off);
      if (padaHari.length && r() < 0.7) {
        episode = pilih(r, padaHari);
        truk = episode.truk;
        kejadian = episode.mulaiMs + bulat(r, 0, 2) * 6e4;
      }
      let status;
      if (!oleh) status = "perlu-ditinjau";
      else if (episode) status = r() < 0.9 ? "valid" : "perlu-ditinjau";
      else if (r() < 0.12) {
        episode = buatInsiden({
          truk,
          off,
          jam: Math.floor((kejadian - hari0) / 36e5),
          menit: Math.floor(((kejadian - hari0) % 36e5) / 6e4),
          puncakMaks: 100,
        });
        status = episode ? "valid" : "ditolak";
      } else status = "ditolak";

      // Telemetri untuk pengaduan tanpa insiden: konsisten dengan keputusan.
      let deret;
      if (episode) {
        deret = episode.deret;
      } else {
        const rentangKec = status === "ditolak" ? [38, 62] : [72, BATAS_KMJ];
        const rute = RUTE[(trucks.indexOf(truk) + off) % RUTE.length];
        const rendah = [];
        for (let k = -2; k <= 2; k += 1) {
          rendah.push(titikPosisi(truk, rute, r(), bulat(r, rentangKec[0], rentangKec[1]), kejadian + k * 2 * 6e4));
        }
        positions.push(...rendah);
        deret = rendah;
      }
      const kecList = deret.map((p) => p.kecepatan);
      const maks = Math.max(...kecList);
      const rata = Math.round(kecList.reduce((a, b) => a + b, 0) / kecList.length);
      const puncakTitik = deret.find((p) => p.kecepatan === maks);
      const dibuat = Math.min(kejadian + bulat(r, 15, 180) * 6e4, batasTs);
      const lokasi = pilih(r, LOKASI);
      const id = uuidDari(r);

      const runMulai = dibuat + 2000;
      const runSelesai = runMulai + bulat(r, 20, 120) * 1000;
      const decidedAt =
        oleh === "agent" ? runSelesai : oleh === "operator" ? dibuat + bulat(r, 30, 240) * 6e4 : null;
      const alasanAgent =
        status === "valid"
          ? `Telemetri mencatat kecepatan maksimum ${maks} km/jam (rata-rata ${rata} km/jam) pada jendela 30 menit di sekitar jam kejadian, melampaui batas ${BATAS_KMJ} km/jam.`
          : status === "ditolak"
            ? `Telemetri mencatat kecepatan maksimum ${maks} km/jam (rata-rata ${rata} km/jam) pada jendela 30 menit di sekitar jam kejadian, di bawah batas ${BATAS_KMJ} km/jam.`
            : `Kecepatan maksimum ${maks} km/jam (rata-rata ${rata} km/jam) pada jendela 30 menit di sekitar jam kejadian; perlu peninjauan operator.`;
      const verdict = status === "valid" ? "terbukti" : status === "ditolak" ? "tidak_terbukti" : "sedang_diperiksa";

      pengaduan.push({
        id,
        plat: truk.plat,
        tanggal: tanggalWIB(kejadian),
        jam: jamStr(kejadian),
        deskripsi: pilih(r, DESKRIPSI).replace("{lokasi}", lokasi),
        status,
        alasan: alasanAgent,
        created_at: iso(dibuat),
        diputuskan_oleh: oleh,
        decided_by: oleh,
        decided_by_name: oleh === "operator" ? "Tim Internal" : null,
        decided_at: decidedAt == null ? null : iso(Math.min(decidedAt, now)),
        decision_reason:
          status === "perlu-ditinjau"
            ? []
            : [
                `Kecepatan maksimum ${maks} km/jam vs batas ${BATAS_KMJ} km/jam`,
                `${kecList.length} titik telemetri dalam jendela 30 menit`,
              ],
        analysis_status: "selesai",
        verdict,
        reasoning: alasanAgent,
        // Nama kunci sama dengan evidence hasil lib/complaint-analysis.js
        // supaya panel Pengaduan (grafik bukti kecepatan) membacanya.
        evidence: {
          seed: true,
          plate: truk.plat,
          truckId: truk.id,
          speedLimitKph: BATAS_KMJ,
          maxSpeedKph: maks,
          avgSpeedKph: rata,
          sampleCount: kecList.length,
          windowStart: iso(kejadian - 30 * 6e4),
          windowEnd: iso(kejadian + 30 * 6e4),
          hasTime: true,
          peak: puncakTitik ? { lat: puncakTitik.lat, lng: puncakTitik.lon, speed: maks } : null,
          speedSeries: deretBukti(deret),
          incidentStart: episode ? episode.mulai : null,
        },
        truck_id: truk.id,
        driver_id: pengemudiBertugas(truk.id, kejadian),
      });
      agentRuns.push({
        trigger_type: "otomatis",
        complaint_id: id,
        started_at: iso(Math.min(runMulai, now)),
        finished_at: iso(Math.min(runSelesai, now)),
        outcome: oleh === "agent" ? status : "perlu-ditinjau",
        notes: "seed-demo",
      });
    }
  }

  void randBetween;
  return {
    hariIni,
    positions,
    pengaduan,
    agentRuns,
    schedules,
    insiden: insiden.map((e) => ({ plat: e.plat, truk_id: e.truk.id, mulai: e.mulai, puncak: e.puncak, titik: e.titik.length })),
  };
}
