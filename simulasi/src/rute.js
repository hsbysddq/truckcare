// Rute tetap (waypoint) untuk 10 truk — simulasi distribusi.
// Format: [lat, lon, label, tiba_menit] — tiba_menit = menit sejak mulai perjalanan.
// Koordinat contoh di sekitar Jawa (Denpasar → berbagai tujuan) — ganti sesuai kebutuhan demo.

export const RUTE = [
  // Truk 1 — Denpasar → Singaraja
  {
    truk: "DK 1234 AB",
    asal: "Denpasar",
    tujuan: "Singaraja",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.5300, 115.1900, "Mengwi", 25],
      [-8.4200, 115.1400, "Pupuan", 70],
      [-8.2100, 115.0800, "Seririt", 110],
      [-8.1200, 115.0900, "Singaraja", 140],
    ],
  },
  // Truk 2 — Denpasar → Gilimanuk
  {
    truk: "DK 5678 CD",
    asal: "Denpasar",
    tujuan: "Gilimanuk",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.5900, 115.0900, "Tabanan", 30],
      [-8.4400, 114.9700, "Antosari", 70],
      [-8.2700, 114.7800, "Negara", 120],
      [-8.1600, 114.4400, "Gilimanuk", 160],
    ],
  },
  // Truk 3 — Denpasar → Klungkung
  {
    truk: "DK 9012 EF",
    asal: "Denpasar",
    tujuan: "Klungkung",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.6300, 115.2700, "Gianyar", 35],
      [-8.6200, 115.3600, "Bangli", 60],
      [-8.5400, 115.4000, "Semarapura", 90],
    ],
  },
  // Truk 4 — Denpasar → Ubud (berhenti lama di rest area — skenario)
  {
    truk: "DK 3456 GH",
    asal: "Denpasar",
    tujuan: "Ubud",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.6200, 115.2400, "Rest Area (stop 40 mnt)", 20],
      [-8.5100, 115.2600, "Ubud", 55],
    ],
  },
  // Truk 5 — Denpasar → Nusa Dua (jarak pendek, normal)
  {
    truk: "DK 7890 IJ",
    asal: "Denpasar",
    tujuan: "Nusa Dua",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.7200, 115.2000, "Kuta", 20],
      [-8.8000, 115.2200, "Nusa Dua", 40],
    ],
  },
  // Truk 6 — Denpasar → Karangasem (melenceng dari rute — skenario)
  {
    truk: "DK 1122 KL",
    asal: "Denpasar",
    tujuan: "Karangasem",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.6300, 115.2700, "Gianyar", 30],
      [-8.6100, 115.3600, "Bangli", 55],
      [-8.4500, 115.6100, "Karangasem", 110],
    ],
  },
  // Truk 7 — Denpasar → Bedugul (dataran tinggi)
  {
    truk: "DK 3344 MN",
    asal: "Denpasar",
    tujuan: "Bedugul",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.5300, 115.1900, "Mengwi", 25],
      [-8.2800, 115.1600, "Bedugul", 75],
    ],
  },
  // Truk 8 — Denpasar → Canggu
  {
    truk: "DK 5566 OP",
    asal: "Denpasar",
    tujuan: "Canggu",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.6800, 115.1600, "Kuta Utara", 20],
      [-8.6400, 115.1400, "Canggu", 30],
    ],
  },
  // Truk 9 — Denpasar → Sanur
  {
    truk: "DK 7788 QR",
    asal: "Denpasar",
    tujuan: "Sanur",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.6800, 115.2500, "Sanur", 25],
    ],
  },
  // Truk 10 — Denpasar → Jimbaran
  {
    truk: "DK 9900 ST",
    asal: "Denpasar",
    tujuan: "Jimbaran",
    waypoints: [
      [-8.6500, 115.2166, "Denpasar", 0],
      [-8.7600, 115.1800, "Jimbaran", 35],
    ],
  },
];
