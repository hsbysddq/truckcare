// Generator data demo Circle T (murni, tanpa I/O) dipakai scripts/seed.js.
// Semua baris TERIKAT ke truk & pengemudi yang diberikan pemanggil (hanya
// truk status 'aktif'), relatif terhadap tanggal hari ini (WIB), dan
// deterministik (PRNG berbenih) sehingga seed bisa diulang dengan hasil sama.
//
// Keluaran:
//   positions  telemetri 90 hari ke belakang s.d. hari ini (trip_id null =
//              penanda baris seed; simulator hanya menghapus baris miliknya)
//   pengaduan  ±1 laporan/hari selama 90 hari, minimal 10 pada 7 hari terakhir,
//              ~70% diputuskan agent, ~20% operator, ~10% perlu ditinjau;
//              evidence.seed = true sebagai penanda
//   agentRuns  satu run per pengaduan (started_at/finished_at masuk akal)
//   schedules  jadwal untuk pasangan truk aktif + pengemudi (notes 'seed-demo')
"use strict";

const HARI_RENTANG = 90;
const BATAS_KMJ = 80;

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

// PRNG deterministik (mulberry32).
function prng(benih) {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const acak = (r, min, max) => min + r() * (max - min);
const bulat = (r, min, max) => Math.floor(acak(r, min, max + 1));
const pilih = (r, arr) => arr[Math.floor(r() * arr.length)];
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

// Jam insiden ngebut: lebih sering siang (13-15) dan malam (21-23).
function jamNgebut(r) {
  const x = r();
  if (x < 0.35) return bulat(r, 13, 15);
  if (x < 0.6) return bulat(r, 21, 23);
  return bulat(r, 5, 23);
}

function generateSeed({ trucks, drivers, now = Date.now(), benih = 20260910 }) {
  if (!trucks?.length) throw new Error("Tidak ada truk aktif untuk di-seed.");
  const r = prng(benih);
  const hariIni = tanggalWIB(now);
  const awalHariIni = awalHariWIB(hariIni);
  const batasTs = now - 10 * 60 * 1000; // jangan menulis ke masa depan / menimpa posisi live
  const nT = trucks.length;

  const positions = [];
  const schedules = [];
  const pengaduan = [];
  const agentRuns = [];

  // ---------- Jadwal (truk aktif x pengemudi) ----------
  // Tiap pengemudi memakai satu truk pada "slot" jam tetap (05/11/17) supaya
  // dua pengemudi pada truk yang sama tidak bertabrakan (constraint no_overlap).
  const nD = drivers.length;
  const grupA = Math.max(1, Math.round(nD * 0.4));
  const grupB = Math.max(1, Math.round(nD * 0.33));
  const jadwalTruk = {}; // truckId -> [{depMs, arrMs, driverId}]
  drivers.forEach((d, i) => {
    const rn = i + 1;
    const truk = trucks[(rn - 1) % nT];
    const slot = Math.floor((rn - 1) / nT) % 3; // 0,1,2 -> 05,11,17
    const jam = 5 + slot * 6;
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
  const pengemudiBertugas = (truckId, ms) => {
    const list = jadwalTruk[truckId] || [];
    const tepat = list.find((j) => ms >= j.depMs - 36e5 && ms <= j.arrMs + 36e5);
    if (tepat) return tepat.driverId;
    const hari = tanggalWIB(ms);
    const sehari = list.find((j) => tanggalWIB(j.depMs) === hari);
    return sehari ? sehari.driverId : null;
  };

  // ---------- Telemetri harian + insiden ngebut ----------
  const nT2 = trucks.length;
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
      // ~25% hari-truk ada satu insiden ngebut (>80 km/jam).
      if (r() < 0.25) {
        const ts = hari0 + jamNgebut(r) * 36e5 + bulat(r, 0, 59) * 6e4;
        if (ts <= batasTs) {
          const p = titikRute(rute, r());
          positions.push({
            trip_id: null,
            truk_id: truk.id,
            lat: +p.lat.toFixed(5),
            lon: +p.lon.toFixed(5),
            kecepatan: bulat(r, BATAS_KMJ + 2, 108),
            status: "jalan",
            ts: iso(ts),
          });
        }
      }
    }
  });
  void nT2;

  // ---------- Pengaduan + agent_runs ----------
  // Jumlah per hari: 7 hari terakhir dijamin >= 10 laporan, sisanya 0-3/hari.
  for (let off = HARI_RENTANG - 1; off >= 0; off -= 1) {
    const hari0 = awalHariIni - off * 864e5;
    let n;
    if (off <= 2) n = 2;
    else if (off <= 6) n = 1 + (r() < 0.4 ? 1 : 0);
    else n = [0, 1, 1, 1, 2, 2, 3][Math.floor(r() * 7)];
    for (let i = 0; i < n; i += 1) {
      const truk = pilih(r, trucks);
      // Hari ini: kejadian harus sudah lewat (minimal 40 menit sebelum sekarang).
      const maksJam = off === 0 ? Math.floor((batasTs - 30 * 6e4 - hari0) / 36e5) : 22;
      if (maksJam < 6) continue;
      const kejadian = hari0 + bulat(r, 6, maksJam) * 36e5 + bulat(r, 0, 59) * 6e4;
      const dibuat = Math.min(kejadian + bulat(r, 15, 180) * 6e4, batasTs);
      const x = r();
      const oleh = x < 0.7 ? "agent" : x < 0.9 ? "operator" : null;
      const status = oleh ? (r() < 0.6 ? "valid" : "ditolak") : "perlu-ditinjau";

      // Telemetri di sekitar kejadian yang konsisten dengan keputusan.
      const rentangKec = status === "valid" ? [84, 105] : status === "ditolak" ? [38, 62] : [74, 80];
      const rute = RUTE[(trucks.indexOf(truk) + off) % RUTE.length];
      const kecList = [];
      for (let k = -1; k <= 1; k += 1) {
        const kec = bulat(r, rentangKec[0], rentangKec[1]);
        kecList.push(kec);
        const p = titikRute(rute, r());
        positions.push({
          trip_id: null,
          truk_id: truk.id,
          lat: +p.lat.toFixed(5),
          lon: +p.lon.toFixed(5),
          kecepatan: kec,
          status: "jalan",
          ts: iso(kejadian + k * 4 * 6e4),
        });
      }
      const maks = Math.max(...kecList);
      const rata = Math.round(kecList.reduce((a, b) => a + b, 0) / kecList.length);
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
            : `Kecepatan maksimum ${maks} km/jam berada di dekat batas ${BATAS_KMJ} km/jam; perlu peninjauan operator.`;
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
        evidence: {
          seed: true,
          plat: truk.plat,
          kecepatan_maks: maks,
          kecepatan_rata: rata,
          jumlah_titik: kecList.length,
          jendela_menit: 30,
          batas_kmj: BATAS_KMJ,
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

  return { hariIni, positions, pengaduan, agentRuns, schedules };
}

module.exports = { generateSeed, HARI_RENTANG, BATAS_KMJ };
