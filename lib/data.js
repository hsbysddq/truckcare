// Semua data dummy untuk dashboard Circle T didefinisikan di sini.
// Komponen tidak boleh berisi data statis — impor semuanya dari file ini.
// Seluruh armada beroperasi di Jawa Timur: plat L (Surabaya), W (Sidoarjo/
// Gresik), N (Malang/Pasuruan), AG (Kediri). Koordinat mengikuti kota nyata.

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

const trucks = [
  {
    id: "trk-01",
    nama: "Truk 01",
    plateNumber: "L 8821 AB",
    model: "Hino Ranger FM260JD",
    vehicleType: "Truk Boks Besar",
    driverName: "Agus Setiawan",
    status: "bergerak",
    lat: TITIK.pandaan.lat,
    lng: TITIK.pandaan.lng,
    speedKph: 48,
    fuelLevelPct: 72,
    odometerKm: 182430,
    lastUpdate: "2 menit lalu",
    origin: "Surabaya",
    destination: "Malang",
    progressPct: 45,
    tripStatus: "jalan",
  },
  {
    id: "trk-02",
    nama: "Truk 02",
    plateNumber: "W 9042 CD",
    model: "Mitsubishi Fuso Fighter FN527",
    vehicleType: "Truk Boks Sedang",
    driverName: "Bambang Wijaya",
    status: "bergerak",
    lat: TITIK.bangil.lat,
    lng: TITIK.bangil.lng,
    speedKph: 56,
    fuelLevelPct: 64,
    odometerKm: 143210,
    lastUpdate: "1 menit lalu",
    origin: "Sidoarjo",
    destination: "Pasuruan",
    progressPct: 65,
    tripStatus: "jalan",
  },
  {
    id: "trk-03",
    nama: "Truk 03",
    plateNumber: "W 1187 EF",
    model: "Isuzu Giga FVZ",
    vehicleType: "Truk Gandeng",
    driverName: "Candra Kurniawan",
    status: "istirahat",
    lat: -7.185,
    lng: 112.655,
    speedKph: 0,
    fuelLevelPct: 45,
    odometerKm: 210870,
    lastUpdate: "18 menit lalu",
    origin: "Gresik",
    destination: "Surabaya",
    progressPct: 25,
    tripStatus: "berhenti",
  },
  {
    id: "trk-04",
    nama: "Truk 04",
    plateNumber: "L 5560 GH",
    model: "Volvo FM 440",
    vehicleType: "Truk Kontainer",
    driverName: "Dedi Prasetyo",
    status: "bergerak",
    lat: TITIK.romokalisari.lat,
    lng: TITIK.romokalisari.lng,
    speedKph: 39,
    fuelLevelPct: 81,
    odometerKm: 96540,
    lastUpdate: "Baru saja",
    origin: "Surabaya",
    destination: "Gresik",
    progressPct: 60,
    tripStatus: "jalan",
  },
  {
    id: "trk-05",
    nama: "Truk 05",
    plateNumber: "W 3324 IJ",
    model: "Scania P360",
    vehicleType: "Truk Tangki",
    driverName: "Eko Hariyanto",
    status: "insiden",
    lat: TITIK.sukodono.lat,
    lng: TITIK.sukodono.lng,
    speedKph: 0,
    fuelLevelPct: 22,
    odometerKm: 254120,
    lastUpdate: "34 menit lalu",
    origin: "Sidoarjo",
    destination: "Krian",
    progressPct: 55,
    tripStatus: "terlambat",
  },
  {
    id: "trk-06",
    nama: "Truk 06",
    plateNumber: "N 7743 KL",
    model: "Hino Dutro 130 HD",
    vehicleType: "Truk Engkel",
    driverName: "Fajar Ramadhan",
    status: "bergerak",
    lat: TITIK.pujon.lat,
    lng: TITIK.pujon.lng,
    speedKph: 52,
    fuelLevelPct: 68,
    odometerKm: 67890,
    lastUpdate: "3 menit lalu",
    origin: "Malang",
    destination: "Kediri",
    progressPct: 35,
    tripStatus: "jalan",
  },
  {
    id: "trk-07",
    nama: "Truk 07",
    plateNumber: "N 2298 MN",
    model: "Mitsubishi Colt Diesel FE74",
    vehicleType: "Truk Engkel",
    driverName: "Gunawan Santoso",
    status: "istirahat",
    lat: TITIK.purwosari.lat,
    lng: TITIK.purwosari.lng,
    speedKph: 0,
    fuelLevelPct: 38,
    odometerKm: 118300,
    lastUpdate: "22 menit lalu",
    origin: "Pasuruan",
    destination: "Malang",
    progressPct: 50,
    tripStatus: "berhenti",
  },
  {
    id: "trk-08",
    nama: "Truk 08",
    plateNumber: "W 6612 OP",
    model: "Isuzu Elf NKR71",
    vehicleType: "Truk Engkel",
    driverName: "Hendra Gunawan",
    status: "bergerak",
    lat: -7.22,
    lng: 112.675,
    speedKph: 44,
    fuelLevelPct: 75,
    odometerKm: 88410,
    lastUpdate: "5 menit lalu",
    origin: "Gresik",
    destination: "Surabaya",
    progressPct: 70,
    tripStatus: "jalan",
  },
  {
    id: "trk-09",
    nama: "Truk 09",
    plateNumber: "AG 4405 QR",
    model: "Hino Ranger FM320",
    vehicleType: "Truk Boks Besar",
    driverName: "Imam Setiadi",
    status: "insiden",
    lat: TITIK.ngantang.lat,
    lng: TITIK.ngantang.lng,
    speedKph: 0,
    fuelLevelPct: 30,
    odometerKm: 199750,
    lastUpdate: "40 menit lalu",
    origin: "Kediri",
    destination: "Malang",
    progressPct: 55,
    tripStatus: "terlambat",
  },
  {
    id: "trk-10",
    nama: "Truk 10",
    plateNumber: "L 8890 ST",
    model: "Mitsubishi Fuso Fighter FN61",
    vehicleType: "Truk Boks Besar",
    driverName: "Joko Widagdo",
    status: "bergerak",
    lat: TITIK.singosari.lat,
    lng: TITIK.singosari.lng,
    speedKph: 58,
    fuelLevelPct: 60,
    odometerKm: 156020,
    lastUpdate: "1 menit lalu",
    origin: "Surabaya",
    destination: "Malang",
    progressPct: 85,
    tripStatus: "jalan",
  },
];

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
  "trk-01": [0, 35, 48, 55, 62, 58, 60, 52, 48, 55, 50, 45, 48],
  "trk-02": [0, 40, 52, 58, 64, 70, 66, 60, 56, 58, 54, 50, 56],
  "trk-03": [30, 42, 38, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "trk-04": [0, 28, 45, 60, 84, 72, 50, 40, 38, 42, 36, 39, 39],
  "trk-05": [0, 44, 72, 95, 88, 40, 0, 0, 0, 0, 0, 0, 0],
  "trk-06": [0, 30, 36, 42, 48, 45, 52, 50, 47, 53, 49, 52, 52],
  "trk-07": [0, 32, 40, 38, 26, 12, 0, 0, 0, 0, 0, 0, 0],
  "trk-08": [0, 36, 42, 38, 45, 41, 46, 44, 40, 43, 44, 42, 44],
  "trk-09": [0, 38, 44, 41, 83, 36, 0, 0, 0, 0, 0, 0, 0],
  "trk-10": [0, 46, 54, 60, 86, 82, 58, 55, 60, 57, 59, 56, 58],
};

const historyByTruckId = {
  "trk-01": {
    routePath: RUTE_SURABAYA_MALANG,
    speedHistory: buildSpeedHistory([30, 34, 38, 33, 40, 45, 42, 47, 44, 50, 46, 48]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-01"]),
    fuelHistory: buildDayFuel(96, DAY_SPEED["trk-01"], 2),
    tripHistory: [
      { time: "06:15", title: "Berangkat dari Terminal Surabaya", description: "Memuat 6 ton barang FMCG untuk pasar Malang." },
      { time: "07:20", title: "Melewati Tol Waru-Porong", description: "Lalu lintas lancar, kecepatan rata-rata 55 km/jam." },
      { time: "08:00", title: "Mendekati Pandaan", description: "Estimasi tiba di Malang 1 jam 20 menit lagi." },
    ],
  },
  "trk-02": {
    routePath: [TITIK.sidoarjo, TITIK.gempol, TITIK.bangil, TITIK.pasuruan],
    speedHistory: buildSpeedHistory([42, 48, 45, 52, 50, 58, 55, 60, 53, 57, 54, 56]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-02"]),
    fuelHistory: buildDayFuel(88, DAY_SPEED["trk-02"], 2),
    tripHistory: [
      { time: "06:40", title: "Berangkat dari Depo Sidoarjo", description: "Mengangkut 8 ton material konstruksi ke Pasuruan." },
      { time: "07:25", title: "Melewati Gempol", description: "Kecepatan rata-rata 58 km/jam." },
      { time: "08:00", title: "Mendekati Bangil", description: "Estimasi tiba di Pasuruan 30 menit lagi." },
    ],
  },
  "trk-03": {
    routePath: [TITIK.gresik, TITIK.romokalisari, TITIK.margomulyo, TITIK.tanjungPerak],
    speedHistory: buildSpeedHistory([35, 30, 22, 15, 8, 0, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-03"]),
    fuelHistory: buildDayFuel(63, DAY_SPEED["trk-03"], 2, ["11:00"]),
    tripHistory: [
      { time: "05:30", title: "Berangkat dari Pelabuhan Gresik", description: "Memuat bahan baku industri untuk Tanjung Perak." },
      { time: "07:10", title: "Tiba di Area Istirahat Gresik", description: "Pengemudi berhenti untuk istirahat wajib." },
      { time: "07:42", title: "Status: Berhenti", description: "Mesin dimatikan, menunggu jadwal lanjut." },
    ],
  },
  "trk-04": {
    routePath: [TITIK.tanjungPerak, TITIK.margomulyo, TITIK.romokalisari, TITIK.manyar],
    speedHistory: buildSpeedHistory([28, 32, 30, 35, 33, 38, 36, 40, 37, 41, 38, 39]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-04"]),
    fuelHistory: buildDayFuel(99, DAY_SPEED["trk-04"], 1.5),
    tripHistory: [
      { time: "07:05", title: "Berangkat dari Pelabuhan Tanjung Perak", description: "Mengirim kontainer elektronik ke Kawasan Industri Manyar." },
      { time: "07:40", title: "Melintasi Margomulyo", description: "Kondisi jalan lancar." },
      { time: "08:00", title: "Mendekati Romokalisari", description: "Estimasi tiba di Manyar 25 menit lagi." },
    ],
  },
  "trk-05": {
    routePath: [TITIK.sidoarjo, TITIK.sukodono, TITIK.krian],
    speedHistory: buildSpeedHistory([44, 46, 42, 48, 45, 40, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-05"]),
    fuelHistory: buildDayFuel(42, DAY_SPEED["trk-05"], 2, ["13:00"]),
    tripHistory: [
      { time: "06:50", title: "Berangkat dari Depo Sidoarjo", description: "Menuju gudang distribusi Krian." },
      { time: "07:35", title: "Insiden Dilaporkan", description: "Ban pecah di Jalan Raya Sukodono." },
      { time: "07:36", title: "Status: Berhenti Darurat", description: "Menunggu bantuan teknis di lokasi." },
    ],
  },
  "trk-06": {
    routePath: RUTE_MALANG_KEDIRI,
    speedHistory: buildSpeedHistory([36, 40, 38, 44, 42, 48, 45, 50, 47, 53, 49, 52]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-06"]),
    fuelHistory: buildDayFuel(92, DAY_SPEED["trk-06"], 2),
    tripHistory: [
      { time: "06:30", title: "Berangkat dari Gudang Malang", description: "Mengangkut hasil pertanian untuk pasar Kediri." },
      { time: "07:20", title: "Melewati Batu", description: "Jalan menanjak, kecepatan stabil." },
      { time: "08:00", title: "Mendekati Pujon", description: "Estimasi tiba di Kediri 1 jam 30 menit lagi." },
    ],
  },
  "trk-07": {
    routePath: [TITIK.pasuruan, TITIK.bangil, TITIK.pandaan, TITIK.purwosari, TITIK.lawang, TITIK.singosari, TITIK.malang],
    speedHistory: buildSpeedHistory([30, 26, 20, 12, 6, 0, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-07"]),
    fuelHistory: buildDayFuel(48, DAY_SPEED["trk-07"], 2),
    tripHistory: [
      { time: "06:00", title: "Berangkat dari Gudang Pasuruan", description: "Mengirim barang retail ke mitra Malang." },
      { time: "07:15", title: "Berhenti di Rest Area Purwosari", description: "Pengemudi istirahat sesuai jadwal." },
      { time: "07:50", title: "Status: Berhenti", description: "Menunggu jadwal keberangkatan lanjutan." },
    ],
  },
  "trk-08": {
    routePath: [TITIK.gresik, TITIK.romokalisari, TITIK.margomulyo, TITIK.tanjungPerak],
    speedHistory: buildSpeedHistory([32, 36, 34, 38, 36, 42, 39, 45, 41, 46, 43, 44]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-08"]),
    fuelHistory: buildDayFuel(93, DAY_SPEED["trk-08"], 1.5),
    tripHistory: [
      { time: "06:45", title: "Berangkat dari Pelabuhan Gresik", description: "Mengangkut material industri ke Tanjung Perak." },
      { time: "07:30", title: "Melintasi Romokalisari", description: "Lalu lintas lancar, kecepatan stabil." },
      { time: "08:00", title: "Mendekati Gudang Margomulyo", description: "Estimasi tiba di Tanjung Perak 20 menit lagi." },
    ],
  },
  "trk-09": {
    routePath: [...RUTE_MALANG_KEDIRI].reverse(),
    speedHistory: buildSpeedHistory([40, 42, 38, 44, 41, 36, 0, 0, 0, 0, 0, 0]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-09"]),
    fuelHistory: buildDayFuel(50, DAY_SPEED["trk-09"], 2, ["12:00"]),
    tripHistory: [
      { time: "06:20", title: "Berangkat dari Depo Kediri", description: "Menuju gudang distribusi Malang." },
      { time: "07:25", title: "Insiden Dilaporkan", description: "Mesin overheat di tanjakan Ngantang." },
      { time: "07:27", title: "Status: Terlambat", description: "Menunggu teknisi, estimasi tiba mundur 1 jam." },
    ],
  },
  "trk-10": {
    routePath: RUTE_SURABAYA_MALANG,
    speedHistory: buildSpeedHistory([46, 50, 48, 54, 52, 58, 55, 60, 56, 59, 57, 58]),
    daySpeedHistory: buildDaySpeed(DAY_SPEED["trk-10"]),
    fuelHistory: buildDayFuel(84, DAY_SPEED["trk-10"], 2),
    tripHistory: [
      { time: "06:10", title: "Berangkat dari Terminal Surabaya", description: "Mengangkut bahan bangunan ke Malang." },
      { time: "07:10", title: "Melewati Pandaan", description: "Kecepatan rata-rata 58 km/jam." },
      { time: "08:00", title: "Mendekati Singosari", description: "Estimasi tiba di Malang 25 menit lagi." },
    ],
  },
};

export function getTrucks() {
  return trucks;
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

export function getCurrentUser() {
  return {
    name: "Rangga Saputra",
    role: "Fleet Operator",
  };
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
    plateNumber: "W 9042 CD",
    incidentAt: "5 September 2026, 09:40",
    relativeTime: "Hari ini, 09:40",
    reporterNote:
      "Tadi siang ada truk boks warna putih ngebut banget di jalan raya Waru, nyalip sembarangan dari kiri, hampir nyerempet motor saya. Plat nomornya kalau nggak salah lihat W 9042 CD.",
    status: "pending",
    agentConfidence: "tinggi",
    agentReasoning:
      "Data telematika menunjukkan kendaraan melaju hingga 92 km/jam di ruas jalan dengan batas 60 km/jam, tepat pada waktu dan lokasi yang disebutkan pelapor. Pola kecepatan konsisten dengan manuver menyalip mendadak.",
    agentFindings: [
      "Plat cocok: W 9042 CD",
      "Kecepatan tercatat 92 km/jam, 32 km/jam di atas batas",
      "Lokasi dan waktu sesuai laporan",
    ],
    speedSeries: buildSpeedSeries("09:40", [45, 50, 55, 62, 70, 85, 92, 88, 75, 60, 52, 48, 45]),
    recordedSpeed: 92,
    speedLimit: 60,
    coordinates: { lat: -7.349, lng: 112.719 },
    vehicleType: "Truk Boks Sedang",
    driverName: "Bambang Wijaya",
  },
  {
    id: "RPT-081",
    judul: "Truk Ngebut di Simpang Dekat Permukiman",
    lokasi: "Simpang Jalan Veteran, Gresik",
    plateNumber: "W 6612 OP",
    incidentAt: "4 September 2026, 07:15",
    relativeTime: "1 hari lalu, 07:15",
    reporterNote:
      "Ada truk box kecil lewat simpang deket rumah saya kenceng banget pas jam sibuk pagi, saya sampai kaget karena hampir nabrak becak yang mau nyeberang.",
    status: "pending",
    agentConfidence: "tinggi",
    agentReasoning:
      "Rekaman GPS menunjukkan kecepatan puncak 78 km/jam di area simpang dengan batas 50 km/jam, bertepatan dengan jam yang dilaporkan warga. Perlambatan tajam setelahnya konsisten dengan pengereman mendadak.",
    agentFindings: [
      "Plat cocok: W 6612 OP",
      "Kecepatan tercatat 78 km/jam, 28 km/jam di atas batas",
      "Waktu kejadian sesuai jam sibuk pagi",
    ],
    speedSeries: buildSpeedSeries("07:15", [30, 35, 40, 48, 58, 68, 78, 74, 60, 45, 35, 30, 28]),
    recordedSpeed: 78,
    speedLimit: 50,
    coordinates: { lat: -7.165, lng: 112.655 },
    vehicleType: "Truk Engkel",
    driverName: "Hendra Gunawan",
  },
  {
    id: "RPT-080",
    judul: "Truk Melaju Sangat Kencang di Tol Waru-Sidoarjo",
    lokasi: "Tol Waru-Sidoarjo, KM 12",
    plateNumber: "W 3324 IJ",
    incidentAt: "3 September 2026, 16:05",
    relativeTime: "2 hari lalu, 16:05",
    reporterNote:
      "Saya lihat truk tangki gede ngebut parah di tol, kayaknya di atas 100, mepet-mepet sama mobil lain, serem banget lihatnya dari kaca spion.",
    status: "tervalidasi",
    agentConfidence: "tinggi",
    agentReasoning:
      "Telemetri mengonfirmasi kecepatan tercatat 115 km/jam, 35 km/jam di atas batas kecepatan tol 80 km/jam. Titik GPS dan waktu kejadian cocok persis dengan lokasi dan jam yang dilaporkan pelapor.",
    agentFindings: [
      "Plat cocok: W 3324 IJ",
      "Kecepatan tercatat 115 km/jam, 35 km/jam di atas batas",
      "Lokasi GPS sesuai dengan laporan",
    ],
    speedSeries: buildSpeedSeries("16:05", [70, 75, 80, 88, 98, 108, 115, 110, 95, 85, 78, 72, 68]),
    recordedSpeed: 115,
    speedLimit: 80,
    coordinates: { lat: -7.4, lng: 112.72 },
    vehicleType: "Truk Tangki",
    driverName: "Eko Hariyanto",
  },
  {
    id: "RPT-079",
    judul: "Laporan Truk Ugal-ugalan di Dekat Pasar Gresik",
    lokasi: "Jalan Pasar Gresik",
    plateNumber: "W 1187 EF",
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
    vehicleType: "Truk Gandeng",
    driverName: "Candra Kurniawan",
  },
  {
    id: "RPT-078",
    judul: "Truk Melebihi Batas Kecepatan di Jalan MERR",
    lokasi: "Jalan MERR, Surabaya",
    plateNumber: "L 5560 GH",
    incidentAt: "2 September 2026, 14:50",
    relativeTime: "3 hari lalu, 14:50",
    reporterNote:
      "Truk kontainer lumayan kencang pas lewat MERR, nggak tahu pasti seberapa cepat tapi kelihatan lebih ngebut dibanding kendaraan lain di sekitarnya.",
    status: "perlu-ditinjau",
    agentConfidence: "sedang",
    agentReasoning:
      "Telemetri mencatat kecepatan puncak 84 km/jam, hanya 4 km/jam di atas batas 80 km/jam. Selisihnya tergolong kecil dan masih dalam rentang wajar arus lalu lintas, sehingga agent tidak memutuskan sendiri dan memerlukan peninjauan manusia.",
    agentFindings: [
      "Plat cocok: L 5560 GH",
      "Kecepatan tercatat 84 km/jam, 4 km/jam di atas batas",
      "Selisih kecepatan tergolong kecil",
    ],
    speedSeries: buildSpeedSeries("14:50", [58, 62, 68, 72, 76, 80, 84, 81, 75, 68, 60, 55, 50]),
    recordedSpeed: 84,
    speedLimit: 80,
    coordinates: { lat: -7.3, lng: 112.79 },
    vehicleType: "Truk Kontainer",
    driverName: "Dedi Prasetyo",
  },
  {
    id: "RPT-077",
    judul: "Truk Melaju Kencang di Permukiman Porong",
    lokasi: "Jalan Raya Porong, Sidoarjo",
    plateNumber: "L 8890 ST",
    incidentAt: "1 September 2026, 17:30",
    relativeTime: "4 hari lalu, 17:30",
    reporterNote:
      "Kemarin sore ada truk besar ngebut sekali di jalan deket rumah, padahal itu daerah padat penduduk, anak-anak lagi main di pinggir jalan, bahaya sekali rasanya.",
    status: "tervalidasi",
    agentConfidence: "tinggi",
    agentReasoning:
      "Telemetri mengonfirmasi kecepatan tercatat 98 km/jam di kawasan permukiman dengan batas 60 km/jam. Titik GPS dan waktu kejadian sesuai dengan laporan, menunjukkan risiko keselamatan yang tinggi di area padat penduduk.",
    agentFindings: [
      "Plat cocok: L 8890 ST",
      "Kecepatan tercatat 98 km/jam, 38 km/jam di atas batas",
      "Kawasan padat penduduk, risiko tinggi",
    ],
    speedSeries: buildSpeedSeries("17:30", [40, 45, 52, 60, 72, 88, 98, 92, 78, 62, 50, 42, 38]),
    recordedSpeed: 98,
    speedLimit: 60,
    coordinates: { lat: -7.54, lng: 112.7 },
    vehicleType: "Truk Boks Besar",
    driverName: "Joko Widagdo",
  },
];

export function getComplaints() {
  return complaints;
}

export function getComplaintById(complaintId) {
  return complaints.find((complaint) => complaint.id === complaintId) ?? null;
}

// Ringkasan armada di riwayat chat dihitung dari data, bukan ditulis manual.
function ringkasanArmada() {
  const hitung = (status) => trucks.filter((t) => t.status === status).length;
  return {
    total: trucks.length,
    bergerak: hitung("bergerak"),
    istirahat: hitung("istirahat"),
    insiden: hitung("insiden"),
  };
}

export function getChatHistory() {
  const r = ringkasanArmada();
  const pending = complaints.filter((c) => c.status === "pending").map((c) => c.id);
  return [
    {
      id: "msg-1",
      role: "user",
      text: "Bagaimana kondisi armada hari ini?",
    },
    {
      id: "msg-2",
      role: "agent",
      text: `Saat ini ada ${r.total} truk yang dipantau. ${r.bergerak} unit aktif bergerak, ${r.istirahat} sedang istirahat, dan ${r.insiden} mengalami insiden yang perlu perhatian segera.`,
      toolTrace: {
        label: "Memanggil cek-telemetri (0,8 detik)",
        command: 'cek_telemetri(armada_id="all")',
        result: {
          total_armada: r.total,
          bergerak: r.bergerak,
          istirahat: r.istirahat,
          insiden: r.insiden,
        },
      },
      dataCard: {
        title: "Ringkasan Armada",
        rows: [
          { label: "Total Armada", value: `${r.total} Unit` },
          { label: "Aktif Bergerak", value: `${r.bergerak} Unit` },
          { label: "Sedang Istirahat", value: `${r.istirahat} Unit` },
          {
            label: "Insiden",
            value: `${r.insiden} Unit`,
            badge: { label: "Perlu Tindakan", tone: "danger" },
          },
        ],
      },
    },
    {
      id: "msg-3",
      role: "user",
      text: "Ada pengaduan yang belum divalidasi?",
    },
    {
      id: "msg-4",
      role: "agent",
      text: `Ada ${pending.length} laporan berstatus pending yang menunggu validasi Anda, yaitu ${pending.map((id) => `#${id}`).join(" dan ")}. Keduanya punya tingkat keyakinan AI yang tinggi.`,
      toolTrace: {
        label: "Memanggil cek-pengaduan (0,5 detik)",
        command: 'cek_pengaduan(status="pending")',
        result: {
          total_pending: pending.length,
          ids: pending,
        },
      },
    },
  ];
}

export function getAgentActivity() {
  return [
    {
      time: "21:00",
      trigger: "otomatis",
      description: "Rekap harian terkirim ke Telegram",
      resultLabel: "Terkirim",
      tone: "success",
    },
    {
      time: "14:32",
      trigger: "pengguna",
      description: "Pengaduan #RPT-082 divalidasi",
      resultLabel: "Tervalidasi",
      tone: "success",
    },
    {
      time: "09:15",
      trigger: "otomatis",
      description: "Anomali solar terdeteksi pada AG 4405 QR",
      resultLabel: "Perlu Ditinjau",
      tone: "warning",
    },
    {
      time: "08:05",
      trigger: "otomatis",
      description: "Truk L 5560 GH terdeteksi melebihi batas kecepatan",
      resultLabel: "Perlu Ditinjau",
      tone: "warning",
    },
    {
      time: "07:30",
      trigger: "pengguna",
      description: "Permintaan rekap kecepatan armada",
      resultLabel: "Selesai",
      tone: "info",
    },
    {
      time: "06:00",
      trigger: "otomatis",
      description: "Pengecekan rutin telemetri seluruh armada",
      resultLabel: "Normal",
      tone: "success",
    },
  ];
}

// Referensi tanggal tetap (bukan Date.now()) supaya data dummy ini
// deterministik antara render server dan client.
const ANALYTICS_END_DATE = new Date("2026-09-05T00:00:00+07:00");
const INDONESIAN_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatShortDate(date) {
  return `${date.getDate()} ${INDONESIAN_MONTHS_SHORT[date.getMonth()]}`;
}

// Generator angka semu-acak deterministik (bukan Math.random()) agar
// hasilnya identik setiap kali dipanggil, aman untuk SSR.
function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildDailyComplaintsTrend() {
  const days = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(ANALYTICS_END_DATE);
    date.setDate(date.getDate() - i);
    const seed = 30 - i;
    days.push({
      date: formatShortDate(date),
      tervalidasi: Math.floor(pseudoRandom(seed * 1.7) * 3),
      ditolak: Math.floor(pseudoRandom(seed * 2.3) * 2),
      perluDitinjau: Math.floor(pseudoRandom(seed * 3.1) * 2),
    });
  }
  return days;
}

const fuelConsumptionByTruck = {
  weeks: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
  series: [
    { plateNumber: "L 8821 AB", values: [145, 138, 150, 142] },
    { plateNumber: "W 9042 CD", values: [160, 155, 148, 152] },
    { plateNumber: "W 1187 EF", values: [130, 125, 40, 128] },
    { plateNumber: "L 5560 GH", values: [110, 115, 108, 112] },
    { plateNumber: "W 3324 IJ", values: [140, 40, 135, 130] },
    { plateNumber: "N 7743 KL", values: [95, 98, 92, 90] },
    { plateNumber: "N 2298 MN", values: [100, 105, 98, 102] },
    { plateNumber: "W 6612 OP", values: [88, 90, 85, 87] },
    { plateNumber: "AG 4405 QR", values: [120, 118, 50, 115] },
    { plateNumber: "L 8890 ST", values: [125, 130, 122, 128] },
  ],
  anomalies: [
    {
      plateNumber: "W 1187 EF",
      weekIndex: 2,
      note: "Konsumsi solar turun drastis karena truk berhenti beroperasi (status istirahat) pada minggu ini.",
    },
    {
      plateNumber: "W 3324 IJ",
      weekIndex: 1,
      note: "Konsumsi solar turun drastis karena truk berhenti akibat insiden pada minggu ini.",
    },
    {
      plateNumber: "AG 4405 QR",
      weekIndex: 2,
      note: "Konsumsi solar turun drastis karena truk berhenti akibat insiden pada minggu ini.",
    },
  ],
};

const speedingByPlate = [
  { plateNumber: "W 3324 IJ", count: 5 },
  { plateNumber: "L 8890 ST", count: 3 },
  { plateNumber: "L 5560 GH", count: 2 },
  { plateNumber: "W 1187 EF", count: 1 },
  { plateNumber: "AG 4405 QR", count: 1 },
];

const violationLocations = [
  { label: "Tol Waru-Sidoarjo", lat: -7.4, lng: 112.72, count: 4 },
  { label: "Jalan Raya Waru, Surabaya", lat: -7.349, lng: 112.719, count: 3 },
  { label: "Jalan MERR, Surabaya", lat: -7.3, lng: 112.79, count: 2 },
  { label: "Jalan Raya Porong, Sidoarjo", lat: -7.54, lng: 112.7, count: 1 },
  { label: "Jalan Raya Malang-Surabaya", lat: -7.75, lng: 112.72, count: 1 },
  { label: "Jalan Raya Pasuruan", lat: -7.645, lng: 112.908, count: 1 },
];

export function getAnalytics() {
  const dailyComplaintsTrend = buildDailyComplaintsTrend();

  const totalComplaints = dailyComplaintsTrend.reduce(
    (sum, day) => sum + day.tervalidasi + day.ditolak + day.perluDitinjau,
    0
  );
  const thisWeekComplaints = dailyComplaintsTrend
    .slice(-7)
    .reduce((sum, day) => sum + day.tervalidasi + day.ditolak + day.perluDitinjau, 0);
  const autoResolvedCount = dailyComplaintsTrend.reduce(
    (sum, day) => sum + day.tervalidasi + day.ditolak,
    0
  );
  const autoResolvedPct = Math.round((autoResolvedCount / totalComplaints) * 100);

  const speedingTotal = speedingByPlate.reduce((sum, item) => sum + item.count, 0);

  return {
    metrics: {
      complaintsProcessed: {
        total: totalComplaints,
        thisWeek: thisWeekComplaints,
      },
      autoResolvedPct,
      avgValidationSeconds: 8,
      manualEstimateMinutes: 15,
      speedingIncidents: {
        total: speedingTotal,
        vehiclesInvolved: speedingByPlate.length,
      },
    },
    dailyComplaintsTrend,
    fuelConsumptionByTruck,
    speedingByPlate: [...speedingByPlate].sort((a, b) => b.count - a.count),
    violationLocations,
  };
}
