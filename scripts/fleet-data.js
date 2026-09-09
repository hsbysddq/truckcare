// SATU-SATUNYA sumber identitas armada Circle T: 15 truk dan 15 pengemudi
// dengan id UUID TETAP (ditulis manual, bukan digenerate). Dipakai oleh:
//   - scripts/seed.js        : upsert trucks/drivers berdasarkan id
//   - scripts/seed-data.js   : semua data turunan terikat ke id di sini
//   - scripts/verify-fleet.js: pemeriksaan konsistensi
//   - lib/data.js            : data contoh (tanpa Supabase) memakai identitas
//                              yang sama, sehingga plat dan nama pengemudi
//                              identik di setiap tampilan
// Jangan menulis daftar truk/pengemudi lain di mana pun. Tidak ada
// Math.random() yang menentukan truk mana yang aktif atau siapa pengemudinya.
//
// Kapasitas tangki mengikuti lib/truck-types.js: cdd 100 L, fuso 200 L,
// trailer 400 L. Kolom tabel: trucks.status ('aktif') mewakili is_active.

export const FLEET_TRUCKS = [
  { id: "a1000000-0000-4000-8000-000000000001", plat: "L 8821 AB",  nama: "Truk 1",  tipe: "fuso",    tank_liters: 200, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000002", plat: "W 9042 CD",  nama: "Truk 2",  tipe: "fuso",    tank_liters: 200, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000003", plat: "W 1187 EF",  nama: "Truk 3",  tipe: "trailer", tank_liters: 400, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000004", plat: "L 5560 GH",  nama: "Truk 4",  tipe: "trailer", tank_liters: 400, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000005", plat: "W 3324 IJ",  nama: "Truk 5",  tipe: "fuso",    tank_liters: 200, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000006", plat: "N 7743 KL",  nama: "Truk 6",  tipe: "cdd",     tank_liters: 100, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000007", plat: "N 2298 MN",  nama: "Truk 7",  tipe: "cdd",     tank_liters: 100, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000008", plat: "W 6612 OP",  nama: "Truk 8",  tipe: "cdd",     tank_liters: 100, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000009", plat: "AG 4405 QR", nama: "Truk 9",  tipe: "fuso",    tank_liters: 200, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000010", plat: "L 8890 ST",  nama: "Truk 10", tipe: "fuso",    tank_liters: 200, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000011", plat: "L 9911 MU",  nama: "Truk 11", tipe: "cdd",     tank_liters: 100, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000012", plat: "W 1234 NV",  nama: "Truk 12", tipe: "fuso",    tank_liters: 200, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000013", plat: "N 7788 OP",  nama: "Truk 13", tipe: "cdd",     tank_liters: 100, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000014", plat: "AG 5566 PQ", nama: "Truk 14", tipe: "cdd",     tank_liters: 100, is_active: true },
  { id: "a1000000-0000-4000-8000-000000000015", plat: "B 3344 RS",  nama: "Truk 15", tipe: "cdd",     tank_liters: 100, is_active: true },
];

// Satu pengemudi tetap per truk (truck_id merujuk FLEET_TRUCKS di atas).
export const FLEET_DRIVERS = [
  { id: "d1000000-0000-4000-8000-000000000001", nama: "Ahmad Fauzi",        no_hp: "0812 3456 7001", truck_id: "a1000000-0000-4000-8000-000000000001" },
  { id: "d1000000-0000-4000-8000-000000000002", nama: "Bagus Prasetyo",     no_hp: "0813 4567 7002", truck_id: "a1000000-0000-4000-8000-000000000002" },
  { id: "d1000000-0000-4000-8000-000000000003", nama: "Chandra Wijaya",     no_hp: "0812 5678 7003", truck_id: "a1000000-0000-4000-8000-000000000003" },
  { id: "d1000000-0000-4000-8000-000000000004", nama: "Deni Setiawan",      no_hp: "0857 6789 7004", truck_id: "a1000000-0000-4000-8000-000000000004" },
  { id: "d1000000-0000-4000-8000-000000000005", nama: "Eko Saputra",        no_hp: "0821 7890 7005", truck_id: "a1000000-0000-4000-8000-000000000005" },
  { id: "d1000000-0000-4000-8000-000000000006", nama: "Fajar Ramadhan",     no_hp: "0811 8901 7006", truck_id: "a1000000-0000-4000-8000-000000000006" },
  { id: "d1000000-0000-4000-8000-000000000007", nama: "Galih Nugroho",      no_hp: "0819 9012 7007", truck_id: "a1000000-0000-4000-8000-000000000007" },
  { id: "d1000000-0000-4000-8000-000000000008", nama: "Hendra Gunawan",     no_hp: "0856 0123 7008", truck_id: "a1000000-0000-4000-8000-000000000008" },
  { id: "d1000000-0000-4000-8000-000000000009", nama: "Irfan Maulana",      no_hp: "0823 1234 7009", truck_id: "a1000000-0000-4000-8000-000000000009" },
  { id: "d1000000-0000-4000-8000-000000000010", nama: "Joko Santoso",       no_hp: "0812 2345 7010", truck_id: "a1000000-0000-4000-8000-000000000010" },
  { id: "d1000000-0000-4000-8000-000000000011", nama: "Kadek Wirawan",      no_hp: "0812 3456 7011", truck_id: "a1000000-0000-4000-8000-000000000011" },
  { id: "d1000000-0000-4000-8000-000000000012", nama: "Lukman Hakim",       no_hp: "0813 4567 7012", truck_id: "a1000000-0000-4000-8000-000000000012" },
  { id: "d1000000-0000-4000-8000-000000000013", nama: "Made Subrata",       no_hp: "0812 5678 7013", truck_id: "a1000000-0000-4000-8000-000000000013" },
  { id: "d1000000-0000-4000-8000-000000000014", nama: "Nanang Firmansyah",  no_hp: "0857 6789 7014", truck_id: "a1000000-0000-4000-8000-000000000014" },
  { id: "d1000000-0000-4000-8000-000000000015", nama: "Oktavianus Bima",    no_hp: "0821 7890 7015", truck_id: "a1000000-0000-4000-8000-000000000015" },
];

export const FLEET_TRUCK_BY_ID = Object.fromEntries(FLEET_TRUCKS.map((t) => [t.id, t]));
export const FLEET_DRIVER_BY_TRUCK_ID = Object.fromEntries(FLEET_DRIVERS.map((d) => [d.truck_id, d]));

// Baris tabel trucks / drivers untuk upsert (kolom sesuai supabase/*.sql).
export const fleetTruckRows = () =>
  FLEET_TRUCKS.map((t) => ({ id: t.id, plat: t.plat, nama: t.nama, tipe: t.tipe, status: t.is_active ? "aktif" : "nonaktif" }));
export const fleetDriverRows = ({ withTruckId = true } = {}) =>
  FLEET_DRIVERS.map((d) => ({ id: d.id, nama: d.nama, no_hp: d.no_hp, ...(withTruckId ? { truck_id: d.truck_id } : {}) }));
