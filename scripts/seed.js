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
import { generateSeed, periksaJaminan } from "./seed-data.js";
import { FLEET_TRUCKS, FLEET_DRIVERS, fleetTruckRows, fleetDriverRows } from "./fleet-data.js";
import { periksaArmada, cetakLaporan } from "./verify-fleet.js";
import { BATAS_KECEPATAN_KPJ, melebihiBatas, kelompokkanInsiden } from "../lib/speed-limit.js";

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

// Batch maksimal 500 baris (payload PostgREST). Yang dihitung adalah baris
// yang BENAR-BENAR dikembalikan server (Prefer: return=representation),
// bukan jumlah yang direncanakan. Batch gagal -> dicoba per baris, error
// pertama dicetak apa adanya.
const UKURAN_BATCH = 500;
async function tulisBertahap(db, tabel, rows, label) {
  let ok = 0;
  let gagal = 0;
  let errorPertama = null;
  for (let i = 0; i < rows.length; i += UKURAN_BATCH) {
    const potongan = rows.slice(i, i + UKURAN_BATCH);
    try {
      const hasil = await db.post(tabel, potongan);
      ok += Array.isArray(hasil) ? hasil.length : potongan.length;
    } catch (e) {
      errorPertama ??= e.message.split("\n")[0].slice(0, 300);
      for (const row of potongan) {
        try {
          const hasil = await db.post(tabel, [row]);
          ok += Array.isArray(hasil) ? hasil.length : 1;
        } catch (e2) {
          gagal += 1;
          errorPertama ??= e2.message.split("\n")[0].slice(0, 300);
        }
      }
    }
    process.stdout.write(`  ${label}: ${ok}/${rows.length} baris tersimpan\r`);
  }
  console.log(`  ${label}: ${ok}/${rows.length} baris tersimpan${gagal ? `, ${gagal} GAGAL` : ""}${errorPertama ? `\n    error pertama: ${errorPertama}` : ""}`);
  return { ok, gagal, errorPertama };
}

// Cek langsung ke database setelah menulis: hasil apa adanya, bukan rencana.
async function cekInsidenDb(db) {
  const truk = await db.get("trucks", "?select=id,plat,status&limit=1000");
  const trukDariId = Object.fromEntries(truk.map((t) => [t.id, t]));
  const total = await db.hitung("positions");
  const diAtas = await db.hitung("positions", `?kecepatan=gt.${BATAS_KECEPATAN_KPJ}`);
  const tertinggi = await db.get("positions", "?select=kecepatan,ts&order=kecepatan.desc&limit=1");
  const awal = await db.get("positions", "?select=ts&order=ts.asc&limit=1");
  const akhir = await db.get("positions", "?select=ts&order=ts.desc&limit=1");
  const rows = await db.get("positions", `?select=truk_id,ts,kecepatan&kecepatan=gt.${BATAS_KECEPATAN_KPJ}&order=ts.desc&limit=10000`);
  console.log("\n== Cek database (apa adanya) ==");
  console.log(`  select count(*) from positions where kecepatan > ${BATAS_KECEPATAN_KPJ};   -> ${diAtas}`);
  console.log(`  select max(kecepatan), min(ts), max(ts) from positions;  -> ${tertinggi[0]?.kecepatan ?? "-"} | ${awal[0]?.ts ?? "-"} | ${akhir[0]?.ts ?? "-"}  (total ${total} baris)`);
  const per = {};
  for (const p of rows) {
    const t = trukDariId[p.truk_id];
    const k = t ? `${t.plat} aktif=${t.status === "aktif"}` : `${p.truk_id} (TIDAK ADA di trucks)`;
    per[k] = (per[k] ?? 0) + 1;
  }
  console.log("  per truk (kecepatan > 80, join trucks):");
  for (const [k, n] of Object.entries(per).sort((a, b) => b[1] - a[1])) console.log(`    ${k.padEnd(34)} ${n}`);
  const aktifRows = rows.filter((p) => trukDariId[p.truk_id]?.status === "aktif");
  const ep = kelompokkanInsiden(aktifRows);
  const now = Date.now();
  const dalam = (h) => ep.filter((e) => now - new Date(e.mulai).getTime() <= h * 864e5).length;
  console.log(`  insiden (episode) truk aktif: 7 hari ${dalam(7)} | 30 hari ${dalam(30)} | 90 hari ${dalam(90)} | truk terlibat ${new Set(ep.map((e) => e.truk_id)).size}`);
  return { diAtas, insiden7: dalam(7), insiden30: dalam(30), insiden90: dalam(90) };
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

  // ---------- Jaminan insiden kecepatan (scripts/seed-data.js) ----------
  const jaminan = periksaJaminan(seed, Date.now());
  console.log("\n== Jaminan insiden kecepatan ==");
  for (const [nama, nilai, syarat, ok] of jaminan.cek) {
    console.log(`  ${ok ? "OK   " : "GAGAL"} ${nama}: ${nilai} (syarat ${syarat})`);
  }
  if (!jaminan.lulus) {
    console.error("\nJAMINAN TIDAK TERPENUHI: generator perlu diperbaiki; seed tidak ditulis.");
    process.exit(1);
  }

  const lamaRuns = await db.hitung("agent_runs", "?notes=eq.seed-demo").catch(() => null);
  const lamaAduan = await db.hitung("pengaduan", "?evidence->>seed=eq.true").catch(() => null);
  const lamaPos = await db.hitung("positions", "?trip_id=is.null");
  const lamaJadwal = await db.hitung("schedules", "?notes=eq.seed-demo").catch(() => null);
  console.log(`  seed lama dihapus dulu: agent_runs ${lamaRuns ?? "-"} | pengaduan ${lamaAduan ?? "-"} | positions ${lamaPos} | schedules ${lamaJadwal ?? "-"}`);

  if (!apply) {
    console.log("\nDry run selesai. Jalankan lagi dengan --apply untuk menulis.");
    return;
  }

  const tahap = async (nama, fn) => {
    console.log(`\n[tahap] ${nama}`);
    try {
      return await fn();
    } catch (e) {
      console.error(`  GAGAL pada tahap "${nama}": ${e.message}`);
      throw e;
    }
  };
  await tahap("hapus seed lama", async () => {
    if (lamaRuns) console.log(`  hapus agent_runs: ${await db.del("agent_runs", "?notes=eq.seed-demo")}`);
    if (lamaAduan) console.log(`  hapus pengaduan: ${await db.del("pengaduan", "?evidence->>seed=eq.true")}`);
    if (lamaPos) console.log(`  hapus positions: ${await db.del("positions", "?trip_id=is.null")}`);
    if (lamaJadwal) console.log(`  hapus schedules: ${await db.del("schedules", "?notes=eq.seed-demo")}`);
  });
  const hasilTulis = {};
  hasilTulis.schedules = await tahap("tulis schedules", () => tulisBertahap(db, "schedules", seed.schedules, "schedules"));
  hasilTulis.positions = await tahap("tulis positions (telemetri + insiden)", () => tulisBertahap(db, "positions", seed.positions, "positions"));
  hasilTulis.pengaduan = await tahap("tulis pengaduan", () => tulisBertahap(db, "pengaduan", seed.pengaduan, "pengaduan"));
  hasilTulis.agent_runs = await tahap("tulis agent_runs", () => tulisBertahap(db, "agent_runs", seed.agentRuns, "agent_runs"));
  const adaGagal = Object.values(hasilTulis).some((h) => h.gagal > 0);
  if (adaGagal) console.error("\nADA BARIS YANG GAGAL DITULIS (lihat error pertama di atas).");

  // ---------- 3. Verifikasi ----------
  console.log("\n== Verifikasi konsistensi ==");
  cetakLaporan(await periksaArmada(db));

  // ---------- Ringkasan akhir jaminan insiden ----------
  const h = jaminan.hasil;
  console.log("\n== Ringkasan insiden kecepatan (ditulis) ==");
  console.log(`  insiden 7 / 30 / 90 hari : ${h.insiden7} / ${h.insiden30} / ${h.insiden90}`);
  console.log(`  truk terlibat            : ${h.trukTerlibat}`);
  console.log(`  jam kerja tanpa insiden  : ${h.jamKosong.length ? h.jamKosong.join(", ") : "tidak ada"}`);
  console.log(`  pengaduan valid terkait  : ${h.validCocok} dari ${h.validTotal}`);
  console.log(`  pengaduan ditolak saat truk diam: ${h.ditolakDiam} dari ${h.ditolakTotal}`);
  console.log(jaminan.lulus ? "  SEMUA JAMINAN TERPENUHI (di generator)." : "  ADA JAMINAN YANG GAGAL (lihat di atas).");

  // Pembuktian di database: query yang sama dengan supabase/cek-insiden.sql.
  const db2 = await tahap("cek database setelah menulis", () => cekInsidenDb(db));
  const cocok = db2.insiden7 >= 3 && db2.insiden30 >= 6 && db2.insiden90 >= 9;
  console.log(cocok ? "\nDATABASE TERBUKTI berisi insiden untuk rentang 7/30/90 hari." : "\nPERINGATAN: database belum memenuhi minimum insiden 7/30/90 hari; periksa error tulis di atas dan simulator (retensi menghapus positions?).");
  if (!cocok || adaGagal) process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
