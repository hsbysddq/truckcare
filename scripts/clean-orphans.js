// Bersihkan data turunan yang merujuk truk NONAKTIF (trucks.status <> 'aktif'):
// positions, trips, events, schedules, dan agent_runs milik pengaduan truk
// nonaktif. Pengaduan tidak dihapus permanen (bukti laporan warga) melainkan
// di-soft-delete (deleted_at + delete_reason).
//
// Pakai:
//   node scripts/clean-orphans.js           -> dry run: hanya menghitung
//   node scripts/clean-orphans.js --apply   -> benar-benar menghapus
import { klien } from "./lib-supabase-rest.js";

function kunciPlat(p) {
  return String(p ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function main() {
  const db = klien();
  const apply = process.argv.includes("--apply");
  const trucks = await db.get("trucks", "?select=id,plat,status&limit=1000");
  const nonaktif = trucks.filter((t) => t.status !== "aktif");
  if (!nonaktif.length) {
    console.log("Tidak ada truk nonaktif; tidak ada data yatim.");
    return;
  }
  const ids = nonaktif.map((t) => t.id);
  const platNon = new Set(nonaktif.map((t) => kunciPlat(t.plat)));
  console.log(`Truk nonaktif: ${nonaktif.map((t) => t.plat).join(", ")}`);

  const target = [
    ["positions", "truk_id"],
    ["trips", "truk_id"],
    ["events", "truk_id"],
    ["schedules", "truck_id"],
  ];
  const jumlah = {};
  for (const [tabel, kolom] of target) {
    try {
      jumlah[tabel] = await db.hitung(tabel, `?${kolom}=in.${db.inList(ids)}`);
    } catch {
      jumlah[tabel] = null; // tabel belum ada
    }
  }
  const aduan = await db.get("pengaduan", "?select=id,plat,deleted_at&limit=10000");
  const aduanNon = aduan.filter((r) => platNon.has(kunciPlat(r.plat)) && !r.deleted_at);
  let runsNon = 0;
  try {
    runsNon = aduanNon.length ? await db.hitung("agent_runs", `?complaint_id=in.${db.inList(aduanNon.map((r) => r.id))}`) : 0;
  } catch {
    runsNon = null;
  }

  console.log("\nData yatim (merujuk truk nonaktif):");
  for (const [tabel] of target) console.log(`  ${tabel.padEnd(10)} ${jumlah[tabel] ?? "tabel tidak ada"}`);
  console.log(`  pengaduan  ${aduanNon.length} (akan di-soft-delete, bukan dihapus)`);
  console.log(`  agent_runs ${runsNon ?? "tabel tidak ada"}`);

  if (!apply) {
    console.log("\nDry run. Jalankan lagi dengan --apply untuk menghapus.");
    return;
  }

  for (const [tabel, kolom] of target) {
    if (!jumlah[tabel]) continue;
    const n = await db.del(tabel, `?${kolom}=in.${db.inList(ids)}`);
    console.log(`hapus ${tabel}: ${n}`);
  }
  if (runsNon && aduanNon.length) {
    const n = await db.del("agent_runs", `?complaint_id=in.${db.inList(aduanNon.map((r) => r.id))}`);
    console.log(`hapus agent_runs: ${n}`);
  }
  for (const r of aduanNon) {
    await db.patch("pengaduan", `?id=eq.${r.id}`, {
      deleted_at: new Date().toISOString(),
      delete_reason: "Data yatim: plat milik truk nonaktif (scripts/clean-orphans.js)",
    });
  }
  console.log(`soft-delete pengaduan: ${aduanNon.length}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
