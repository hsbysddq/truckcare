// Inti simulasi: hitung posisi truk di sepanjang waypoint berdasarkan "menit perjalanan".
// Deterministik (seed tetap) supaya skenario demo bisa diulang persis.

// Interpolasi linier antara dua waypoint [lat, lon] pada progres p (0..1).
export function interpolasi(a, b, p) {
  return {
    lat: a[0] + (b[0] - a[0]) * p,
    lon: a[1] + (b[1] - a[1]) * p,
  };
}

// Cari segmen waypoint aktif untuk menit_perjalanan tertentu.
// waypoints: [{lat, lon, label, tiba_menit}]
// Kembalikan {posisi, segmen, progres} — atau null kalau sudah di akhir.
export function posisiDiMenit(waypoints, menit) {
  const wp = waypoints.map((w) => [w.lat, w.lon, w.tiba_menit]);
  if (menit >= wp[wp.length - 1][2]) {
    // Sudah tiba di tujuan
    const akhir = wp[wp.length - 1];
    return { posisi: { lat: akhir[0], lon: akhir[1] }, segmen: wp.length - 1, progres: 1 };
  }
  for (let i = 0; i < wp.length - 1; i++) {
    const t0 = wp[i][2];
    const t1 = wp[i + 1][2];
    if (menit >= t0 && menit < t1) {
      const p = (menit - t0) / (t1 - t0);
      return {
        posisi: interpolasi([wp[i][0], wp[i][1]], [wp[i + 1][0], wp[i + 1][1]], p),
        segmen: i,
        progres: p,
      };
    }
  }
  return null;
}

// Progress keseluruhan 0..1 untuk sebuah trip.
export function progressTrip(waypoints, menit) {
  const akhir = waypoints[waypoints.length - 1].tiba_menit;
  return Math.min(menit / akhir, 1);
}

// Status truk: "jalan" atau "berhenti" — deterministik dari skenario.
// Kalau ada waypoint berlabel "Rest Area (stop ...)" dan menit ada di rentang berhenti, = berhenti.
export function statusTruk(waypoints, menit, kecepatan) {
  if (kecepatan < 1) return "berhenti";
  // cek waypoint rest area
  for (const w of waypoints) {
    if (w.label && w.label.toLowerCase().includes("stop")) {
      const tiba = w.tiba_menit;
      // asumsikan berhenti 40 menit setelah tiba di waypoint itu
      if (menit >= tiba && menit < tiba + 40) return "berhenti";
    }
  }
  return "jalan";
}
