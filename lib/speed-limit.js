// SATU-SATUNYA tempat ambang pelanggaran kecepatan didefinisikan.
// Dipakai oleh: analitik live (lib/supabase.js), analisis pengaduan
// (lib/complaint-analysis.js), data contoh (lib/data.js), teks halaman
// (lib/content.js), generator seed (scripts/seed-data.js, scripts/seed.js).
//
// Fungsi SQL supabase/analitik-agregat.sql dan indeks parsial di
// supabase/indeks-performa.sql memakai angka yang sama (80) secara literal
// karena SQL tidak bisa mengimpor modul ini; bila angka ini berubah, ubah
// kedua file SQL itu juga.
//
// Perbandingan SELALU "lebih besar dari" (>), bukan ">=": 80 km/jam persis
// belum dianggap pelanggaran, di JS maupun di SQL.
export const BATAS_KECEPATAN_KPJ = 80;

export function melebihiBatas(kph) {
  return Number(kph) > BATAS_KECEPATAN_KPJ;
}

// Dua titik telemetri > batas yang berjarak lebih dari ini dianggap dua
// insiden (episode) berbeda; di dalamnya dianggap satu periode ngebut.
export const JEDA_INSIDEN_MENIT = 5;

// Kelompokkan titik telemetri (sudah > batas) menjadi episode per truk.
// points: [{truk_id, ts, lat, lon, kecepatan}] urutan bebas.
// Hasil: [{truk_id, mulai (ISO), selesai (ISO), titik, kecepatanMaks, lat, lon}]
export function kelompokkanInsiden(points) {
  const urut = [...points]
    .filter((p) => p?.ts && p.truk_id != null)
    .sort((a, b) => (a.truk_id < b.truk_id ? -1 : a.truk_id > b.truk_id ? 1 : new Date(a.ts) - new Date(b.ts)));
  const hasil = [];
  let cur = null;
  for (const p of urut) {
    const t = new Date(p.ts).getTime();
    if (!cur || cur.truk_id !== p.truk_id || t - cur._akhirMs > JEDA_INSIDEN_MENIT * 60e3) {
      cur = { truk_id: p.truk_id, mulai: p.ts, selesai: p.ts, titik: 0, kecepatanMaks: 0, lat: 0, lon: 0, _akhirMs: t };
      hasil.push(cur);
    }
    cur.selesai = p.ts;
    cur._akhirMs = t;
    cur.titik += 1;
    cur.kecepatanMaks = Math.max(cur.kecepatanMaks, Number(p.kecepatan) || 0);
    cur.lat += Number(p.lat) || 0;
    cur.lon += Number(p.lon) || 0;
  }
  return hasil.map(({ _akhirMs, ...e }) => ({ ...e, lat: e.lat / e.titik, lon: e.lon / e.titik }));
}
