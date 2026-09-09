// Tiga jenis armada Circle T. Satu-satunya sumber label, kapasitas tangki,
// dan konsumsi solar harian per jenis; dipakai data contoh, shape Supabase
// (kolom trucks.tipe), kartu Armada, filter jenis, dan generator solar.
export const TRUCK_TYPES = {
  cdd: {
    key: "cdd",
    label: "Colt Diesel Double (CDD)",
    short: "CDD",
    tankLiters: 100,
    // Liter per hari operasi (rata-rata); CDD paling hemat, Trailer paling boros.
    dailyUseLiters: 12,
  },
  fuso: {
    key: "fuso",
    label: "Fuso",
    short: "Fuso",
    tankLiters: 200,
    dailyUseLiters: 25,
  },
  trailer: {
    key: "trailer",
    label: "Trailer",
    short: "Trailer",
    tankLiters: 400,
    dailyUseLiters: 50,
  },
};

export const TRUCK_TYPE_ORDER = ["cdd", "fuso", "trailer"];

export function truckTypeMeta(key) {
  return TRUCK_TYPES[key] ?? TRUCK_TYPES.fuso;
}

// Nilai kolom trucks.tipe di Supabase -> kunci jenis. Nilai lama
// ("distribusi") atau kosong: jatuhkan ke jenis yang stabil per plat supaya
// tampilan konsisten sampai migrasi supabase/trucks-jenis.sql dijalankan.
export function truckTypeFromTipe(tipe, plate = "") {
  const t = String(tipe ?? "").trim().toLowerCase();
  if (t.includes("trailer")) return "trailer";
  if (t.includes("fuso")) return "fuso";
  if (t.includes("cdd") || t.includes("colt")) return "cdd";
  let h = 0;
  for (const ch of String(plate)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TRUCK_TYPE_ORDER[h % 3];
}
