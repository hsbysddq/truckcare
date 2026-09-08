// Rute tetap (waypoint) untuk 10 truk — simulasi distribusi.
// Format: [lat, lon, label, tiba_menit] — tiba_menit = menit sejak mulai perjalanan.
// Plat dan wilayah sengaja disamakan dengan armada dummy di lib/data.js:
// seluruh rute berada di Jawa Timur (Surabaya, Sidoarjo, Gresik, Pasuruan, Malang).

export const RUTE = [
  // Truk 1 — Gudang Margomulyo → Pusat Distribusi Surabaya Utara
  {
    truk: "L 8821 AB",
    asal: "Gudang Margomulyo",
    tujuan: "Pusat Distribusi Surabaya Utara",
    waypoints: [
      [-7.2340, 112.6900, "Gudang Margomulyo", 0],
      [-7.2050, 112.7350, "Tanjung Perak", 30],
      [-7.2250, 112.7800, "Pusat Distribusi Surabaya Utara", 55],
    ],
  },
  // Truk 2 — Depo Rungkut → Sidoarjo
  {
    truk: "L 9042 CD",
    asal: "Depo Rungkut",
    tujuan: "Sidoarjo",
    waypoints: [
      [-7.3300, 112.7700, "Depo Rungkut", 0],
      [-7.3490, 112.7190, "Simpang Waru", 25],
      [-7.4470, 112.7180, "Sidoarjo", 60],
    ],
  },
  // Truk 3 — Pelabuhan Gresik → Krian (berhenti lama di rest area — skenario)
  {
    truk: "L 1187 EF",
    asal: "Pelabuhan Gresik",
    tujuan: "Krian",
    waypoints: [
      [-7.1550, 112.6550, "Pelabuhan Gresik", 0],
      [-7.2600, 112.6300, "Rest Area (stop 40 mnt)", 35],
      [-7.3550, 112.6200, "Driyorejo", 95],
      [-7.4110, 112.5820, "Krian", 120],
    ],
  },
  // Truk 4 — Gudang Sukolilo → Rungkut
  {
    truk: "L 5560 GH",
    asal: "Gudang Sukolilo",
    tujuan: "Rungkut",
    waypoints: [
      [-7.2900, 112.7950, "Gudang Sukolilo", 0],
      [-7.3100, 112.7850, "Jalan MERR", 15],
      [-7.3300, 112.7700, "Rungkut", 30],
    ],
  },
  // Truk 5 — Depo Sidoarjo → Krian
  {
    truk: "L 3324 IJ",
    asal: "Depo Sidoarjo",
    tujuan: "Krian",
    waypoints: [
      [-7.4500, 112.7250, "Depo Sidoarjo", 0],
      [-7.4300, 112.6500, "Sukodono", 30],
      [-7.4110, 112.5820, "Krian", 60],
    ],
  },
  // Truk 6 — Surabaya → Malang (rute panjang lewat Pandaan)
  {
    truk: "L 7743 KL",
    asal: "Surabaya",
    tujuan: "Malang",
    waypoints: [
      [-7.3000, 112.7300, "Terminal Surabaya", 0],
      [-7.5400, 112.7000, "Porong", 40],
      [-7.6550, 112.6900, "Pandaan", 65],
      [-7.7500, 112.7200, "Purwosari", 90],
      [-7.8900, 112.6650, "Singosari", 120],
      [-7.9770, 112.6300, "Malang", 145],
    ],
  },
  // Truk 7 — Surabaya → Pasuruan (berhenti di rest area Porong — skenario)
  {
    truk: "L 2298 MN",
    asal: "Surabaya",
    tujuan: "Pasuruan",
    waypoints: [
      [-7.3300, 112.7700, "Gudang Rungkut", 0],
      [-7.5300, 112.7050, "Rest Area (stop 40 mnt)", 40],
      [-7.6450, 112.9080, "Pasuruan", 130],
    ],
  },
  // Truk 8 — Gresik → Kawasan Industri Manyar
  {
    truk: "L 6612 OP",
    asal: "Gresik",
    tujuan: "Kawasan Industri Manyar",
    waypoints: [
      [-7.1600, 112.6500, "Pelabuhan Gresik", 0],
      [-7.1285, 112.6012, "Manyar", 25],
      [-7.1050, 112.6100, "Kawasan Industri Manyar", 40],
    ],
  },
  // Truk 9 — Depo Wiyung → Krian
  {
    truk: "L 4405 QR",
    asal: "Depo Wiyung",
    tujuan: "Krian",
    waypoints: [
      [-7.3150, 112.6800, "Depo Wiyung", 0],
      [-7.3550, 112.6200, "Driyorejo", 30],
      [-7.4110, 112.5820, "Krian", 55],
    ],
  },
  // Truk 10 — Sidoarjo → Malang
  {
    truk: "L 8890 ST",
    asal: "Sidoarjo",
    tujuan: "Malang",
    waypoints: [
      [-7.4500, 112.7250, "Depo Sidoarjo", 0],
      [-7.6550, 112.6900, "Pandaan", 45],
      [-7.8350, 112.6950, "Lawang", 85],
      [-7.8900, 112.6650, "Singosari", 100],
      [-7.9770, 112.6300, "Malang", 125],
    ],
  },
];
