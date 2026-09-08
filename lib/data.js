// Semua data dummy untuk dashboard Circle T didefinisikan di sini.
// Komponen tidak boleh berisi data statis — impor semuanya dari file ini.

const trucks = [
  {
    id: "trk-01",
    plateNumber: "L 8821 AB",
    model: "Hino Ranger FM260JD",
    driverName: "Agus Setiawan",
    status: "bergerak",
    lat: -7.205,
    lng: 112.735,
    speedKph: 48,
    fuelLevelPct: 72,
    lastUpdate: "2 menit lalu",
    origin: "Gudang Margomulyo",
    destination: "Pusat Distribusi Surabaya Utara",
    progressPct: 65,
    tripStatus: "jalan",
  },
  {
    id: "trk-02",
    plateNumber: "L 9042 CD",
    model: "Mitsubishi Fuso Fighter FN527",
    driverName: "Bambang Wijaya",
    status: "bergerak",
    lat: -7.335,
    lng: 112.725,
    speedKph: 56,
    fuelLevelPct: 64,
    lastUpdate: "1 menit lalu",
    origin: "Depo Rungkut",
    destination: "Sidoarjo",
    progressPct: 40,
    tripStatus: "jalan",
  },
  {
    id: "trk-03",
    plateNumber: "L 1187 EF",
    model: "Isuzu Giga FVZ",
    driverName: "Candra Kurniawan",
    status: "istirahat",
    lat: -7.162,
    lng: 112.658,
    speedKph: 0,
    fuelLevelPct: 45,
    lastUpdate: "18 menit lalu",
    origin: "Pelabuhan Gresik",
    destination: "Krian",
    progressPct: 30,
    tripStatus: "berhenti",
  },
  {
    id: "trk-04",
    plateNumber: "L 5560 GH",
    model: "Volvo FM 440",
    driverName: "Dedi Prasetyo",
    status: "bergerak",
    lat: -7.315,
    lng: 112.785,
    speedKph: 39,
    fuelLevelPct: 81,
    lastUpdate: "Baru saja",
    origin: "Gudang Sukolilo",
    destination: "Rungkut",
    progressPct: 80,
    tripStatus: "jalan",
  },
  {
    id: "trk-05",
    plateNumber: "L 3324 IJ",
    model: "Scania P360",
    driverName: "Eko Hariyanto",
    status: "insiden",
    lat: -7.445,
    lng: 112.72,
    speedKph: 0,
    fuelLevelPct: 22,
    lastUpdate: "34 menit lalu",
    origin: "Depo Sidoarjo",
    destination: "Krian",
    progressPct: 55,
    tripStatus: "terlambat",
  },
  {
    id: "trk-06",
    plateNumber: "L 7743 KL",
    model: "Hino Dutro 130 HD",
    driverName: "Fajar Ramadhan",
    status: "bergerak",
    lat: -7.5766,
    lng: 112.6983,
    speedKph: 52,
    fuelLevelPct: 68,
    lastUpdate: "3 menit lalu",
    origin: "Surabaya",
    destination: "Malang",
    progressPct: 45,
    tripStatus: "jalan",
  },
  {
    id: "trk-07",
    plateNumber: "L 2298 MN",
    model: "Mitsubishi Colt Diesel FE74",
    driverName: "Gunawan Santoso",
    status: "istirahat",
    lat: -7.3351,
    lng: 112.7832,
    speedKph: 0,
    fuelLevelPct: 38,
    lastUpdate: "22 menit lalu",
    origin: "Surabaya",
    destination: "Pasuruan",
    progressPct: 20,
    tripStatus: "berhenti",
  },
  {
    id: "trk-08",
    plateNumber: "L 6612 OP",
    model: "Isuzu Elf NKR71",
    driverName: "Hendra Gunawan",
    status: "bergerak",
    lat: -7.1359,
    lng: 112.5117,
    speedKph: 44,
    fuelLevelPct: 75,
    lastUpdate: "5 menit lalu",
    origin: "Gresik",
    destination: "Lamongan",
    progressPct: 60,
    tripStatus: "jalan",
  },
  {
    id: "trk-09",
    plateNumber: "L 4405 QR",
    model: "Hino Ranger FM320",
    driverName: "Imam Setiadi",
    status: "insiden",
    lat: -7.3306,
    lng: 112.6409,
    speedKph: 0,
    fuelLevelPct: 30,
    lastUpdate: "40 menit lalu",
    origin: "Surabaya",
    destination: "Mojokerto",
    progressPct: 35,
    tripStatus: "terlambat",
  },
  {
    id: "trk-10",
    plateNumber: "L 8890 ST",
    model: "Mitsubishi Fuso Fighter FN61",
    driverName: "Joko Widagdo",
    status: "bergerak",
    lat: -7.811,
    lng: 112.6583,
    speedKph: 58,
    fuelLevelPct: 60,
    lastUpdate: "1 menit lalu",
    origin: "Sidoarjo",
    destination: "Malang",
    progressPct: 70,
    tripStatus: "jalan",
  },
];

const TIME_LABELS = [
  "07:05",
  "07:10",
  "07:15",
  "07:20",
  "07:25",
  "07:30",
  "07:35",
  "07:40",
  "07:45",
  "07:50",
  "07:55",
  "08:00",
];

function buildSpeedHistory(values) {
  return values.map((speedKph, index) => ({
    label: TIME_LABELS[index],
    speedKph,
  }));
}

const historyByTruckId = {
  "trk-01": {
    speedHistory: buildSpeedHistory([
      30, 34, 38, 33, 40, 45, 42, 47, 44, 50, 46, 48,
    ]),
    tripHistory: [
      {
        time: "06:15",
        title: "Berangkat dari Gudang Margomulyo",
        description: "Memuat 6 ton barang FMCG untuk distribusi.",
      },
      {
        time: "07:00",
        title: "Transit di Tanjung Perak",
        description: "Verifikasi dokumen pengiriman di area pelabuhan.",
      },
      {
        time: "08:00",
        title: "Menuju Pusat Distribusi Surabaya Utara",
        description: "Estimasi tiba dalam 15 menit.",
      },
    ],
  },
  "trk-02": {
    speedHistory: buildSpeedHistory([
      42, 48, 45, 52, 50, 58, 55, 60, 53, 57, 54, 56,
    ]),
    tripHistory: [
      {
        time: "06:40",
        title: "Berangkat dari Depo Rungkut",
        description: "Mengangkut 8 ton material konstruksi.",
      },
      {
        time: "07:30",
        title: "Melewati Tol Waru-Sidoarjo",
        description: "Kecepatan rata-rata 58 km/jam.",
      },
      {
        time: "08:00",
        title: "Mendekati Simpang Aloha",
        description: "Lalu lintas padat, kecepatan menurun.",
      },
    ],
  },
  "trk-03": {
    speedHistory: buildSpeedHistory([
      35, 30, 22, 15, 8, 0, 0, 0, 0, 0, 0, 0,
    ]),
    tripHistory: [
      {
        time: "05:30",
        title: "Berangkat dari Pelabuhan Gresik",
        description: "Memuat bahan baku industri.",
      },
      {
        time: "07:10",
        title: "Tiba di Area Istirahat Gresik",
        description: "Pengemudi berhenti untuk istirahat wajib.",
      },
      {
        time: "07:42",
        title: "Status: Berhenti",
        description: "Mesin dimatikan, menunggu jadwal lanjut.",
      },
    ],
  },
  "trk-04": {
    speedHistory: buildSpeedHistory([
      28, 32, 30, 35, 33, 38, 36, 40, 37, 41, 38, 39,
    ]),
    tripHistory: [
      {
        time: "07:05",
        title: "Berangkat dari Gudang Sukolilo",
        description: "Mengirim barang elektronik ke ritel mitra.",
      },
      {
        time: "07:40",
        title: "Melintasi Jalan MERR",
        description: "Kondisi jalan lancar.",
      },
      {
        time: "08:00",
        title: "Mendekati Tujuan",
        description: "Estimasi tiba dalam 10 menit.",
      },
    ],
  },
  "trk-05": {
    speedHistory: buildSpeedHistory([
      44, 46, 42, 48, 45, 40, 0, 0, 0, 0, 0, 0,
    ]),
    tripHistory: [
      {
        time: "06:50",
        title: "Berangkat dari Depo Sidoarjo",
        description: "Menuju gudang distribusi Krian.",
      },
      {
        time: "07:35",
        title: "Insiden Dilaporkan",
        description: "Ban pecah di Jalan Raya Sidoarjo.",
      },
      {
        time: "07:36",
        title: "Status: Berhenti Darurat",
        description: "Menunggu bantuan teknis di lokasi.",
      },
    ],
  },
  "trk-06": {
    speedHistory: buildSpeedHistory([
      36, 40, 38, 44, 42, 48, 45, 50, 47, 53, 49, 52,
    ]),
    tripHistory: [
      {
        time: "06:30",
        title: "Berangkat dari Terminal Surabaya",
        description: "Mengangkut hasil pertanian untuk pasar Malang.",
      },
      {
        time: "07:20",
        title: "Melewati Porong-Pandaan",
        description: "Jalan menanjak, kecepatan stabil.",
      },
      {
        time: "08:00",
        title: "Mendekati Purwosari",
        description: "Estimasi tiba di Malang 40 menit lagi.",
      },
    ],
  },
  "trk-07": {
    speedHistory: buildSpeedHistory([
      30, 26, 20, 12, 6, 0, 0, 0, 0, 0, 0, 0,
    ]),
    tripHistory: [
      {
        time: "06:00",
        title: "Berangkat dari Gudang Rungkut",
        description: "Mengirim barang retail ke mitra Pasuruan.",
      },
      {
        time: "07:15",
        title: "Berhenti di Rest Area Porong",
        description: "Pengemudi istirahat sesuai jadwal.",
      },
      {
        time: "07:50",
        title: "Status: Berhenti",
        description: "Menunggu jadwal keberangkatan lanjutan.",
      },
    ],
  },
  "trk-08": {
    speedHistory: buildSpeedHistory([
      32, 36, 34, 38, 36, 42, 39, 45, 41, 46, 43, 44,
    ]),
    tripHistory: [
      {
        time: "06:45",
        title: "Berangkat dari Pelabuhan Gresik",
        description: "Mengangkut material industri ke Lamongan.",
      },
      {
        time: "07:30",
        title: "Melintasi Jalur Pantura",
        description: "Lalu lintas lancar, kecepatan stabil.",
      },
      {
        time: "08:00",
        title: "Mendekati Kawasan Industri Lamongan",
        description: "Estimasi tiba dalam 20 menit.",
      },
    ],
  },
  "trk-09": {
    speedHistory: buildSpeedHistory([
      40, 42, 38, 44, 41, 36, 0, 0, 0, 0, 0, 0,
    ]),
    tripHistory: [
      {
        time: "06:20",
        title: "Berangkat dari Depo Wiyung",
        description: "Menuju gudang distribusi Mojokerto.",
      },
      {
        time: "07:25",
        title: "Insiden Dilaporkan",
        description: "Mesin overheat di Jalan Raya Krian.",
      },
      {
        time: "07:27",
        title: "Status: Terlambat",
        description: "Menunggu teknisi, estimasi tiba mundur 1 jam.",
      },
    ],
  },
  "trk-10": {
    speedHistory: buildSpeedHistory([
      46, 50, 48, 54, 52, 58, 55, 60, 56, 59, 57, 58,
    ]),
    tripHistory: [
      {
        time: "06:10",
        title: "Berangkat dari Depo Sidoarjo",
        description: "Mengangkut bahan bangunan ke Malang.",
      },
      {
        time: "07:10",
        title: "Melewati Pandaan",
        description: "Kecepatan rata-rata 58 km/jam.",
      },
      {
        time: "08:00",
        title: "Mendekati Singosari",
        description: "Estimasi tiba di Malang 25 menit lagi.",
      },
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
  return historyByTruckId[truckId] ?? { speedHistory: [], tripHistory: [] };
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
    plateNumber: "L 9042 CD",
    incidentAt: "5 September 2026, 09:40",
    relativeTime: "Hari ini, 09:40",
    reporterNote:
      "Tadi siang ada truk boks warna putih ngebut banget di jalan raya Waru, nyalip sembarangan dari kiri, hampir nyerempet motor saya. Plat nomornya kalau nggak salah lihat L 9042 CD.",
    status: "pending",
    agentConfidence: "tinggi",
    agentReasoning:
      "Data telematika menunjukkan kendaraan melaju hingga 92 km/jam di ruas jalan dengan batas 60 km/jam, tepat pada waktu dan lokasi yang disebutkan pelapor. Pola kecepatan konsisten dengan manuver menyalip mendadak.",
    agentFindings: [
      "Plat cocok: L 9042 CD",
      "Kecepatan tercatat 92 km/jam, 32 km/jam di atas batas",
      "Lokasi dan waktu sesuai laporan",
    ],
    speedSeries: buildSpeedSeries("09:40", [
      45, 50, 55, 62, 70, 85, 92, 88, 75, 60, 52, 48, 45,
    ]),
    recordedSpeed: 92,
    speedLimit: 60,
    coordinates: { lat: -7.349, lng: 112.719 },
    vehicleType: "Truk Boks Sedang",
    driverName: "Bambang Wijaya",
  },
  {
    id: "RPT-081",
    judul: "Truk Ngebut di Simpang Dekat Permukiman",
    lokasi: "Simpang Jalan Lamongan-Gresik",
    plateNumber: "L 6612 OP",
    incidentAt: "4 September 2026, 07:15",
    relativeTime: "1 hari lalu, 07:15",
    reporterNote:
      "Ada truk box kecil lewat simpang deket rumah saya kenceng banget pas jam sibuk pagi, saya sampai kaget karena hampir nabrak becak yang mau nyeberang.",
    status: "pending",
    agentConfidence: "tinggi",
    agentReasoning:
      "Rekaman GPS menunjukkan kecepatan puncak 78 km/jam di area simpang dengan batas 50 km/jam, bertepatan dengan jam yang dilaporkan warga. Perlambatan tajam setelahnya konsisten dengan pengereman mendadak.",
    agentFindings: [
      "Plat cocok: L 6612 OP",
      "Kecepatan tercatat 78 km/jam, 28 km/jam di atas batas",
      "Waktu kejadian sesuai jam sibuk pagi",
    ],
    speedSeries: buildSpeedSeries("07:15", [
      30, 35, 40, 48, 58, 68, 78, 74, 60, 45, 35, 30, 28,
    ]),
    recordedSpeed: 78,
    speedLimit: 50,
    coordinates: { lat: -7.14, lng: 112.52 },
    vehicleType: "Truk Engkel",
    driverName: "Hendra Gunawan",
  },
  {
    id: "RPT-080",
    judul: "Truk Melaju Sangat Kencang di Tol Waru-Sidoarjo",
    lokasi: "Tol Waru-Sidoarjo, KM 12",
    plateNumber: "L 3324 IJ",
    incidentAt: "3 September 2026, 16:05",
    relativeTime: "2 hari lalu, 16:05",
    reporterNote:
      "Saya lihat truk tangki gede ngebut parah di tol, kayaknya di atas 100, mepet-mepet sama mobil lain, serem banget lihatnya dari kaca spion.",
    status: "tervalidasi",
    agentConfidence: "tinggi",
    agentReasoning:
      "Telemetri mengonfirmasi kecepatan tercatat 115 km/jam, 35 km/jam di atas batas kecepatan tol 80 km/jam. Titik GPS dan waktu kejadian cocok persis dengan lokasi dan jam yang dilaporkan pelapor.",
    agentFindings: [
      "Plat cocok: L 3324 IJ",
      "Kecepatan tercatat 115 km/jam, 35 km/jam di atas batas",
      "Lokasi GPS sesuai dengan laporan",
    ],
    speedSeries: buildSpeedSeries("16:05", [
      70, 75, 80, 88, 98, 108, 115, 110, 95, 85, 78, 72, 68,
    ]),
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
    plateNumber: "L 1187 EF",
    incidentAt: "3 September 2026, 11:20",
    relativeTime: "2 hari lalu, 11:20",
    reporterNote:
      "Ada truk gandeng warna abu ngebut sekali lewat pasar, plat awalnya L 1187 kalau tidak salah, saya khawatir soalnya ramai banyak pejalan kaki di situ.",
    status: "ditolak",
    agentConfidence: "tinggi",
    agentReasoning:
      "Telemetri menunjukkan truk terparkir di depo dengan kecepatan 0 km/jam sepanjang jam yang dilaporkan. Titik GPS berada di Depo Gresik, tidak sesuai dengan lokasi Pasar Gresik yang disebutkan dalam laporan.",
    agentFindings: [
      "Kecepatan tercatat 0 km/jam sepanjang jam laporan",
      "Lokasi GPS di Depo Gresik, tidak sesuai laporan",
      "Kemungkinan salah identifikasi plat nomor",
    ],
    speedSeries: buildSpeedSeries("11:20", [
      0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    ]),
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
    speedSeries: buildSpeedSeries("14:50", [
      58, 62, 68, 72, 76, 80, 84, 81, 75, 68, 60, 55, 50,
    ]),
    recordedSpeed: 84,
    speedLimit: 80,
    coordinates: { lat: -7.3, lng: 112.79 },
    vehicleType: "Truk Kontainer",
    driverName: "Dedi Prasetyo",
  },
  {
    id: "RPT-077",
    judul: "Truk Melaju Kencang di Permukiman Sidoarjo",
    lokasi: "Jalan Raya Sidoarjo-Krian",
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
    speedSeries: buildSpeedSeries("17:30", [
      40, 45, 52, 60, 72, 88, 98, 92, 78, 62, 50, 42, 38,
    ]),
    recordedSpeed: 98,
    speedLimit: 60,
    coordinates: { lat: -7.4, lng: 112.6 },
    vehicleType: "Truk Fuso",
    driverName: "Joko Widagdo",
  },
];

export function getComplaints() {
  return complaints;
}

export function getComplaintById(complaintId) {
  return complaints.find((complaint) => complaint.id === complaintId) ?? null;
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
      description: "Anomali solar terdeteksi pada B 9901 XX",
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
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
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
    { plateNumber: "L 9042 CD", values: [160, 155, 148, 152] },
    { plateNumber: "L 1187 EF", values: [130, 125, 40, 128] },
    { plateNumber: "L 5560 GH", values: [110, 115, 108, 112] },
    { plateNumber: "L 3324 IJ", values: [140, 40, 135, 130] },
    { plateNumber: "L 7743 KL", values: [95, 98, 92, 90] },
    { plateNumber: "L 2298 MN", values: [100, 105, 98, 102] },
    { plateNumber: "L 6612 OP", values: [88, 90, 85, 87] },
    { plateNumber: "L 4405 QR", values: [120, 118, 50, 115] },
    { plateNumber: "L 8890 ST", values: [125, 130, 122, 128] },
  ],
  anomalies: [
    {
      plateNumber: "L 1187 EF",
      weekIndex: 2,
      note: "Konsumsi solar turun drastis karena truk berhenti beroperasi (status istirahat) pada minggu ini.",
    },
    {
      plateNumber: "L 3324 IJ",
      weekIndex: 1,
      note: "Konsumsi solar turun drastis karena truk berhenti akibat insiden pada minggu ini.",
    },
    {
      plateNumber: "L 4405 QR",
      weekIndex: 2,
      note: "Konsumsi solar turun drastis karena truk berhenti akibat insiden pada minggu ini.",
    },
  ],
};

const speedingByPlate = [
  { plateNumber: "L 3324 IJ", count: 5 },
  { plateNumber: "L 8890 ST", count: 3 },
  { plateNumber: "L 5560 GH", count: 2 },
  { plateNumber: "L 1187 EF", count: 1 },
  { plateNumber: "L 4405 QR", count: 1 },
];

const violationLocations = [
  { label: "Tol Waru-Sidoarjo", lat: -7.4, lng: 112.72, count: 4 },
  { label: "Jalan Raya Waru, Surabaya", lat: -7.349, lng: 112.719, count: 3 },
  { label: "Jalan MERR, Surabaya", lat: -7.3, lng: 112.79, count: 2 },
  { label: "Jalan Raya Sidoarjo-Krian", lat: -7.4, lng: 112.6, count: 1 },
  { label: "Jalan Raya Malang-Surabaya", lat: -7.75, lng: 112.6, count: 1 },
  { label: "Jalan Raya Pasuruan", lat: -7.6453, lng: 112.9075, count: 1 },
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
