// Seed data demo Circle T ke Supabase, SEMUA terikat ke truk aktif
// (trucks.status = 'aktif') dan pengemudi yang ada:
//   positions   telemetri 90 hari ke belakang s.d. hari ini (trip_id null)
//   pengaduan   ±1/hari selama 90 hari, >= 10 pada 7 hari terakhir,
//               ~70% diputuskan agent (evidence.seed = true)
//   agent_runs  satu run per pengaduan seed (notes 'seed-demo')
//   schedules   jadwal truk aktif x pengemudi (notes 'seed-demo')
//
// Idempoten: baris seed lama (penanda di atas) dihapus dulu, lalu ditulis
// ulang dengan generator deterministik (scripts/seed-data.js).
//
// Pakai:
//   node scripts/seed.js            -> tampilkan ringkasan, tanpa menulis
//   node scripts/seed.js --apply    -> hapus seed lama & tulis seed baru
//
// Prasyarat: migrasi supabase/*.sql sudah dijalankan (schedules.sql,
// agent-runs.sql, pengaduan-keputusan.sql, pengaduan-alasan-catatan.sql,
// pengaduan-analisis.sql, pengaduan-diputuskan-oleh.sql).
// Simulator VPS: pastikan versi terbaru (hanya menghapus posisi miliknya,
// trip_id not null) supaya telemetri seed tidak ikut terhapus.
const { klien } = require("./lib-supabase-rest");
const { generateSeed } = require("./seed-data");

async function tulisBertahap(db, tabel, rows, ukuran, label) {
  let ok = 0;
  let gagal = 0;
  for (let i = 0; i < rows.length; i += ukuran) {
    const potongan = rows.slice(i, i + ukuran);
    try {
      await db.post(tabel, potongan);
      ok += potongan.length;
    } catch (e) {
      // Batch gagal (mis. jadwal bentrok constraint): coba satu per satu.
      for (const row of potongan) {
        try {
          await db.post(tabel, [row]);
          ok += 1;
        } catch (e2) {
          gagal += 1;
          if (gagal <= 3) console.warn(`  lewati 1 baris ${label}: ${e2.message.split("\n")[0].slice(0, 160)}`);
        }
      }
    }
  }
  console.log(`tulis ${label}: ${ok} baris${gagal ? `, ${gagal} dilewati` : ""}`);
}

async function main() {
  const db = klien();
  const apply = process.argv.includes("--apply");

  const trucks = await db.get("trucks", "?select=id,plat,tipe,nama&status=eq.aktif&order=nama.asc&limit=200");
  const drivers = await db.get("drivers", "?select=id,nama&order=nama.asc&limit=500");
  if (!trucks.length) throw new Error("Tidak ada truk aktif (trucks.status = 'aktif'). Seed dibatalkan.");

  const seed = generateSeed({ trucks, drivers, now: Date.now() });
  const agent = seed.pengaduan.filter((p) => p.decided_by === "agent").length;
  const tujuh = seed.pengaduan.filter((p) => p.tanggal >= new Date(Date.now() - 6 * 864e5).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })).length;
  const ngebut = seed.positions.filter((p) => p.kecepatan > 80).length;

  console.log(`Hari ini (WIB): ${seed.hariIni}`);
  console.log(`Truk aktif: ${trucks.length} (${trucks.map((t) => t.plat).join(", ")})`);
  console.log(`Pengemudi: ${drivers.length}`);
  console.log("\nAkan ditulis:");
  console.log(`  positions  ${seed.positions.length} (insiden > 80 km/jam: ${ngebut})`);
  console.log(`  pengaduan  ${seed.pengaduan.length} (diputuskan agent ${agent} = ${Math.round((agent / seed.pengaduan.length) * 100)}%, 7 hari terakhir ${tujuh})`);
  console.log(`  agent_runs ${seed.agentRuns.length}`);
  console.log(`  schedules  ${seed.schedules.length}`);

  const lamaRuns = await db.hitung("agent_runs", "?notes=eq.seed-demo").catch(() => null);
  const lamaAduan = await db.hitung("pengaduan", "?evidence->>seed=eq.true").catch(() => null);
  const lamaPos = await db.hitung("positions", "?trip_id=is.null");
  const lamaJadwal = await db.hitung("schedules", "?notes=eq.seed-demo").catch(() => null);
  console.log("\nSeed lama yang akan dihapus dulu:");
  console.log(`  agent_runs ${lamaRuns ?? "tabel/kolom belum ada"} | pengaduan ${lamaAduan ?? "kolom evidence belum ada"} | positions ${lamaPos} | schedules ${lamaJadwal ?? "tabel belum ada"}`);

  if (!apply) {
    console.log("\nDry run. Jalankan lagi dengan --apply untuk menulis.");
    return;
  }

  console.log("\nMenghapus seed lama...");
  if (lamaRuns) console.log(`hapus agent_runs: ${await db.del("agent_runs", "?notes=eq.seed-demo")}`);
  if (lamaAduan) console.log(`hapus pengaduan: ${await db.del("pengaduan", "?evidence->>seed=eq.true")}`);
  if (lamaPos) console.log(`hapus positions: ${await db.del("positions", "?trip_id=is.null")}`);
  if (lamaJadwal) console.log(`hapus schedules: ${await db.del("schedules", "?notes=eq.seed-demo")}`);

  console.log("\nMenulis seed baru...");
  await tulisBertahap(db, "schedules", seed.schedules, 200, "schedules");
  await tulisBertahap(db, "positions", seed.positions, 1000, "positions");
  await tulisBertahap(db, "pengaduan", seed.pengaduan, 200, "pengaduan");
  await tulisBertahap(db, "agent_runs", seed.agentRuns, 200, "agent_runs");
  console.log("\nSelesai. Cek dengan: node scripts/inspect-data.js");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
