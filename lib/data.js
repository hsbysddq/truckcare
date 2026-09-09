// Data CONTOH (fallback tanpa Supabase) untuk dashboard Circle T.
// Komponen tidak boleh berisi data statis — impor semuanya dari file ini.
//
// IDENTITAS ARMADA (id, plat, jenis, pengemudi) TIDAK ditulis di sini:
// satu-satunya sumbernya scripts/fleet-data.js (15 truk + 15 pengemudi
// dengan id tetap), sama dengan yang di-upsert scripts/seed.js ke Supabase.
// File ini hanya membangkitkan keadaan operasional contoh (posisi, kecepatan,
// solar, jadwal, pengaduan) secara deterministik lewat lib/seeded-random.js.
// Seluruh armada beroperasi di Jawa Timur: plat L (Surabaya), W (Sidoarjo/
// Gresik), N (Malang/Pasuruan), AG (Kediri). Koordinat mengikuti kota nyata.

import { incidentDateKey } from "./format.js";
import { TRUCK_TYPES } from "./truck-types.js";
import { seededRandom, seededValue, hashSeed, randInt, randPick } from "./seeded-random.js";
import { FLEET_TRUCKS, FLEET_DRIVERS, FLEET_DRIVER_BY_TRUCK_ID } from "../scripts/fleet-data.js";

// Titik-titik rute antar kota yang dipakai bersama oleh beberapa truk.
const TITIK = {
  tanjungPerak: { lat: -7.205, lng: 112.735, label: "Pelabuhan Tanjung Perak" },
  margomulyo: { lat: -7.235, lng: 112.69, label: "Gudang Margomulyo" },
  romokalisari: { lat: -7.2, lng: 112.66, label: "Romokalisari" },
  gresik: { lat: -7.16, lng: 112.65, label: "Pelabuhan Gresik" },
  manyar: { lat: -7.105, lng: 112.61, label: "Kawasan Industri Manyar" },
  surabaya: { lat: -7.3, lng: 112.73, label: "Terminal Surabaya" },
  waru: { lat: -7.35, lng: 112.72, label: "Simpang Waru" },
  sidoarjo: { lat: -7.447, lng: 112.718, label: "Depo Sidoarjo" },
  sukodono: { lat: -7.43, lng: 112.65, label: "Sukodono" },
  krian: { lat: -7.41, lng: 112.58, label: "Gudang Krian" },
  porong: { lat: -7.54, lng: 112.7, label: "Porong" },
  gempol: { lat: -7.55, lng: 112.72, label: "Gempol" },
  bangil: { lat: -7.6, lng: 112.79, label: "Bangil" },
  pasuruan: { lat: -7.645, lng: 112.908, label: "Pasuruan" },
  pandaan: { lat: -7.655, lng: 112.69, label: "Pandaan" },
  purwosari: { lat: -7.75, lng: 112.72, label: "Purwosari" },
  lawang: { lat: -7.835, lng: 112.695, label: "Lawang" },
  singosari: { lat: -7.89, lng: 112.665, label: "Singosari" },
  malang: { lat: -7.977, lng: 112.63, label: "Malang" },
  batu: { lat: -7.87, lng: 112.53, label: "Batu" },
  pujon: { lat: -7.84, lng: 112.47, label: "Pujon" },
  ngantang: { lat: -7.88, lng: 112.38, label: "Ngantang" },
  kandangan: { lat: -7.85, lng: 112.3, label: "Kandangan" },
  pare: { lat: -7.77, lng: 112.2, label: "Pare" },
  kediri: { lat: -7.82, lng: 112.01, label: "Kediri" },
};

const RUTE_SURABAYA_MALANG = [
  TITIK.surabaya, TITIK.waru, TITIK.porong, TITIK.pandaan,
  TITIK.purwosari, TITIK.lawang, TITIK.singosari, TITIK.malang,
];
const RUTE_MALANG_KEDIRI = [
  TITIK.malang, TITIK.batu, TITIK.pujon, TITIK.ngantang,
  TITIK.kandangan, TITIK.pare, TITIK.kediri,
];

// id truk ke-n (1..15) dari scripts/fleet-data.js; dipakai kunci keadaan
// demo yang sengaja ditanam (riwayat, jadwal terlambat, dsb.).
const T = (n) => FLEET_TRUCKS[n - 1].id;
// plat truk ke-n; tidak ada plat yang ditulis literal di file ini.
const P = (n) => FLEET_TRUCKS[n - 1].plat;

// Rute contoh (asal, tujuan, jalur) dipakai bergiliran per truk.
const OPS_ROUTES = [
  { origin: "Surabaya", destination: "Malang", path: RUTE_SURABAYA_MALANG },
  { origin: "Sidoarjo", destination: "Pasuruan", path: [TITIK.sidoarjo, TITIK.gempol, TITIK.bangil, TITIK.pasuruan] },
  { origin: "Gresik", destination: "Surabaya", path: [TITIK.gresik, TITIK.romokalisari, TITIK.margomulyo, TITIK.tanjungPerak] },
  { origin: "Surabaya", destination: "Gresik", path: [TITIK.tanjungPerak, TITIK.margomulyo, TITIK.romokalisari, TITIK.manyar] },
  { origin: "Sidoarjo", destination: "Krian", path: [TITIK.sidoarjo, TITIK.sukodono, TITIK.krian] },
  { origin: "Malang", destination: "Kediri", path: RUTE_MALANG_KEDIRI },
  { origin: "Pasuruan", destination: "Malang", path: [TITIK.pasuruan, TITIK.bangil, TITIK.pandaan, TITIK.purwosari, TITIK.lawang, TITIK.singosari, TITIK.malang] },
  { origin: "Gresik", destination: "Surabaya", path: [TITIK.gresik, TITIK.romokalisari, TITIK.margomulyo, TITIK.tanjungPerak] },
  { origin: "Kediri", destination: "Malang", path: [...RUTE_MALANG_KEDIRI].reverse() },
  { origin: "Surabaya", destination: "Malang", path: RUTE_SURABAYA_MALANG },
];
const opsRouteFor = (n) => OPS_ROUTES[(n - 1) % OPS_ROUTES.length];

// Status yang sengaja ditanam untuk demo temuan (lib/schedule-analysis.js):
// truk 3 istirahat padahal dijadwalkan, truk 6 bergerak tanpa jadwal, truk 5
// dan 9 insiden. Truk lain: status dibangkitkan deterministik per plat.
const OPS_PLANTED_STATUS = {
  [T(1)]: "bergerak", [T(2)]: "bergerak", [T(3)]: "istirahat", [T(4)]: "bergerak",
  [T(5)]: "insiden", [T(6)]: "bergerak", [T(7)]: "istirahat", [T(8)]: "bergerak",
  [T(9)]: "insiden", [T(10)]: "bergerak",
};

// Keadaan operasional contoh per truk: deterministik (seededRandom per plat),
// bukan Math.random(), jadi identik di server dan klien.
function buildOps(fleet, n) {
  const rand = seededRandom(hashSeed(`ops:${fleet.plat}`));
  const route = opsRouteFor(n);
  const roll = rand();
  const status = OPS_PLANTED_STATUS[fleet.id] ?? (roll < 0.6 ? "bergerak" : roll < 0.9 ? "istirahat" : "insiden");
  const moving = status === "bergerak";
  const progressPct = moving ? randInt(rand, 10, 85) : status === "insiden" ? randInt(rand, 30, 60) : randPick(rand, [0, 25, 100]);
  const point = route.path[Math.min(route.path.length - 1, Math.round((progressPct / 100) * (route.path.length - 1)))];
  const minutesAgo = moving ? randInt(rand, 0, 5) : randInt(rand, 15, 55);
  return {
    status,
    lat: point.lat,
    lng: point.lng,
    speedKph: moving ? randInt(rand, 36, 60) : 0,
    fuelLevelPct: status === "insiden" ? randInt(rand, 20, 32) : randInt(rand, 36, 84),
    odometerKm: randInt(rand, 45000, 255000),
    lastUpdate: minutesAgo === 0 ? "Baru saja" : `${minutesAgo} menit lalu`,
    origin: route.origin,
    destination: route.destination,
    progressPct,
    tripStatus: moving ? "jalan" : status === "insiden" ? "terlambat" : "berhenti",
  };
}

const TRUCKS_RAW = FLEET_TRUCKS.map((fleet, index) => ({
  id: fleet.id,
  type: fleet.tipe,
  plateNumber: fleet.plat,
  driverName: FLEET_DRIVER_BY_TRUCK_ID[fleet.id]?.nama ?? null,
  ...buildOps(fleet, index + 1),
}));

// Jenis armada (lib/truck-types.js) menentukan label jenis dan kapasitas
// tangki; tidak ada lagi penomoran "Truk NN".
const trucks = TRUCKS_RAW.map((truck) => ({
  ...truck,
  vehicleType: TRUCK_TYPES[truck.type].label,
  vehicleTypeShort: TRUCK_TYPES[truck.type].short,
  tankCapacityLiters: TRUCK_TYPES[truck.type].tankLiters,
}));

const TIME_LABELS = [
  "07:05", "07:10", "07:15", "07:20", "07:25", "07:30",
  "07:35", "07:40", "07:45", "07:50", "07:55", "08:00",
];

const DAY_HOURS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

function buildSpeedHistory(values) {
  return values.map((speedKph, index) => ({
    label: TIME_LABELS[index],
    speedKph,
  }));
}

function buildDaySpeed(values) {
  return values.map((speedKph, index) => ({
    label: DAY_HOURS[index],
    speedKph,
  }));
}

// Level solar turun ratePerHour tiap jam bergerak; jam anomali turun ekstra
// 12 poin (mis. berkurang saat truk berhenti) dan ditandai anomaly: true.
function buildDayFuel(startPct, daySpeeds, ratePerHour, anomalyHours = []) {
  let fuel = startPct;
  return DAY_HOURS.map((label, index) => {
    if (index > 0 && daySpeeds[index] > 0) fuel -= ratePerHour;
    const anomaly = anomalyHours.includes(label);
    if (anomaly) fuel -= 12;
    return { label, fuelPct: Math.max(Math.round(fuel), 0), anomaly };
  });
}

const DAY_SPEED = {
  [T(1)]: [0, 35, 48, 55, 62, 58, 60, 52, 48, 55, 50, 45, 48],
  [T(2)]: [0, 40, 52, 58, 64, 70, 66, 60, 56, 58, 54, 50, 56],
  [T(3)]: [30, 42, 38, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [T(4)]: [0, 28, 45, 60, 84, 72, 50, 40, 38, 42, 36, 39, 39],
  [T(5)]: [0, 44, 72, 95, 88, 40, 0, 0, 0, 0, 0, 0, 0],
  [T(6)]: [0, 30, 36, 42, 48, 45, 52, 50, 47, 53, 49, 52, 52],
  [T(7)]: [0, 32, 40, 38, 26, 12, 0, 0, 0, 0, 0, 0, 0],
  [T(8)]: [0, 36, 42, 38, 45, 41, 46, 44, 40, 43, 44, 42, 44],
  [T(9)]: [0, 38, 44, 41, 83, 36, 0, 0, 0, 0, 0, 0, 0],
  [T(10)]: [0, 46, 54, 60, 86, 82, 58, 55, 60, 57, 59, 56, 58],
};

const historyByTruckId = {
  [T(1)]: {
    routePath: RUTE_SURABAYA_MALANG,
    speedHistory: buildSpeedHistory([30, 34, 38, 33, 40, 45, 42, 47, 44, 50, 46, 48]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(1)]),
    fuelHistory: buildDayFuel(96, DAY_SPEED[T(1)], 2),
    tripHistory: [
      { time: "06:15", title: "Berangkat dari Terminal Surabaya", description: "Memuat 6 ton barang FMCG untuk pasar Malang." },
      { time: "07:20", title: "Melewati Tol Waru-Porong", description: "Lalu lintas lancar, kecepatan rata-rata 55 km/jam." },
      { time: "08:00", title: "Mendekati Pandaan", description: "Estimasi tiba di Malang 1 jam 20 menit lagi." },
    ],
  },
  [T(2)]: {
    routePath: [TITIK.sidoarjo, TITIK.gempol, TITIK.bangil, TITIK.pasuruan],
    speedHistory: buildSpeedHistory([42, 48, 45, 52, 50, 58, 55, 60, 53, 57, 54, 56]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(2)]),
    fuelHistory: buildDayFuel(88, DAY_SPEED[T(2)], 2),
    tripHistory: [
      { time: "06:40", title: "Berangkat dari Depo Sidoarjo", description: "Mengangkut 8 ton material konstruksi ke Pasuruan." },
      { time: "07:25", title: "Melewati Gempol", description: "Kecepatan rata-rata 58 km/jam." },
      { time: "08:00", title: "Mendekati Bangil", description: "Estimasi tiba di Pasuruan 30 menit lagi." },
    ],
  },
  [T(3)]: {
    routePath: [TITIK.gresik, TITIK.romokalisari, TITIK.margomulyo, TITIK.tanjungPerak],
    speedHistory: buildSpeedHistory([35, 30, 22, 15, 8, 0, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(3)]),
    fuelHistory: buildDayFuel(63, DAY_SPEED[T(3)], 2, ["11:00"]),
    tripHistory: [
      { time: "05:30", title: "Berangkat dari Pelabuhan Gresik", description: "Memuat bahan baku industri untuk Tanjung Perak." },
      { time: "07:10", title: "Tiba di Area Istirahat Gresik", description: "Pengemudi berhenti untuk istirahat wajib." },
      { time: "07:42", title: "Status: Berhenti", description: "Mesin dimatikan, menunggu jadwal lanjut." },
    ],
  },
  [T(4)]: {
    routePath: [TITIK.tanjungPerak, TITIK.margomulyo, TITIK.romokalisari, TITIK.manyar],
    speedHistory: buildSpeedHistory([28, 32, 30, 35, 33, 38, 36, 40, 37, 41, 38, 39]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(4)]),
    fuelHistory: buildDayFuel(99, DAY_SPEED[T(4)], 1.5),
    tripHistory: [
      { time: "07:05", title: "Berangkat dari Pelabuhan Tanjung Perak", description: "Mengirim kontainer elektronik ke Kawasan Industri Manyar." },
      { time: "07:40", title: "Melintasi Margomulyo", description: "Kondisi jalan lancar." },
      { time: "08:00", title: "Mendekati Romokalisari", description: "Estimasi tiba di Manyar 25 menit lagi." },
    ],
  },
  [T(5)]: {
    routePath: [TITIK.sidoarjo, TITIK.sukodono, TITIK.krian],
    speedHistory: buildSpeedHistory([44, 46, 42, 48, 45, 40, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(5)]),
    fuelHistory: buildDayFuel(42, DAY_SPEED[T(5)], 2, ["13:00"]),
    tripHistory: [
      { time: "06:50", title: "Berangkat dari Depo Sidoarjo", description: "Menuju gudang distribusi Krian." },
      { time: "07:35", title: "Insiden Dilaporkan", description: "Ban pecah di Jalan Raya Sukodono." },
      { time: "07:36", title: "Status: Berhenti Darurat", description: "Menunggu bantuan teknis di lokasi." },
    ],
  },
  [T(6)]: {
    routePath: RUTE_MALANG_KEDIRI,
    speedHistory: buildSpeedHistory([36, 40, 38, 44, 42, 48, 45, 50, 47, 53, 49, 52]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(6)]),
    fuelHistory: buildDayFuel(92, DAY_SPEED[T(6)], 2),
    tripHistory: [
      { time: "06:30", title: "Berangkat dari Gudang Malang", description: "Mengangkut hasil pertanian untuk pasar Kediri." },
      { time: "07:20", title: "Melewati Batu", description: "Jalan menanjak, kecepatan stabil." },
      { time: "08:00", title: "Mendekati Pujon", description: "Estimasi tiba di Kediri 1 jam 30 menit lagi." },
    ],
  },
  [T(7)]: {
    routePath: [TITIK.pasuruan, TITIK.bangil, TITIK.pandaan, TITIK.purwosari, TITIK.lawang, TITIK.singosari, TITIK.malang],
    speedHistory: buildSpeedHistory([30, 26, 20, 12, 6, 0, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(7)]),
    fuelHistory: buildDayFuel(48, DAY_SPEED[T(7)], 2),
    tripHistory: [
      { time: "06:00", title: "Berangkat dari Gudang Pasuruan", description: "Mengirim barang retail ke mitra Malang." },
      { time: "07:15", title: "Berhenti di Rest Area Purwosari", description: "Pengemudi istirahat sesuai jadwal." },
      { time: "07:50", title: "Status: Berhenti", description: "Menunggu jadwal keberangkatan lanjutan." },
    ],
  },
  [T(8)]: {
    routePath: [TITIK.gresik, TITIK.romokalisari, TITIK.margomulyo, TITIK.tanjungPerak],
    speedHistory: buildSpeedHistory([32, 36, 34, 38, 36, 42, 39, 45, 41, 46, 43, 44]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(8)]),
    fuelHistory: buildDayFuel(93, DAY_SPEED[T(8)], 1.5),
    tripHistory: [
      { time: "06:45", title: "Berangkat dari Pelabuhan Gresik", description: "Mengangkut material industri ke Tanjung Perak." },
      { time: "07:30", title: "Melintasi Romokalisari", description: "Lalu lintas lancar, kecepatan stabil." },
      { time: "08:00", title: "Mendekati Gudang Margomulyo", description: "Estimasi tiba di Tanjung Perak 20 menit lagi." },
    ],
  },
  [T(9)]: {
    routePath: [...RUTE_MALANG_KEDIRI].reverse(),
    speedHistory: buildSpeedHistory([40, 42, 38, 44, 41, 36, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(9)]),
    fuelHistory: buildDayFuel(50, DAY_SPEED[T(9)], 2, ["12:00"]),
    tripHistory: [
      { time: "06:20", title: "Berangkat dari Depo Kediri", description: "Menuju gudang distribusi Malang." },
      { time: "07:25", title: "Insiden Dilaporkan", description: "Mesin overheat di tanjakan Ngantang." },
      { time: "07:27", title: "Status: Terlambat", description: "Menunggu teknisi, estimasi tiba mundur 1 jam." },
    ],
  },
  [T(10)]: {
    routePath: RUTE_SURABAYA_MALANG,
    speedHistory: buildSpeedHistory([46, 50, 48, 54, 52, 58, 55, 60, 56, 59, 57, 58]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED[T(10)]),
    fuelHistory: buildDayFuel(84, DAY_SPEED[T(10)], 2),
    tripHistory: [
      { time: "06:10", title: "Berangkat dari Terminal Surabaya", description: "Mengangkut bahan bangunan ke Malang." },
      { time: "07:10", title: "Melewati Pandaan", description: "Kecepatan rata-rata 58 km/jam." },
      { time: "08:00", title: "Mendekati Singosari", description: "Estimasi tiba di Malang 25 menit lagi." },
    ],
  },
};

// driverId di shape truk = pengemudi yang membawanya saat ini (tampilan),
// bukan ikatan permanen; riwayat sesungguhnya ada di jadwal.
export function getTrucks() {
  return trucks.map((truck) => ({
    ...truck,
    driverId: FLEET_DRIVER_BY_TRUCK_ID[truck.id]?.id ?? null,
  }));
}

export function getTruckById(truckId) {
  return trucks.find((truck) => truck.id === truckId) ?? null;
}

export function getTruckHistory(truckId) {
  return (
    historyByTruckId[truckId] ?? {
      routePath: [],
      speedHistory: [],
      daySpeedHistory: [],
      fuelHistory: [],
      tripHistory: [],
    }
  );
}

function buildSpeedSeries(centerLabel, values) {
  const [centerHour, centerMinute] = centerLabel.split(":").map(Number);
  const centerTotal = centerHour * 60 + centerMinute;
  const offsetStart = -((values.length - 1) / 2) * 5;

  return values.map((speedKph, index) => {
    const totalMinutes = centerTotal + offsetStart + index * 5;
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const waktu = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    return { waktu, speedKph };
  });
}

const complaints = [
  {
    id: "RPT-082",
    judul: "Truk Ugal-ugalan di Jalan Raya Waru",
    lokasi: "Jalan Raya Waru, dekat Pasar Waru",
    plateNumber: P(2),
    incidentAt: "5 September 2026, 09:40",
    relativeTime: "Hari ini, 09:40",
    reporterNote:
      `Tadi siang ada truk boks warna putih ngebut banget di jalan raya Waru, nyalip sembarangan dari kiri, hampir nyerempet motor saya. Plat nomornya kalau nggak salah lihat ${P(2)}.`,
    status: "pending",
    agentConfidence: "tinggi",
    agentReasoning:
      "Data telematika menunjukkan kendaraan melaju hingga 92 km/jam di ruas jalan dengan batas 60 km/jam, tepat pada waktu dan lokasi yang disebutkan pelapor. Pola kecepatan konsisten dengan manuver menyalip mendadak.",
    agentFindings: [
      `Plat cocok: ${P(2)}`,
      "Kecepatan tercatat 92 km/jam, 32 km/jam di atas batas",
      "Lokasi dan waktu sesuai laporan",
    ],
    speedSeries: buildSpeedSeries("09:40", [45, 50, 55, 62, 70, 85, 92, 88, 75, 60, 52, 48, 45]),
    recordedSpeed: 92,
    speedLimit: 60,
    coordinates: { lat: -7.349, lng: 112.719 },
    vehicleType: "Fuso",
  },
  {
    id: "RPT-081",
    judul: "Truk Ngebut di Simpang Dekat Permukiman",
    lokasi: "Simpang Jalan Veteran, Gresik",
    plateNumber: P(8),
    incidentAt: "4 September 2026, 07:15",
    relativeTime: "1 hari lalu, 07:15",
    reporterNote:
      "Ada truk box kecil lewat simpang deket rumah saya kenceng banget pas jam sibuk pagi, saya sampai kaget karena hampir nabrak becak yang mau nyeberang.",
    status: "pending",
    agentConfidence: "tinggi",
    agentReasoning:
      "Rekaman GPS menunjukkan kecepatan puncak 78 km/jam di area simpang dengan batas 50 km/jam, bertepatan dengan jam yang dilaporkan warga. Perlambatan tajam setelahnya konsisten dengan pengereman mendadak.",
    agentFindings: [
      `Plat cocok: ${P(8)}`,
      "Kecepatan tercatat 78 km/jam, 28 km/jam di atas batas",
      "Waktu kejadian sesuai jam sibuk pagi",
    ],
    speedSeries: buildSpeedSeries("07:15", [30, 35, 40, 48, 58, 68, 78, 74, 60, 45, 35, 30, 28]),
    recordedSpeed: 78,
    speedLimit: 50,
    coordinates: { lat: -7.165, lng: 112.655 },
    vehicleType: "Colt Diesel Double (CDD)",
  },
  {
    id: "RPT-080",
    judul: "Truk Melaju Sangat Kencang di Tol Waru-Sidoarjo",
    lokasi: "Tol Waru-Sidoarjo, KM 12",
    plateNumber: P(5),
    incidentAt: "3 September 2026, 16:05",
    relativeTime: "2 hari lalu, 16:05",
    reporterNote:
      "Saya lihat truk tangki gede ngebut parah di tol, kayaknya di atas 100, mepet-mepet sama mobil lain, serem banget lihatnya dari kaca spion.",
    status: "tervalidasi",
    agentConfidence: "tinggi",
    agentReasoning:
      "Telemetri mengonfirmasi kecepatan tercatat 115 km/jam, 35 km/jam di atas batas kecepatan tol 80 km/jam. Titik GPS dan waktu kejadian cocok persis dengan lokasi dan jam yang dilaporkan pelapor.",
    agentFindings: [
      `Plat cocok: ${P(5)}`,
      "Kecepatan tercatat 115 km/jam, 35 km/jam di atas batas",
      "Lokasi GPS sesuai dengan laporan",
    ],
    speedSeries: buildSpeedSeries("16:05", [70, 75, 80, 88, 98, 108, 115, 110, 95, 85, 78, 72, 68]),
    recordedSpeed: 115,
    speedLimit: 80,
    coordinates: { lat: -7.4, lng: 112.72 },
    vehicleType: "Fuso",
  },
  {
    id: "RPT-079",
    judul: "Laporan Truk Ugal-ugalan di Dekat Pasar Gresik",
    lokasi: "Jalan Pasar Gresik",
    plateNumber: P(3),
    incidentAt: "3 September 2026, 11:20",
    relativeTime: "2 hari lalu, 11:20",
    reporterNote:
      "Ada truk gandeng warna abu ngebut sekali lewat pasar, plat awalnya W 1187 kalau tidak salah, saya khawatir soalnya ramai banyak pejalan kaki di situ.",
    status: "ditolak",
    agentConfidence: "tinggi",
    agentReasoning:
      "Telemetri menunjukkan truk terparkir di depo dengan kecepatan 0 km/jam sepanjang jam yang dilaporkan. Titik GPS berada di Depo Gresik, tidak sesuai dengan lokasi Pasar Gresik yang disebutkan dalam laporan.",
    agentFindings: [
      "Kecepatan tercatat 0 km/jam sepanjang jam laporan",
      "Lokasi GPS di Depo Gresik, tidak sesuai laporan",
      "Kemungkinan salah identifikasi plat nomor",
    ],
    speedSeries: buildSpeedSeries("11:20", [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]),
    recordedSpeed: 0,
    speedLimit: 60,
    coordinates: { lat: -7.156, lng: 112.652 },
    vehicleType: "Trailer",
  },
  {
    id: "RPT-078",
    judul: "Truk Melebihi Batas Kecepatan di Jalan MERR",
    lokasi: "Jalan MERR, Surabaya",
    plateNumber: P(4),
    incidentAt: "2 September 2026, 14:50",
    relativeTime: "3 hari lalu, 14:50",
    reporterNote:
      "Truk kontainer lumayan kencang pas lewat MERR, nggak tahu pasti seberapa cepat tapi kelihatan lebih ngebut dibanding kendaraan lain di sekitarnya.",
    status: "perlu-ditinjau",
    agentConfidence: "sedang",
    agentReasoning:
      "Telemetri mencatat kecepatan puncak 84 km/jam, hanya 4 km/jam di atas batas 80 km/jam. Selisihnya tergolong kecil dan masih dalam rentang wajar arus lalu lintas, sehingga agent tidak memutuskan sendiri dan memerlukan peninjauan manusia.",
    agentFindings: [
      `Plat cocok: ${P(4)}`,
      "Kecepatan tercatat 84 km/jam, 4 km/jam di atas batas",
      "Selisih kecepatan tergolong kecil",
    ],
    speedSeries: buildSpeedSeries("14:50", [58, 62, 68, 72, 76, 80, 84, 81, 75, 68, 60, 55, 50]),
    recordedSpeed: 84,
    speedLimit: 80,
    coordinates: { lat: -7.3, lng: 112.79 },
    vehicleType: "Trailer",
  },
  {
    id: "RPT-077",
    judul: "Truk Melaju Kencang di Permukiman Porong",
    lokasi: "Jalan Raya Porong, Sidoarjo",
    plateNumber: P(10),
    incidentAt: "1 September 2026, 17:30",
    relativeTime: "4 hari lalu, 17:30",
    reporterNote:
      "Kemarin sore ada truk besar ngebut sekali di jalan deket rumah, padahal itu daerah padat penduduk, anak-anak lagi main di pinggir jalan, bahaya sekali rasanya.",
    status: "tervalidasi",
    agentConfidence: "tinggi",
    agentReasoning:
      "Telemetri mengonfirmasi kecepatan tercatat 98 km/jam di kawasan permukiman dengan batas 60 km/jam. Titik GPS dan waktu kejadian sesuai dengan laporan, menunjukkan risiko keselamatan yang tinggi di area padat penduduk.",
    agentFindings: [
      `Plat cocok: ${P(10)}`,
      "Kecepatan tercatat 98 km/jam, 38 km/jam di atas batas",
      "Kawasan padat penduduk, risiko tinggi",
    ],
    speedSeries: buildSpeedSeries("17:30", [40, 45, 52, 60, 72, 88, 98, 92, 78, 62, 50, 42, 38]),
    recordedSpeed: 98,
    speedLimit: 60,
    coordinates: { lat: -7.54, lng: 112.7 },
    vehicleType: "Fuso",
  },
// Semua contoh di atas dianalisis agent (punya reasoning + keyakinan).
].map((complaint, index) => ({
  ...complaint,
  decisionSource: "agent",
  // Pencatatan keputusan (shape kolom decided_* di tabel pengaduan).
  decidedBy: complaint.status === "pending" ? null : "agent",
  decidedByName: null,
  decidedAt: complaint.status === "pending" ? null : `2026-09-0${Math.max(1, 6 - index)}T10:${String(10 + index * 7).padStart(2, "0")}:00`,
  operatorNote: null,
  operatorNoteAt: null,
  operatorNotes: [],
  decisionReasons: complaint.status === "pending" ? [] : (complaint.agentFindings ?? []).slice(0, 3),
  driverName: driverForPlate(complaint.plateNumber)?.nama ?? null,
  driverId: driverForPlate(complaint.plateNumber)?.id ?? null,
  driverUncertain: false,
  analysisStatus: "selesai",
  deletedAt: null,
  deleteReason: null,
}));

export function getComplaints() {
  return complaints;
}

// Pengemudi (shape tabel drivers: id, nama, no_hp, truck_id) langsung dari
// scripts/fleet-data.js. Siapa membawa truk pada suatu waktu dibaca dari
// jadwal (getSchedules); truckId adalah penugasan tetapnya.
// Nomor telepon hanya ditampilkan di halaman detail pengemudi.
export function getDrivers() {
  return FLEET_DRIVERS.map((d) => ({ id: d.id, name: d.nama, phone: d.no_hp, truckId: d.truck_id }));
}

function driverForPlate(plateNumber) {
  const truck = trucks.find((t) => t.plateNumber === plateNumber);
  return truck ? (FLEET_DRIVER_BY_TRUCK_ID[truck.id] ?? null) : null;
}

// ---------- JADWAL CONTOH ----------
// 14 hari ke belakang + 7 hari ke depan untuk 10 truk, rute antar kota Jawa
// Timur. Relatif terhadap `now` supaya demo selalu punya perjalanan "hari
// ini". Penyimpangan yang sengaja ditanam (dibaca lib/schedule-analysis.js):
//   - truk 2 dan truk 5: keberangkatan terlambat 75 dan 95 menit
//   - truk 6: bergerak (status bergerak) tanpa jadwal aktif hari ini
//   - truk 9: solar turun pada 2026-09-02 padahal tidak ada jadwal hari itu
//   - truk 3: jadwal "berjalan" sekarang padahal truk berstatus istirahat
// Hanya hari dalam rentang jadwal yang dicek untuk penurunan solar.
const SCHEDULE_ROUTES = [
  { origin: "Surabaya", destination: "Malang", hours: 5.5 },
  { origin: "Sidoarjo", destination: "Pasuruan", hours: 2.5 },
  { origin: "Gresik", destination: "Surabaya", hours: 1.5 },
  { origin: "Malang", destination: "Kediri", hours: 3.5 },
  { origin: "Surabaya", destination: "Gresik", hours: 1.5 },
  { origin: "Pasuruan", destination: "Malang", hours: 3 },
  { origin: "Kediri", destination: "Malang", hours: 3.5 },
  { origin: "Sidoarjo", destination: "Krian", hours: 1 },
  { origin: "Surabaya", destination: "Pasuruan", hours: 2.5 },
  { origin: "Malang", destination: "Surabaya", hours: 5.5 },
];
const SCHEDULE_CARGO = [
  "FMCG", "Material konstruksi", "Kontainer", "Solar industri",
  "Hasil pertanian", "Elektronik", "Bahan bangunan", "Retail",
];
const SCHEDULE_DAYS_BACK = 14;
const SCHEDULE_DAYS_AHEAD = 7;
const LATE_PLANTS = {
  [T(2)]: { dayOffset: -2, minutes: 75 },
  [T(5)]: { dayOffset: -1, minutes: 95 },
};
const NO_SCHEDULE_TODAY = new Set([T(6)]);
const NO_SCHEDULE_ON_DATE = { [T(9)]: "2026-09-02" };
// Pada tanggal ada pengaduan untuk truk tersebut, jadwal selalu dibuat supaya
// halaman Pengemudi bisa menautkan pengaduan ke pengemudi yang bertugas.
const COMPLAINT_DAYS = new Set(
  complaints.map((c) => `${c.plateNumber}|${incidentDateKey(c.incidentAt)}`)
);
const FORCED_TODAY = {
  // truk berstatus bergerak -> punya jadwal aktif (kecuali truk 6, sengaja tanpa jadwal)
  [T(1)]: { departOffsetMin: -90, route: 0, status: "berjalan" },
  [T(2)]: { departOffsetMin: -60, route: 8, status: "berjalan" },
  [T(4)]: { departOffsetMin: -45, route: 4, status: "berjalan" },
  [T(8)]: { departOffsetMin: -150, route: 5, status: "berjalan" },
  [T(10)]: { departOffsetMin: -30, route: 9, status: "berjalan" },
  // truk 3 istirahat tapi dijadwalkan berjalan -> temuan "diam saat dijadwalkan"
  [T(3)]: { departOffsetMin: -120, route: 2, status: "berjalan" },
  // belum berangkat
  [T(5)]: { departOffsetMin: 180, route: 7, status: "dijadwalkan" },
  [T(7)]: { departOffsetMin: 240, route: 1, status: "dijadwalkan" },
};

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export function getSchedules(now = new Date()) {
  const drivers = getDrivers();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const rows = [];

  trucks.forEach((truck, ti) => {
    const driver = drivers.find((d) => d.truckId === truck.id) ?? drivers[ti % drivers.length];
    for (let dayOffset = -SCHEDULE_DAYS_BACK; dayOffset <= SCHEDULE_DAYS_AHEAD; dayOffset += 1) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() + dayOffset);
      const dateIso = isoDate(dayStart);
      const seed = ti * 100 + dayOffset + 50;
      const forced = dayOffset === 0 ? FORCED_TODAY[truck.id] : null;
      const plant = LATE_PLANTS[truck.id]?.dayOffset === dayOffset ? LATE_PLANTS[truck.id] : null;

      if (dayOffset === 0 && NO_SCHEDULE_TODAY.has(truck.id)) continue;
      if (NO_SCHEDULE_ON_DATE[truck.id] === dateIso) continue;
      const hasComplaint = COMPLAINT_DAYS.has(`${truck.plateNumber}|${dateIso}`);
      if (!forced && !plant && !hasComplaint && pseudoRandom(seed * 1.3) > 0.55) continue;

      const route =
        SCHEDULE_ROUTES[forced?.route ?? (ti + dayOffset + SCHEDULE_DAYS_BACK) % SCHEDULE_ROUTES.length];
      // Jadwal paksa relatif ke `now`; yang belum berangkat dijaga tetap di
      // hari ini (paling lambat pukul 23:00) supaya kartu ringkasan terisi.
      const latestToday = addMinutes(dayStart, 23 * 60);
      const plannedDeparture = forced
        ? new Date(Math.min(addMinutes(now, forced.departOffsetMin).getTime(), latestToday.getTime()))
        : addMinutes(dayStart, (6 + Math.floor(pseudoRandom(seed * 2.1) * 6)) * 60);
      const plannedArrival = addMinutes(plannedDeparture, route.hours * 60);

      let status = "dijadwalkan";
      let actualDeparture = null;
      let actualArrival = null;
      if (forced) {
        status = forced.status;
        if (status !== "dijadwalkan") actualDeparture = addMinutes(plannedDeparture, 4);
        if (status === "selesai") actualArrival = addMinutes(plannedArrival, 6);
      } else if (plannedArrival < now) {
        const delay = plant ? plant.minutes : Math.round(pseudoRandom(seed * 3.7) * 20 - 5);
        status = plant ? "terlambat" : "selesai";
        actualDeparture = addMinutes(plannedDeparture, delay);
        actualArrival = addMinutes(
          actualDeparture,
          route.hours * 60 + Math.round(pseudoRandom(seed * 4.3) * 30 - 10)
        );
      } else if (plannedDeparture <= now) {
        status = "berjalan";
        actualDeparture = addMinutes(plannedDeparture, Math.round(pseudoRandom(seed * 5.9) * 15));
      }

      rows.push({
        id: `sch-${truck.id}-${dateIso}`,
        truck_id: truck.id,
        plate_number: truck.plateNumber,
        truck_name: truck.vehicleType,
        driver_id: driver.id,
        driver_name: driver.name,
        origin: route.origin,
        destination: route.destination,
        planned_departure: plannedDeparture.toISOString(),
        planned_arrival: plannedArrival.toISOString(),
        actual_departure: actualDeparture ? actualDeparture.toISOString() : null,
        actual_arrival: actualArrival ? actualArrival.toISOString() : null,
        status,
        cargo_type: SCHEDULE_CARGO[(ti + dayOffset + SCHEDULE_DAYS_BACK) % SCHEDULE_CARGO.length],
        notes: plant ? "Menunggu bongkar muat di gudang asal." : null,
        created_at: addMinutes(plannedDeparture, -24 * 60).toISOString(),
      });
    }
  });

  return rows.sort((a, b) => a.planned_departure.localeCompare(b.planned_departure));
}

export function getComplaintById(complaintId) {
  return complaints.find((complaint) => complaint.id === complaintId) ?? null;
}

// Referensi tanggal tetap (bukan Date.now()) supaya data dummy ini
// deterministik antara render server dan client.
const ANALYTICS_END_DATE = new Date("2026-09-05T00:00:00+07:00");
const violationLocations = [
  { label: "Tol Waru-Sidoarjo", lat: -7.4, lng: 112.72, count: 4 },
  { label: "Jalan Raya Waru, Surabaya", lat: -7.349, lng: 112.719, count: 3 },
  { label: "Jalan MERR, Surabaya", lat: -7.3, lng: 112.79, count: 2 },
  { label: "Jalan Raya Porong, Sidoarjo", lat: -7.54, lng: 112.7, count: 1 },
  { label: "Jalan Raya Malang-Surabaya", lat: -7.75, lng: 112.72, count: 1 },
  { label: "Jalan Raya Pasuruan", lat: -7.645, lng: 112.908, count: 1 },
];

// ---------- SUMBER DATA ANALITIK (level kejadian) ----------
// Dipakai halaman Analitik lewat lib/analytics.js. Semua hitungan (filter
// rentang/armada, metrik, tren, distribusi jam, temuan) ada di sana, bukan di
// komponen. Saat pindah ke Supabase: ganti fungsi ini dengan query yang
// mengembalikan bentuk yang sama — complaintEvents, speedingEvents,
// validationDaily, fuelDaily — dan lib/analytics.js tidak perlu diubah.
// Deterministik (pseudoRandom, tanpa Date.now) supaya aman untuk SSR.
// Angka semu-acak deterministik per benih (lib/seeded-random.js), bukan
// Math.random(): hasil identik setiap kali dipanggil, aman untuk SSR.
const pseudoRandom = seededValue;
const ANALYTICS_SOURCE_DAYS = 180;
const SPEEDING_WEIGHT = {
  [P(5)]: 5,
  [P(10)]: 3,
  [P(4)]: 2,
  [P(3)]: 1.2,
  [P(9)]: 1.2,
};
// Bobot jam kejadian: puncak sore 14–16, puncak kecil pagi 07–08.
const HOUR_WEIGHT = [
  0.2, 0.1, 0.1, 0.1, 0.2, 0.4, 0.9, 1.4, 1.2, 0.8, 0.7, 0.8,
  0.9, 1.1, 1.8, 2.0, 1.7, 1.2, 0.9, 0.6, 0.5, 0.4, 0.3, 0.2,
];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
// Hari (ke belakang dari endDate) saat level solar turun tajam dalam sehari
// tanpa diikuti pengisian — pola yang harus tertangkap sebagai anomali.
const FUEL_ANOMALY_DAYS_AGO = {
  [P(3)]: [5],
  [P(5)]: [12, 40],
  [P(9)]: [3, 60],
};
const FUEL_REFILL_HOLD_DAYS = 3;

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function pickWeighted(items, weightOf, r) {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  let acc = 0;
  for (const item of items) {
    acc += weightOf(item);
    if (r * total <= acc) return item;
  }
  return items[items.length - 1];
}

const plateSeed = (plate) => hashSeed(plate) % 100000;

// activeTrucks: daftar truk aktif (lib/trucks.js). Deret kejadian, ngebut, dan
// solar dibangkitkan deterministik per plat, jadi plat di grafik Analitik
// selalu sama dengan daftar Armada.
export function getAnalyticsSource(activeTrucks = trucks) {
  const plates = activeTrucks.map((truck) => truck.plateNumber);
  const weightOf = (plate) => SPEEDING_WEIGHT[plate] ?? 0.5;
  const complaintEvents = [];
  const speedingEvents = [];
  const validationDaily = [];

  for (let i = ANALYTICS_SOURCE_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date(ANALYTICS_END_DATE);
    date.setDate(date.getDate() - i);
    const iso = isoDate(date);
    const seed = 1000 + i;

    const nComplaints =
      Math.floor(pseudoRandom(seed * 1.7) * 3) +
      Math.floor(pseudoRandom(seed * 2.3) * 2);
    for (let k = 0; k < nComplaints; k += 1) {
      const r = pseudoRandom(seed * 3.1 + k);
      complaintEvents.push({
        date: iso,
        plateNumber: pickWeighted(plates, weightOf, pseudoRandom(seed * 4.3 + k)),
        status: r < 0.55 ? "tervalidasi" : r < 0.8 ? "ditolak" : "perluDitinjau",
      });
    }

    plates.forEach((plate, pi) => {
      const chance = weightOf(plate) * 0.05;
      const hit = pseudoRandom(seed * 5.7 + pi) < chance;
      const n = hit ? (pseudoRandom(seed * 6.1 + pi) < 0.25 ? 2 : 1) : 0;
      for (let k = 0; k < n; k += 1) {
        const hour = pickWeighted(HOURS, (h) => HOUR_WEIGHT[h], pseudoRandom(seed * 7.9 + pi + k));
        const location = pickWeighted(
          violationLocations,
          (l) => l.count,
          pseudoRandom(seed * 8.3 + pi + k)
        );
        speedingEvents.push({
          date: iso,
          hour,
          plateNumber: plate,
          speedKph: 81 + Math.round(pseudoRandom(seed * 9.1 + pi + k) * 40),
          location: { label: location.label, lat: location.lat, lng: location.lng },
        });
      }
    });

    validationDaily.push({
      date: iso,
      avgSeconds: Math.round((6 + pseudoRandom(seed * 10.7) * 5) * 10) / 10,
    });
  }

  // Level solar HARIAN (%): turun bertahap saat dipakai, naik saat diisi ulang
  // begitu level rendah. Hari anomali: turun tajam sekali jalan, dan pengisian
  // ditahan beberapa hari setelahnya supaya polanya "turun tanpa diisi".
  const fuelDaily = plates.map((plate) => {
    const truck = activeTrucks.find((t) => t.plateNumber === plate);
    const capacityLiters = truck?.tankCapacityLiters ?? 200;
    // Konsumsi liter/hari mengikuti JENIS truk (CDD hemat, Trailer boros),
    // variasi ±20% per truk; level (%) = liter dibagi kapasitas jenisnya.
    const jenis = TRUCK_TYPES[truck?.type] ?? TRUCK_TYPES.fuso;
    const dailyLiters = jenis.dailyUseLiters * (0.8 + pseudoRandom(plateSeed(plate) * 1.9) * 0.4);
    const dailyUse = (dailyLiters / capacityLiters) * 100;
    const anomalyDays = FUEL_ANOMALY_DAYS_AGO[plate] ?? [];
    const ps = plateSeed(plate);
    let level = 60 + pseudoRandom(ps) * 30;
    // i berjalan mundur (hari ke belakang); setelah anomali di hari a,
    // pengisian ditahan selama i > a - HOLD.
    let refillBlockedWhileAbove = null;
    const points = [];
    for (let i = ANALYTICS_SOURCE_DAYS - 1; i >= 0; i -= 1) {
      const date = new Date(ANALYTICS_END_DATE);
      date.setDate(date.getDate() - i);
      const seed = ps * 7 + i;
      const prev = level;
      let refill = false;
      let anomaly = false;
      const refillBlocked =
        refillBlockedWhileAbove !== null && i > refillBlockedWhileAbove;
      const needsRefill = level < 14 + pseudoRandom(seed * 2.1) * 8;
      if (anomalyDays.includes(i)) {
        level -= 18 + pseudoRandom(seed * 1.3) * 10;
        anomaly = true;
        refillBlockedWhileAbove = i - FUEL_REFILL_HOLD_DAYS;
      } else if (needsRefill && !refillBlocked) {
        level = 90 + pseudoRandom(seed * 3.7) * 8;
        refill = true;
      } else {
        level -= dailyUse * (0.7 + pseudoRandom(seed * 4.9) * 0.6);
      }
      level = Math.max(3, Math.min(100, level));
      const liters = Math.round((level / 100) * capacityLiters);
      const prevLiters = Math.round((prev / 100) * capacityLiters);
      points.push({
        date: isoDate(date),
        fuelPct: Math.round(level),
        liters,
        refill,
        anomaly,
        deltaPct: Math.round(level - prev),
        deltaLiters: liters - prevLiters,
      });
    }
    return { plateNumber: plate, capacityLiters, vehicleType: truck?.vehicleType ?? null, points };
  });

  return {
    endDate: isoDate(ANALYTICS_END_DATE),
    plates,
    complaintEvents,
    speedingEvents,
    validationDaily,
    fuelDaily,
    manualEstimateMinutes: 15,
  };
}
