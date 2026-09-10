// Generator data TURUNAN demo Circle T (murni, tanpa I/O) dipakai
// scripts/seed.js. Identitas armada (truk, pengemudi) TIDAK dibuat di sini:
// pemanggil memberi FLEET_TRUCKS / FLEET_DRIVERS dari scripts/fleet-data.js.
// Seluruh keacakan lewat lib/seeded-random.js dengan benih tetap, jadi dua
// kali menjalankan generator menghasilkan data yang persis sama.
//
// Keluaran (relatif terhadap tanggal hari ini WIB):
//   positions  telemetri 90 hari (trip_id null = penanda baris seed): interval
//              5 menit untuk 7 hari terakhir, 30 menit untuk hari 8-90, dengan
//              jam kerja (giliran berangkat, libur mingguan, diam di malam hari)
//   pengaduan  ±1 laporan/hari selama 90 hari, minimal 10 pada 7 hari terakhir,
//              ~70% diputuskan agent, ~20% operator, ~10% perlu ditinjau;
//              evidence.seed = true sebagai penanda
//   agentRuns  satu run per pengaduan (started_at/finished_at masuk akal)
//   schedules  jadwal tiap pengemudi pada truk tetapnya (notes 'seed-demo')
//   insiden    episode ngebut yang DIJAMIN (lihat JAMINAN di bawah), bukan
//              hasil keberuntungan acak; periksaJaminan() memverifikasinya

import { seededRandom, randBetween, randInt, randPick } from "../lib/seeded-random.js";
import { BATAS_KECEPATAN_KPJ, kelompokkanInsiden, melebihiBatas } from "../lib/speed-limit.js";
import { FLEET_SPEEDING_PROFILE } from "./fleet-data.js";

export const HARI_RENTANG = 90;
// Ambang dari satu sumber (lib/speed-limit.js).
export const BATAS_KMJ = BATAS_KECEPATAN_KPJ;

// JAMINAN insiden kecepatan setiap seed (diperiksa periksaJaminan):
export const JAMINAN = {
  insiden7Hari: 3,
  insiden30Hari: 12,
  totalMin: 30,
  totalMaks: 40,
  trukTerlibatMin: 8,
  jamKerja: [6, 22], // tiap jam 06-22 punya >= 1 insiden dalam 90 hari
  pengaduanValidTerkaitMin: 12,
};

// INSIDEN WAJIB: daftar TETAP (bukan acak) hari ke-n dihitung mundur dari
// hari ini, ditanam SEBELUM insiden acak. Rentang 7 hari pasti punya >= 3
// (hari 1, 3, 6), 30 hari >= 6 (+12, 20, 28), 90 hari seluruhnya.
// Truk & jam juga tetap supaya identik antar seed.
export const INSIDEN_WAJIB = [
  { hari: 1,  plat: "W 3324 IJ",  jam: 15, menit: 20 },
  { hari: 3,  plat: "L 8821 AB",  jam: 21, menit: 5 },
  { hari: 6,  plat: "N 7788 OP",  jam: 13, menit: 40 },
  { hari: 12, plat: "W 3324 IJ",  jam: 19, menit: 50 },
  { hari: 20, plat: "W 1187 EF",  jam: 16, menit: 10 },
  { hari: 28, plat: "L 8821 AB",  jam: 14, menit: 30 },
  { hari: 45, plat: "N 7788 OP",  jam: 22, menit: 15 },
  { hari: 70, plat: "W 9042 CD",  jam: 20, menit: 45 },
  { hari: 85, plat: "W 3324 IJ",  jam: 13, menit: 5 },
];

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

  const titikPosisi = (truk, rute, frac, kec, ms) => ({
    trip_id: null,
    truk_id: truk.id,
    lat: +titikRute(rute, Math.min(1, Math.max(0, frac))).lat.toFixed(5),
    lon: +titikRute(rute, Math.min(1, Math.max(0, frac))).lon.toFixed(5),
    kecepatan: kec,
    status: kec > 0 ? "jalan" : "berhenti",
    ts: iso(ms),
  });

  // ---------- Telemetri historis dengan JAM KERJA ----------
  // Volume dibatasi: interval 5 menit hanya 7 hari terakhir, 30 menit untuk
  // hari ke-8..90. Tidak semua truk bergerak bersamaan: tiap truk punya
  // giliran berangkat (05 / 08 / 11 WIB), satu hari libur per minggu, dan
  // di luar jam tugas (serta malam 22-05) tercatat DIAM (0 km/jam, status
  // berhenti) di depo dengan titik jarang (1 per jam / 1 per 3 jam).
  // Perjalanan panjang (>= 3 jam) punya jeda istirahat 20 menit di tengah.
  const idle = (truk, rute, ms) => titikPosisi(truk, rute, 0, 0, ms);
  trucks.forEach((truk, ti) => {
    const jamBerangkat = 5 + (ti % 3) * 3; // 05 / 08 / 11
    const hariLibur = ti % 7;             // satu hari libur tiap minggu
    for (let off = HARI_RENTANG - 1; off >= 0; off -= 1) {
      const hari0 = awalHariIni - off * 864e5;
      const rapat = off <= 6;
      const intervalJalan = (rapat ? 5 : 30) * 6e4;
      const intervalDiam = (rapat ? 60 : 180) * 6e4;
      const rute = RUTE[(ti + off) % RUTE.length];
      const libur = off % 7 === hariLibur;
      // Jendela tugas: satu perjalanan (1-5 jam); slot pagi/siang dapat
      // perjalanan kedua 40% hari (deterministik) pada sore hari.
      const tugas = [];
      if (!libur) {
        const mulai1 = hari0 + jamBerangkat * 36e5 + bulat(r, -15, 15) * 6e4;
        tugas.push([mulai1, mulai1 + rute[2] * 36e5, rute]);
        if (ti % 3 !== 2 && r() < 0.4) {
          const rute2 = RUTE[(ti + off + 3) % RUTE.length];
          const mulai2 = Math.max(tugas[0][1] + 60 * 6e4, hari0 + 14 * 36e5);
          if (mulai2 + rute2[2] * 36e5 <= hari0 + 22 * 36e5) tugas.push([mulai2, mulai2 + rute2[2] * 36e5, rute2]);
        }
      }
      // Titik bergerak selama tugas (dengan jeda istirahat di tengah rute panjang).
      for (const [mulai, selesai, rt] of tugas) {
        const durasi = selesai - mulai;
        const istirahatMulai = rt[2] >= 3 ? mulai + durasi * 0.5 : null;
        for (let ts = mulai; ts <= selesai; ts += intervalJalan) {
          if (ts > batasTs) break;
          const diIstirahat = istirahatMulai != null && ts >= istirahatMulai && ts < istirahatMulai + 20 * 6e4;
          const frac = (ts - mulai) / durasi;
          const kec = diIstirahat ? 0 : bulat(r, 35, 70);
          positions.push(titikPosisi(truk, rt, frac, kec, ts));
        }
        if (selesai <= batasTs) positions.push(titikPosisi(truk, rt, 1, 0, selesai + 6e4)); // tiba, berhenti
      }
      // Titik diam di depo di luar jam tugas & malam hari (jarang).
      for (let ts = hari0; ts < hari0 + 864e5; ts += intervalDiam) {
        if (ts > batasTs) break;
        const sedangTugas = tugas.some(([m, sl]) => ts >= m - 5 * 6e4 && ts <= sl + 5 * 6e4);
        if (sedangTugas) continue;
        positions.push(idle(truk, rute, ts));
      }
    }
  });

  // ---------- Insiden ngebut: kuota per truk (timpang, tetap) ----------
  // 3 penyumbang terbesar 5-8, 5 menengah 2-4, sisanya 0-1
  // (FLEET_SPEEDING_PROFILE di fleet-data.js). Total dipaksa ke rentang
  // JAMINAN.totalMin..totalMaks; 8 truk pertama selalu >= 2 sehingga jumlah
  // truk terlibat >= 8.
  const platKe = (plat) => trucks.find((t) => t.plat === plat);
  const trukBerat = FLEET_SPEEDING_PROFILE.berat.map(platKe).filter(Boolean);
  const trukMenengah = FLEET_SPEEDING_PROFILE.menengah.map(platKe).filter(Boolean);
  const trukLain = trucks.filter((t) => !trukBerat.includes(t) && !trukMenengah.includes(t));
  const kuota = new Map();
  for (const t of trukBerat) kuota.set(t.id, bulat(r, 5, 8));
  for (const t of trukMenengah) kuota.set(t.id, bulat(r, 2, 4));
  for (const t of trukLain) kuota.set(t.id, r() < 0.4 ? 1 : 0);
  const totalKuota = () => [...kuota.values()].reduce((x, y) => x + y, 0);
  for (let i = 0; totalKuota() < JAMINAN.totalMin; i += 1) {
    const t = i % 2 === 0 ? trukBerat[i % trukBerat.length] : trukMenengah[i % trukMenengah.length];
    const maks = trukBerat.includes(t) ? 8 : 4;
    if (kuota.get(t.id) < maks) kuota.set(t.id, kuota.get(t.id) + 1);
    else if (i > 100) break;
  }
  for (let i = 0; totalKuota() > JAMINAN.totalMaks; i += 1) {
    const kandidat = [...trukLain, ...trukMenengah, ...trukBerat].find((t) => {
      const min = trukBerat.includes(t) ? 5 : trukMenengah.includes(t) ? 2 : 0;
      return kuota.get(t.id) > min;
    });
    if (!kandidat) break;
    kuota.set(kandidat.id, kuota.get(kandidat.id) - 1);
  }
  // Insiden wajib mengambil jatah kuota truknya (kuota tidak boleh < 0).
  for (const w of INSIDEN_WAJIB) {
    const t = platKe(w.plat);
    if (t) kuota.set(t.id, Math.max(0, (kuota.get(t.id) ?? 0) - 1));
  }
  const totalInsiden = totalKuota();

  // ---------- Slot waktu: hari & jam (timpang, tapi tiap jam kerja terisi) ----------
  // Hari: >= 3 dalam 7 hari (off 1,3,5), >= 12 dalam 30 hari, sisanya 1..89.
  // Jam: satu insiden untuk tiap jam 06-22 dulu (17 slot), sisanya berbobot
  // 13-16 dan 19-22. Hari ini (off 0) dihindari supaya tidak ke masa depan.
  const [jamAwal, jamAkhir] = JAMINAN.jamKerja;
  const jamBerbobot = () => {
    const x = r();
    if (x < 0.4) return bulat(r, 13, 16);
    if (x < 0.75) return bulat(r, 19, 22);
    return bulat(r, jamAwal, jamAkhir);
  };
  const slotHari = [];
  for (let i = 0; i < totalInsiden; i += 1) {
    // Separuh dari yang dibutuhkan untuk 30 hari diisi acak di 7-29 hari
    // (sisanya sudah dijamin INSIDEN_WAJIB), selebihnya 1-89 hari.
    if (i < JAMINAN.insiden30Hari - INSIDEN_WAJIB.filter((w) => w.hari <= 29).length) slotHari.push(bulat(r, 7, 29));
    else slotHari.push(bulat(r, 1, HARI_RENTANG - 1));
  }
  const slotJam = [];
  for (let i = 0; i < totalInsiden; i += 1) {
    slotJam.push(i <= jamAkhir - jamAwal ? jamAwal + i : jamBerbobot());
  }
  // Kocok pasangan (hari, jam) secara deterministik lalu bagikan ke truk
  // sesuai kuota; jaminan tidak bergantung pada truk mana yang dapat slot.
  const slot = slotHari.map((off, i) => ({ off, jam: slotJam[i] }));
  for (let i = slot.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1));
    [slot[i], slot[j]] = [slot[j], slot[i]];
  }
  const urutanTruk = [];
  for (const t of [...trukBerat, ...trukMenengah, ...trukLain]) {
    for (let k = 0; k < kuota.get(t.id); k += 1) urutanTruk.push(t);
  }

  const insiden = [];
  // Satu insiden = 3-6 titik berturutan (30 detik) > batas, memuncak di
  // tengah 95-120 km/jam lalu turun; diapit titik konteks < batas.
  const buatInsiden = ({ truk, off, jam, menit }) => {
    const hari0 = awalHariIni - off * 864e5;
    let mulaiMs = hari0 + jam * 36e5 + menit * 6e4;
    // Jangan bertabrakan (< 10 menit) dengan insiden lain truk yang sama.
    const milik = insiden.filter((e) => e.truk.id === truk.id);
    while (milik.some((e) => Math.abs(e.mulaiMs - mulaiMs) < 10 * 6e4)) mulaiMs += 20 * 6e4;
    if (mulaiMs + 4 * 60e3 > batasTs) return null;
    const rute = RUTE[(trucks.indexOf(truk) + off) % RUTE.length];
    const frac0 = 0.1 + r() * 0.7;
    const n = bulat(r, 3, 6);
    const puncak = bulat(r, 95, 120);
    const tengah = (n - 1) / 2;
    const titik = [];
    for (let k = 0; k < n; k += 1) {
      const dekatPuncak = tengah === 0 ? 1 : 1 - Math.abs(k - tengah) / tengah;
      const kec = Math.round(85 + (puncak - 85) * Math.pow(dekatPuncak, 0.8));
      titik.push(titikPosisi(truk, rute, frac0 + k * 0.02, kec, mulaiMs + k * 30e3));
    }
    // Titik tengah selalu tepat di puncak (juga saat n genap).
    titik[Math.round(tengah)].kecepatan = puncak;
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
      jam,
      plat: truk.plat,
      mulai: iso(mulaiMs),
      mulaiMs,
      selesaiMs: mulaiMs + (n - 1) * 30e3,
      puncak: Math.max(...titik.map((t) => t.kecepatan)),
      titik,
      deret: [...konteks, ...titik].sort((x, y) => (x.ts < y.ts ? -1 : 1)),
      pengaduan: 0,
    };
    insiden.push(e);
    return e;
  };
  // 1) Insiden WAJIB pada tanggal tetap (INSIDEN_WAJIB), tanpa keacakan.
  for (const w of INSIDEN_WAJIB) {
    const truk = platKe(w.plat) ?? trucks[0];
    buatInsiden({ truk, off: w.hari, jam: w.jam, menit: w.menit });
  }
  // 2) Insiden acak sebagai variasi, sesuai kuota per truk.
  slot.forEach((sl, i) => {
    const truk = urutanTruk[i] ?? trukBerat[i % trukBerat.length];
    buatInsiden({ truk, off: sl.off, jam: sl.jam, menit: bulat(r, 0, 59) });
  });
  // Slot yang gugur (mis. bentrok waktu) diganti sampai kuota total tercapai.
  for (let i = 0; insiden.length < totalInsiden + INSIDEN_WAJIB.length && i < 200; i += 1) {
    buatInsiden({ truk: trukBerat[i % trukBerat.length], off: bulat(r, 1, 29), jam: jamBerbobot(), menit: bulat(r, 0, 59) });
  }
  const insidenPadaHari = (off) => insiden.filter((e) => e.off === off);

  // Deret kecepatan untuk grafik bukti di panel Pengaduan (label HH:MM WIB),
  // shape sama dengan summarizeTelemetry di lib/complaint-analysis.js.
  const deretBukti = (points) =>
    points.map((p) => ({ label: jamStr(new Date(p.ts).getTime()).slice(0, 5), speedKph: p.kecepatan }));

  // ---------- Pengaduan + agent_runs ----------
  // Jumlah per hari: 7 hari terakhir dijamin >= 10 laporan, sisanya 0-3/hari.
  // - VALID selalu merujuk insiden nyata (truk & waktu sama) -> grafik bukti
  //   kecepatan di Pengaduan cocok dengan Analitik.
  // - DITOLAK jatuh pada waktu truk tercatat DIAM (0 km/jam, status berhenti).
  // - PERLU DITINJAU tanpa insiden: kecepatan mendekati batas (72-80).
  const buatPengaduan = ({ off, oleh, episode, status, truk, kejadian }) => {
    let deret;
    if (episode) {
      deret = episode.deret;
      episode.pengaduan += 1;
    } else {
      const rute = RUTE[(trucks.indexOf(truk) + off) % RUTE.length];
      const frac = r();
      const rendah = [];
      for (let k = -2; k <= 2; k += 1) {
        const kec = status === "ditolak" ? 0 : bulat(r, 72, BATAS_KMJ);
        rendah.push(titikPosisi(truk, rute, frac, kec, kejadian + k * 2 * 6e4));
      }
      positions.push(...rendah);
      deret = rendah;
    }
    const kecList = deret.map((p) => p.kecepatan);
    const maks = Math.max(...kecList);
    const rata = Math.round(kecList.reduce((x, y) => x + y, 0) / kecList.length);
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
          ? `Telemetri mencatat truk berhenti (0 km/jam) pada jendela 30 menit di sekitar jam kejadian; tidak ada pergerakan, apalagi pelanggaran batas ${BATAS_KMJ} km/jam.`
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
          : status === "ditolak"
            ? [`Truk tercatat berhenti (0 km/jam) pada jam kejadian`, `${kecList.length} titik telemetri dalam jendela 30 menit`]
            : [`Kecepatan maksimum ${maks} km/jam vs batas ${BATAS_KMJ} km/jam`, `${kecList.length} titik telemetri dalam jendela 30 menit`],
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
  };

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
      if (padaHari.length && r() < 0.75) {
        episode = pilih(r, padaHari);
        truk = episode.truk;
        kejadian = episode.mulaiMs + bulat(r, 0, 2) * 6e4;
      }
      let status;
      if (!oleh) status = "perlu-ditinjau";
      else if (episode) status = r() < 0.9 ? "valid" : "perlu-ditinjau";
      else status = r() < 0.8 ? "ditolak" : "perlu-ditinjau";
      buatPengaduan({ off, oleh, episode, status, truk, kejadian });
    }
  }
  // Jaminan: minimal JAMINAN.pengaduanValidTerkaitMin pengaduan valid yang
  // merujuk insiden; bila kurang, tambahkan pada insiden yang belum dilaporkan.
  const validTerkait = () => pengaduan.filter((p) => p.status === "valid" && p.evidence.incidentStart).length;
  for (const e of [...insiden].sort((x, y) => x.mulaiMs - y.mulaiMs)) {
    if (validTerkait() >= JAMINAN.pengaduanValidTerkaitMin) break;
    if (e.pengaduan > 0) continue;
    buatPengaduan({ off: e.off, oleh: "agent", episode: e, status: "valid", truk: e.truk, kejadian: e.mulaiMs + 6e4 });
  }

  void randBetween;
  return {
    hariIni,
    positions,
    pengaduan,
    agentRuns,
    schedules,
    insiden: insiden.map((e) => ({ plat: e.plat, truk_id: e.truk.id, off: e.off, jam: e.jam, mulai: e.mulai, puncak: e.puncak, titik: e.titik.length, pengaduan: e.pengaduan })),
  };
}

// ---------- Verifikasi jaminan (dicetak scripts/seed.js) ----------
// Menghitung dari TITIK telemetri (positions) lewat kelompokkanInsiden, sama
// dengan cara Analitik menghitung, bukan dari daftar internal generator.
export function periksaJaminan(seed, now = Date.now()) {
  const hariIni = tanggalWIB(now);
  const awal = awalHariWIB(hariIni);
  const episode = kelompokkanInsiden(seed.positions.filter((p) => melebihiBatas(p.kecepatan)));
  const offDari = (isoTs) => Math.floor((awal - awalHariWIB(tanggalWIB(new Date(isoTs).getTime()))) / 864e5);
  const dalam = (hari) => episode.filter((e) => offDari(e.mulai) <= hari - 1).length;
  const truk = new Set(episode.map((e) => e.truk_id));
  const jamAda = new Set(
    episode.map((e) => Number(new Date(e.mulai).toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" })) % 24)
  );
  const [jamAwal, jamAkhir] = JAMINAN.jamKerja;
  const jamKosong = [];
  for (let j = jamAwal; j <= jamAkhir; j += 1) if (!jamAda.has(j)) jamKosong.push(j);
  const valid = seed.pengaduan.filter((p) => p.status === "valid");
  const validCocok = valid.filter((p) => {
    const t = new Date(`${p.tanggal}T${p.jam}+07:00`).getTime();
    return episode.some((e) => e.truk_id === p.truck_id && t >= new Date(e.mulai).getTime() - 5 * 6e4 && t <= new Date(e.selesai).getTime() + 5 * 6e4);
  });
  const ditolak = seed.pengaduan.filter((p) => p.status === "ditolak");
  const ditolakDiam = ditolak.filter((p) => p.evidence.maxSpeedKph === 0);
  const titikPerInsiden = episode.map((e) => e.titik);
  const wajibAda = INSIDEN_WAJIB.filter((w) =>
    episode.some((e) => offDari(e.mulai) === w.hari && (seed.insiden ?? []).some((i) => i.plat === w.plat && i.mulai === e.mulai))
  ).length;
  const hasil = {
    insiden7: dalam(7),
    insiden30: dalam(30),
    insiden90: dalam(90),
    total: episode.length,
    wajibAda,
    trukTerlibat: truk.size,
    jamKosong,
    validTotal: valid.length,
    validCocok: validCocok.length,
    ditolakTotal: ditolak.length,
    ditolakDiam: ditolakDiam.length,
    titikMin: Math.min(...titikPerInsiden),
    titikMaks: Math.max(...titikPerInsiden),
    puncakMin: Math.min(...episode.map((e) => e.kecepatanMaks)),
    puncakMaks: Math.max(...episode.map((e) => e.kecepatanMaks)),
  };
  const cek = [
    ["insiden wajib (tanggal tetap) tertanam", `${wajibAda}/${INSIDEN_WAJIB.length}`, "semua", wajibAda === INSIDEN_WAJIB.length],
    ["insiden 7 hari terakhir", hasil.insiden7, `>= ${JAMINAN.insiden7Hari}`, hasil.insiden7 >= JAMINAN.insiden7Hari],
    ["insiden 30 hari terakhir", hasil.insiden30, `>= ${JAMINAN.insiden30Hari}`, hasil.insiden30 >= JAMINAN.insiden30Hari],
    ["insiden 90 hari", hasil.insiden90, `${JAMINAN.totalMin}-${JAMINAN.totalMaks}`, hasil.insiden90 >= JAMINAN.totalMin && hasil.insiden90 <= JAMINAN.totalMaks],
    ["truk terlibat", hasil.trukTerlibat, `>= ${JAMINAN.trukTerlibatMin}`, hasil.trukTerlibat >= JAMINAN.trukTerlibatMin],
    ["jam kerja tanpa insiden", jamKosong.length ? jamKosong.join(",") : "tidak ada", `tidak ada (${jamAwal}-${jamAkhir})`, jamKosong.length === 0],
    ["pengaduan valid punya insiden bersesuaian", `${hasil.validCocok}/${hasil.validTotal}`, `semua, >= ${JAMINAN.pengaduanValidTerkaitMin}`, hasil.validCocok === hasil.validTotal && hasil.validCocok >= JAMINAN.pengaduanValidTerkaitMin],
    ["pengaduan ditolak saat truk diam", `${hasil.ditolakDiam}/${hasil.ditolakTotal}`, "semua", hasil.ditolakDiam === hasil.ditolakTotal],
    ["titik per insiden", `${hasil.titikMin}-${hasil.titikMaks}`, "3-6", hasil.titikMin >= 3 && hasil.titikMaks <= 6],
    ["puncak kecepatan", `${hasil.puncakMin}-${hasil.puncakMaks} km/jam`, "95-120", hasil.puncakMin >= 95 && hasil.puncakMaks <= 120],
  ];
  return { hasil, cek, lulus: cek.every((c) => c[3]) };
}
