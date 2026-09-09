// Rute tetap (waypoint) untuk 15 truk — simulasi distribusi.
// Format: [lat, lon, label, tiba_menit] — tiba_menit = menit sejak mulai perjalanan.
// Plat dan rute sengaja disamakan dengan armada dummy di lib/data.js:
// seluruhnya antar kota Jawa Timur (plat L, W, N, AG).

export const RUTE = [
  // Truk 1 — Surabaya → Malang
  {
    truk: "L 8821 AB",
    asal: "Surabaya",
    tujuan: "Malang",
    waypoints: [
      [-7.3000, 112.7300, "Terminal Surabaya", 0],
      [-7.3500, 112.7200, "Simpang Waru", 15],
      [-7.5400, 112.7000, "Porong", 45],
      [-7.6550, 112.6900, "Pandaan", 65],
      [-7.7500, 112.7200, "Purwosari", 90],
      [-7.8350, 112.6950, "Lawang", 110],
      [-7.8900, 112.6650, "Singosari", 125],
      [-7.9770, 112.6300, "Malang", 145],
    ],
  },
  // Truk 2 — Sidoarjo → Pasuruan
  {
    truk: "W 9042 CD",
    asal: "Sidoarjo",
    tujuan: "Pasuruan",
    waypoints: [
      [-7.4470, 112.7180, "Depo Sidoarjo", 0],
      [-7.5500, 112.7200, "Gempol", 25],
      [-7.6000, 112.7900, "Bangil", 45],
      [-7.6450, 112.9080, "Pasuruan", 75],
    ],
  },
  // Truk 3 — Gresik → Surabaya (berhenti lama di rest area — skenario)
  {
    truk: "W 1187 EF",
    asal: "Gresik",
    tujuan: "Surabaya",
    waypoints: [
      [-7.1600, 112.6500, "Pelabuhan Gresik", 0],
      [-7.1850, 112.6550, "Rest Area (stop 40 mnt)", 15],
      [-7.2000, 112.6600, "Romokalisari", 65],
      [-7.2350, 112.6900, "Gudang Margomulyo", 85],
      [-7.2050, 112.7350, "Pelabuhan Tanjung Perak", 105],
    ],
  },
  // Truk 4 — Surabaya → Gresik (Kawasan Industri Manyar)
  {
    truk: "L 5560 GH",
    asal: "Surabaya",
    tujuan: "Gresik",
    waypoints: [
      [-7.2050, 112.7350, "Pelabuhan Tanjung Perak", 0],
      [-7.2350, 112.6900, "Gudang Margomulyo", 20],
      [-7.2000, 112.6600, "Romokalisari", 35],
      [-7.1050, 112.6100, "Kawasan Industri Manyar", 60],
    ],
  },
  // Truk 5 — Sidoarjo → Krian
  {
    truk: "W 3324 IJ",
    asal: "Sidoarjo",
    tujuan: "Krian",
    waypoints: [
      [-7.4470, 112.7180, "Depo Sidoarjo", 0],
      [-7.4300, 112.6500, "Sukodono", 30],
      [-7.4100, 112.5800, "Gudang Krian", 60],
    ],
  },
  // Truk 6 — Malang → Kediri
  {
    truk: "N 7743 KL",
    asal: "Malang",
    tujuan: "Kediri",
    waypoints: [
      [-7.9770, 112.6300, "Malang", 0],
      [-7.8700, 112.5300, "Batu", 30],
      [-7.8400, 112.4700, "Pujon", 50],
      [-7.8800, 112.3800, "Ngantang", 75],
      [-7.8500, 112.3000, "Kandangan", 95],
      [-7.7700, 112.2000, "Pare", 120],
      [-7.8200, 112.0100, "Kediri", 150],
    ],
  },
  // Truk 7 — Pasuruan → Malang (berhenti di rest area Purwosari — skenario)
  {
    truk: "N 2298 MN",
    asal: "Pasuruan",
    tujuan: "Malang",
    waypoints: [
      [-7.6450, 112.9080, "Pasuruan", 0],
      [-7.6000, 112.7900, "Bangil", 30],
      [-7.6550, 112.6900, "Pandaan", 55],
      [-7.7500, 112.7200, "Rest Area (stop 40 mnt)", 80],
      [-7.8350, 112.6950, "Lawang", 140],
      [-7.8900, 112.6650, "Singosari", 155],
      [-7.9770, 112.6300, "Malang", 175],
    ],
  },
  // Truk 8 — Gresik → Surabaya
  {
    truk: "W 6612 OP",
    asal: "Gresik",
    tujuan: "Surabaya",
    waypoints: [
      [-7.1600, 112.6500, "Pelabuhan Gresik", 0],
      [-7.2000, 112.6600, "Romokalisari", 20],
      [-7.2350, 112.6900, "Gudang Margomulyo", 40],
      [-7.2050, 112.7350, "Pelabuhan Tanjung Perak", 60],
    ],
  },
  // Truk 9 — Kediri → Malang
  {
    truk: "AG 4405 QR",
    asal: "Kediri",
    tujuan: "Malang",
    waypoints: [
      [-7.8200, 112.0100, "Kediri", 0],
      [-7.7700, 112.2000, "Pare", 30],
      [-7.8500, 112.3000, "Kandangan", 55],
      [-7.8800, 112.3800, "Ngantang", 75],
      [-7.8400, 112.4700, "Pujon", 100],
      [-7.8700, 112.5300, "Batu", 120],
      [-7.9770, 112.6300, "Malang", 150],
    ],
  },
  // Truk 10 — Surabaya → Malang
  {
    truk: "L 8890 ST",
    asal: "Surabaya",
    tujuan: "Malang",
    waypoints: [
      [-7.3000, 112.7300, "Terminal Surabaya", 0],
      [-7.5400, 112.7000, "Porong", 40],
      [-7.6550, 112.6900, "Pandaan", 60],
      [-7.8350, 112.6950, "Lawang", 100],
      [-7.8900, 112.6650, "Singosari", 115],
      [-7.9770, 112.6300, "Malang", 135],
    ],
  },
  // Truk 11 — Surabaya → Lamongan
  {
    truk: "L 9911 MU",
    asal: "Surabaya",
    tujuan: "Lamongan",
    waypoints: [
      [-7.3000, 112.7300, "Terminal Surabaya", 0],
      [-7.2300, 112.5200, "Tanjung Bumi", 30],
      [-7.1700, 112.4800, "Sukodadi", 50],
      [-7.1100, 112.4100, "Lamongan", 80],
    ],
  },
  // Truk 12 — Surabaya → Mojokerto
  {
    truk: "W 1234 NV",
    asal: "Surabaya",
    tujuan: "Mojokerto",
    waypoints: [
      [-7.3000, 112.7300, "Terminal Surabaya", 0],
      [-7.3900, 112.6500, "Gedangan", 25],
      [-7.4500, 112.5400, "Tulangan", 45],
      [-7.5100, 112.4600, "Krian", 60],
      [-7.5500, 112.4300, "Mojokerto", 80],
    ],
  },
  // Truk 13 — Gresik → Tuban
  {
    truk: "N 7788 OP",
    asal: "Gresik",
    tujuan: "Tuban",
    waypoints: [
      [-7.1600, 112.6500, "Pelabuhan Gresik", 0],
      [-7.0900, 112.6000, "Ujungpangkah", 30],
      [-7.0000, 112.5000, "Sidayu", 60],
      [-6.9700, 112.3000, "Babat", 95],
      [-6.9000, 112.0700, "Tuban", 135],
    ],
  },
  // Truk 14 — Sidoarjo → Jombang
  {
    truk: "AG 5566 PQ",
    asal: "Sidoarjo",
    tujuan: "Jombang",
    waypoints: [
      [-7.4470, 112.7180, "Depo Sidoarjo", 0],
      [-7.4900, 112.6200, "Tarik", 35],
      [-7.5200, 112.5200, "Prambon", 55],
      [-7.5700, 112.4200, "Diwek", 80],
      [-7.5450, 112.2200, "Jombang", 110],
    ],
  },
  // Truk 15 — Surabaya → Nganjuk
  {
    truk: "B 3344 RS",
    asal: "Surabaya",
    tujuan: "Nganjuk",
    waypoints: [
      [-7.3000, 112.7300, "Terminal Surabaya", 0],
      [-7.5100, 112.4600, "Krian", 45],
      [-7.5500, 112.4300, "Mojokerto", 65],
      [-7.6100, 112.2800, "Jombang", 100],
      [-7.6100, 112.1900, "Tembelang", 120],
      [-7.6000, 112.0100, "Nganjuk", 150],
    ],
  },
];
