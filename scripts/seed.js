// Seed Circle T ke Supabase. Aman diulang: identitas armada TIDAK berubah.
//
// 1. IDENTITAS (scripts/fleet-data.js): 15 truk + 15 pengemudi di-UPSERT
//    berdasarkan id tetap. Plat nomor dan nama pengemudi selalu sama.
//    - Baris lama dengan plat/nama sama tetapi id lain di-"rekey": semua FK
//      (positions, trips, events, schedules, pengaduan, drivers.truck_id)
//      dipindah ke id tetap, baris lama dihapus. Riwayat tidak hilang.
//    - Truk di luar daftar -> status 'nonaktif' (tidak dihapus, riwayat aman).
//    - Pengemudi di luar daftar -> dihapus (schedules.driver_id jadi null).
// 2. DATA TURUNAN diregenerasi deterministik (scripts/seed-data.js +
//    lib/seeded-random.js, benih tetap): positions (trip_id null), pengaduan
//    (evidence.seed = true), agent_runs & schedules (notes 'seed-demo').
//    Seed lama dengan penanda itu dihapus dulu.
//
// Pakai:
//   node scripts/seed.js            -> ringkasan & rencana, tanpa menulis
//   node scripts/seed.js --apply    -> tulis
//
// Prasyarat migrasi supabase/*.sql: schedules.sql, agent-runs.sql,
// pengaduan-keputusan.sql, pengaduan-alasan-catatan.sql, pengaduan-analisis.sql,
// pengaduan-diputuskan-oleh.sql, trucks-jenis.sql, drivers-truck-id.sql.
import { klien } from "./lib-supabase-rest.js";
import { generateSeed } from "./seed-data.js";
import { FLEET_TRUCKS, FLEET_DRIVERS, fleetTruckRows, fleetDriverRows } from "./fleet-data.js";
import { periksaArmada, cetakLaporan } from "./verify-fleet.js";
import { BATAS_KECEPATAN_KPJ, melebihiBatas } from "../lib/speed-limit.js";

const kunci = (p) => String(p ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const namaKunci = (n) => String(n ?? "").trim().toLowerCase();

async function upsert(db, tabel, rows) {
  const res = await fetch(`${db.URL}/rest/v1/${tabel}?on_conflict=id`, {
    method: "POST",
    headers: { ...db.headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`UPSERT ${tabel} -> ${res.status} ${await res.text()}`);
}

// Pindahkan semua rujukan FK dari id lama ke id tetap, lalu hapus baris lama.
async function rekeyTruk(db, lama, tetap, apply) {
  console.log(`  rekey truk ${lama.plat}: ${lama.id} -> ${tetap.id}`);
  if (!apply) return;
  // Baris tetap dibuat dulu dengan plat sementara (plat unik).
  await db.post("trucks", [{ id: tetap.id, plat: `TMP-${tetap.id.slice(-6)}`, nama: tetap.nama, tipe: tetap.tipe, status: "aktif" }]);
  for (const [tabel, kolom] of [["positions", "truk_id"], ["trips", "truk_id"], ["events", "truk_id"], ["schedules", "truck_id"], ["pengaduan", "truck_id"], ["drivers", "truck_id"]]) {
    await db.patch(tabel, `?${kolom}=eq.${lama.id}`, { [kolom]: tetap.id }).catch((e) => {
      if (!/column|does not exist|relation/i.test(e.message)) throw e;
    });
  }
  await db.del("trucks", `?id=eq.${lama.id}`);
  await db.patch("trucks", `?id=eq.${tetap.id}`, { plat: tetap.plat });
}

async function rekeyPengemudi(db, lama, tetap, apply) {
  console.log(`  rekey pengemudi ${lama.nama}: ${lama.id} -> ${tetap.id}`);
  if (!apply) return;
  await db.post("drivers", [{ id: tetap.id, nama: tetap.nama, no_hp: tetap.no_hp }]);
  for (const [tabel, kolom] of [["trips", "driver_id"], ["schedules", "driver_id"], ["pengaduan", "driver_id"]]) {
    await db.patch(tabel, `?${kolom}=eq.${lama.id}`, { [kolom]: tetap.id }).catch((e) => {
      if (!/column|does not exist|relation/i.test(e.message)) throw e;
    });
  }
  await db.del("drivers", `?id=eq.${lama.id}`);
}

async function tulisBertahap(db, tabel, rows, ukuran, label) {
  let ok = 0;
  let gagal = 0;
  for (let i = 0; i < rows.length; i += ukuran) {
    const potongan = rows.slice(i, i + ukuran);
    try {
      await db.post(tabel, potongan);
      ok += potongan.length;
    } catch {
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
  console.log(apply ? "MODE: --apply (menulis ke database)" : "MODE: dry run (tidak menulis)");

  // ---------- 1. Identitas armada ----------
  const trukAda = await db.get("trucks", "?select=id,plat,nama,tipe,status&limit=1000");
  const drvAda = await db.get("drivers", "?select=id,nama,no_hp&limit=1000");
  const trukTetapId = new Set(FLEET_TRUCKS.map((t) => t.id));
  const drvTetapId = new Set(FLEET_DRIVERS.map((d) => d.id));

  console.log("\n== Identitas armada (scripts/fleet-data.js) ==");
  for (const t of FLEET_TRUCKS) {
    const byId = trukAda.find((x) => x.id === t.id);
    const byPlat = trukAda.find((x) => kunci(x.plat) === kunci(t.plat) && x.id !== t.id);
    if (byPlat) await rekeyTruk(db, byPlat, t, apply);
    else if (!byId) console.log(`  truk baru ${t.plat} (${t.id})`);
  }
  for (const d of FLEET_DRIVERS) {
    const byId = drvAda.find((x) => x.id === d.id);
    const byNama = drvAda.find((x) => namaKunci(x.nama) === namaKunci(d.nama) && x.id !== d.id);
    if (byNama) await rekeyPengemudi(db, byNama, d, apply);
    else if (!byId) console.log(`  pengemudi baru ${d.nama} (${d.id})`);
  }
  const trukLain = trukAda.filter((x) => !trukTetapId.has(x.id) && !FLEET_TRUCKS.some((t) => kunci(t.plat) === kunci(x.plat)));
  const drvLain = drvAda.filter((x) => !drvTetapId.has(x.id) && !FLEET_DRIVERS.some((d) => namaKunci(d.nama) === namaKunci(x.nama)));
  if (trukLain.length) console.log(`  truk di luar daftar -> nonaktif: ${trukLain.map((x) => x.plat).join(", ")}`);
  if (drvLain.length) console.log(`  pengemudi di luar daftar -> dihapus: ${drvLain.map((x) => x.nama).join(", ")}`);

  if (apply) {
    await upsert(db, "trucks", fleetTruckRows());
    try {
      await upsert(db, "drivers", fleetDriverRows({ withTruckId: true }));
    } catch (e) {
      if (!/truck_id/.test(e.message)) throw e;
      console.warn("  kolom drivers.truck_id belum ada (jalankan supabase/drivers-truck-id.sql); upsert tanpa truck_id.");
      await upsert(db, "drivers", fleetDriverRows({ withTruckId: false }));
    }
    for (const x of trukLain) await db.patch("trucks", `?id=eq.${x.id}`, { status: "nonaktif" });
    for (const x of drvLain) await db.del("drivers", `?id=eq.${x.id}`);
    console.log(`upsert trucks ${FLEET_TRUCKS.length}, drivers ${FLEET_DRIVERS.length}; nonaktifkan ${trukLain.length} truk; hapus ${drvLain.length} pengemudi`);
  }

  // ---------- 2. Data turunan ----------
  const seed = generateSeed({ trucks: FLEET_TRUCKS, drivers: FLEET_DRIVERS, now: Date.now() });
  const agent = seed.pengaduan.filter((p) => p.decided_by === "agent").length;
  const titikNgebut = seed.positions.filter((p) => melebihiBatas(p.kecepatan)).length;
  const insiden7 = seed.insiden.filter((e) => Date.now() - new Date(e.mulai).getTime() <= 7 * 864e5).length;
  const trukInsiden = Object.entries(seed.insiden.reduce((m, e) => ((m[e.plat] = (m[e.plat] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
  console.log(`\n== Data turunan (hari ini WIB ${seed.hariIni}) ==`);
  console.log(`  positions  ${seed.positions.length} (titik > ${BATAS_KECEPATAN_KPJ} km/jam: ${titikNgebut})`);
  console.log(`  insiden    ${seed.insiden.length} episode ngebut (${insiden7} dalam 7 hari terakhir); per truk: ${trukInsiden.map(([p, n]) => `${p} ${n}`).join(", ")}`);
  console.log(`  pengaduan valid terkait insiden: ${seed.pengaduan.filter((p) => p.status === "valid" && p.evidence?.incidentStart).length} dari ${seed.pengaduan.filter((p) => p.status === "valid").length}`);
  console.log(`  pengaduan  ${seed.pengaduan.length} (diputuskan agent ${Math.round((agent / seed.pengaduan.length) * 100)}%)`);
  console.log(`  agent_runs ${seed.agentRuns.length}`);
  console.log(`  schedules  ${seed.schedules.length}`);

  const lamaRuns = await db.hitung("agent_runs", "?notes=eq.seed-demo").catch(() => null);
  const lamaAduan = await db.hitung("pengaduan", "?evidence->>seed=eq.true").catch(() => null);
  const lamaPos = await db.hitung("positions", "?trip_id=is.null");
  const lamaJadwal = await db.hitung("schedules", "?notes=eq.seed-demo").catch(() => null);
  console.log(`  seed lama dihapus dulu: agent_runs ${lamaRuns ?? "-"} | pengaduan ${lamaAduan ?? "-"} | positions ${lamaPos} | schedules ${lamaJadwal ?? "-"}`);

  if (!apply) {
    console.log("\nDry run selesai. Jalankan lagi dengan --apply untuk menulis.");
    return;
  }

  if (lamaRuns) await db.del("agent_runs", "?notes=eq.seed-demo");
  if (lamaAduan) await db.del("pengaduan", "?evidence->>seed=eq.true");
  if (lamaPos) await db.del("positions", "?trip_id=is.null");
  if (lamaJadwal) await db.del("schedules", "?notes=eq.seed-demo");

  console.log("\nMenulis data turunan...");
  await tulisBertahap(db, "schedules", seed.schedules, 200, "schedules");
  await tulisBertahap(db, "positions", seed.positions, 1000, "positions");
  await tulisBertahap(db, "pengaduan", seed.pengaduan, 200, "pengaduan");
  await tulisBertahap(db, "agent_runs", seed.agentRuns, 200, "agent_runs");

  // ---------- 3. Verifikasi ----------
  console.log("\n== Verifikasi konsistensi ==");
  cetakLaporan(await periksaArmada(db));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
