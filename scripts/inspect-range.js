// READ-ONLY: rentang data historis yang benar-benar ada di database
// (padanan supabase/cek-rentang-data.sql lewat REST).
//   - min/max/count positions (telemetri), dipisah seed vs simulator
//   - baris positions per hari (WIB) 90 hari terakhir + yang > 80 km/jam
//   - min/max/count pengaduan
// Pakai: node scripts/inspect-range.js
import { klien } from "./lib-supabase-rest.js";

const tanggalWIB = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

async function main() {
  const db = klien();
  const [awal, akhir] = await Promise.all([db.rentang("positions", "ts"), db.rentang("positions", "ts")]);
  const total = await db.hitung("positions");
  const seedRows = await db.hitung("positions", "?trip_id=is.null");
  console.log("== POSITIONS (telemetri) ==");
  console.log(`select min(ts), max(ts), count(*) from positions;`);
  console.log(`  -> ${awal.min ?? "-"} | ${akhir.max ?? "-"} | ${total}  (seed/trip_id null: ${seedRows}, simulator: ${total - seedRows})`);

  console.log("\nselect date(ts WIB), count(*) from positions where ts >= now()-90d group by 1;");
  const hariIni = tanggalWIB(new Date().toISOString());
  let adaBaris = false;
  for (let off = 89; off >= 0; off -= 1) {
    const tgl = new Date(new Date(`${hariIni}T00:00:00+07:00`).getTime() - off * 864e5);
    const mulai = tgl.toISOString();
    const selesai = new Date(tgl.getTime() + 864e5).toISOString();
    const n = await db.hitung("positions", `?ts=gte.${encodeURIComponent(mulai)}&ts=lt.${encodeURIComponent(selesai)}`);
    if (!n) continue;
    adaBaris = true;
    const ngebut = await db.hitung("positions", `?ts=gte.${encodeURIComponent(mulai)}&ts=lt.${encodeURIComponent(selesai)}&kecepatan=gt.80`);
    console.log(`  ${tanggalWIB(mulai)}  ${String(n).padStart(7)} baris  (> 80 km/jam: ${ngebut})`);
  }
  if (!adaBaris) console.log("  (tidak ada baris dalam 90 hari terakhir)");

  const aduan = await db.get("pengaduan", "?select=created_at,tanggal,evidence&deleted_at=is.null&order=created_at.asc&limit=10000");
  console.log("\n== PENGADUAN ==");
  console.log(`select min(created_at), max(created_at), count(*) from pengaduan;`);
  console.log(`  -> ${aduan[0]?.created_at ?? "-"} | ${aduan.at(-1)?.created_at ?? "-"} | ${aduan.length}  (seed: ${aduan.filter((a) => a.evidence?.seed === true).length})`);
  const tgl = aduan.map((a) => a.tanggal).sort();
  console.log(`  tanggal kejadian: ${tgl[0] ?? "-"} s.d. ${tgl.at(-1) ?? "-"}`);

  console.log("\nKESIMPULAN:");
  if (!seedRows) console.log("  positions TIDAK punya baris seed (trip_id null): seed historis belum pernah masuk atau sudah dihapus. Jalankan: node scripts/seed.js --apply, dan deploy ulang simulator (versi lama menghapus semua positions > 3 hari).");
  else console.log(`  positions punya ${seedRows} baris seed; bila grafik tetap kosong, buka /api/analytics?range=30&debug=1.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
