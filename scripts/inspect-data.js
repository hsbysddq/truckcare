// Laporan READ-ONLY isi database untuk mendiagnosis halaman Analitik:
//   - jumlah truk aktif / nonaktif (kolom trucks.status)
//   - jumlah baris positions (telemetri), pengaduan, agent_runs, schedules
//   - berapa yang merujuk truk AKTIF vs NONAKTIF (tersaring di dashboard)
//   - rentang tanggal paling lama & paling baru tiap tabel
//
// Pakai: node scripts/inspect-data.js
// Butuh NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY di .env.local.
const { klien } = require("./lib-supabase-rest");

function kunciPlat(p) {
  return String(p ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function main() {
  const db = klien();
  const trucks = await db.get("trucks", "?select=id,plat,status&limit=1000");
  const aktif = trucks.filter((t) => t.status === "aktif");
  const nonaktif = trucks.filter((t) => t.status !== "aktif");
  const idAktif = aktif.map((t) => t.id);
  const idNon = nonaktif.map((t) => t.id);
  const platAktif = new Set(aktif.map((t) => kunciPlat(t.plat)));
  const platNon = new Set(nonaktif.map((t) => kunciPlat(t.plat)));

  console.log("== TRUK ==");
  console.log(`aktif   : ${aktif.length}  (${aktif.map((t) => t.plat).join(", ")})`);
  console.log(`nonaktif: ${nonaktif.length}  (${nonaktif.map((t) => t.plat).join(", ") || "-"})`);

  const perTruk = async (tabel, kolom, kolomTs) => {
    const total = await db.hitung(tabel);
    const keAktif = idAktif.length ? await db.hitung(tabel, `?${kolom}=in.${db.inList(idAktif)}`) : 0;
    const keNon = idNon.length ? await db.hitung(tabel, `?${kolom}=in.${db.inList(idNon)}`) : 0;
    const r = await db.rentang(tabel, kolomTs);
    console.log(`\n== ${tabel.toUpperCase()} ==`);
    console.log(`total ${total} | ke truk aktif ${keAktif} | ke truk nonaktif (tersaring) ${keNon} | yatim/tanpa truk ${total - keAktif - keNon}`);
    console.log(`rentang ${kolomTs}: ${r.min ?? "-"}  s.d.  ${r.max ?? "-"}`);
    return { total, keAktif, keNon };
  };

  await perTruk("positions", "truk_id", "ts");
  await perTruk("trips", "truk_id", "mulai");
  try {
    await perTruk("schedules", "truck_id", "planned_departure");
  } catch (e) {
    console.log("\n== SCHEDULES == tabel belum ada:", e.message.split("\n")[0]);
  }

  // pengaduan: dicocokkan lewat plat (tidak ada FK truk pada baris lama).
  const aduan = await db.get("pengaduan", "?select=id,plat,tanggal,created_at,decided_by,deleted_at&order=tanggal.asc&limit=10000");
  const aduanAktif = aduan.filter((r) => platAktif.has(kunciPlat(r.plat)));
  const aduanNon = aduan.filter((r) => platNon.has(kunciPlat(r.plat)));
  const aduanLuar = aduan.length - aduanAktif.length - aduanNon.length;
  console.log("\n== PENGADUAN ==");
  console.log(`total ${aduan.length} | plat truk aktif ${aduanAktif.length} | plat truk nonaktif (tersaring) ${aduanNon.length} | plat luar armada ${aduanLuar} | terhapus (soft) ${aduan.filter((r) => r.deleted_at).length}`);
  console.log(`diputuskan agent ${aduan.filter((r) => r.decided_by === "agent").length} | operator ${aduan.filter((r) => r.decided_by === "operator").length} | belum ${aduan.filter((r) => !r.decided_by).length}`);
  console.log(`rentang tanggal: ${aduan[0]?.tanggal ?? "-"}  s.d.  ${aduan.at(-1)?.tanggal ?? "-"}`);
  const hariIni = new Date().toISOString().slice(0, 10);
  const batas7 = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  console.log(`dalam 7 hari terakhir (>= ${batas7}): ${aduan.filter((r) => r.tanggal >= batas7 && r.tanggal <= hariIni).length}`);

  // agent_runs: lewat complaint_id.
  try {
    const runs = await db.get("agent_runs", "?select=id,complaint_id,started_at,finished_at,outcome&order=started_at.asc&limit=10000");
    const idAduanNon = new Set(aduanNon.map((r) => r.id));
    const idAduanAktif = new Set(aduanAktif.map((r) => r.id));
    const durasi = runs.filter((r) => r.finished_at).map((r) => (new Date(r.finished_at) - new Date(r.started_at)) / 1000);
    console.log("\n== AGENT_RUNS ==");
    console.log(`total ${runs.length} | ke pengaduan truk aktif ${runs.filter((r) => idAduanAktif.has(r.complaint_id)).length} | ke pengaduan truk nonaktif ${runs.filter((r) => idAduanNon.has(r.complaint_id)).length} | tanpa pengaduan ${runs.filter((r) => !r.complaint_id).length}`);
    console.log(`selesai (finished_at terisi) ${durasi.length} | rata-rata durasi ${durasi.length ? Math.round(durasi.reduce((a, b) => a + b, 0) / durasi.length) : "-"} detik`);
    console.log(`rentang started_at: ${runs[0]?.started_at ?? "-"}  s.d.  ${runs.at(-1)?.started_at ?? "-"}`);
  } catch (e) {
    console.log("\n== AGENT_RUNS == tabel belum ada:", e.message.split("\n")[0]);
  }

  console.log("\nCatatan: dashboard hanya menampilkan truk status='aktif'; baris pada kolom 'nonaktif' di atas tidak akan muncul di grafik mana pun.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
