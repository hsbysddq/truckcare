// Diagnosis READ-ONLY grafik "Distribusi Waktu Insiden" dan "Insiden
// Kecepatan per Armada" (halaman Analitik):
//   - berapa baris positions dengan kecepatan > BATAS (80 km/jam)
//   - truk mana saja, dan apakah truk itu berstatus aktif
//   - rentang tanggalnya dan berapa yang masuk filter 7 / 30 / 90 hari
//   - kecepatan tertinggi di database
//   - jumlah INSIDEN (episode: titik berturutan berjarak <= 5 menit)
//   - apakah fungsi SQL analitik_ngebut (supabase/analitik-agregat.sql) ada
//
// Catatan nama kolom: tabel telemetri bernama positions (kolom kecepatan,
// ts, truk_id), status aktif ada di trucks.status = 'aktif'.
// Pakai: node scripts/inspect-speeding.js
import { klien } from "./lib-supabase-rest.js";
import { BATAS_KECEPATAN_KPJ, kelompokkanInsiden } from "../lib/speed-limit.js";

const tanggalWIB = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

async function main() {
  const db = klien();
  const trucks = await db.get("trucks", "?select=id,plat,status&limit=1000");
  const trukDariId = Object.fromEntries(trucks.map((t) => [t.id, t]));

  const total = await db.hitung("positions");
  const diAtas = await db.hitung("positions", `?kecepatan=gt.${BATAS_KECEPATAN_KPJ}`);
  const tertinggi = await db.get("positions", "?select=truk_id,kecepatan,ts&order=kecepatan.desc&limit=1");
  console.log(`== POSITIONS (batas > ${BATAS_KECEPATAN_KPJ} km/jam, perbandingan '>') ==`);
  console.log(`total baris ${total} | kecepatan > ${BATAS_KECEPATAN_KPJ}: ${diAtas}`);
  console.log(
    `kecepatan tertinggi: ${tertinggi[0]?.kecepatan ?? "-"} km/jam` +
      (tertinggi[0] ? ` (${trukDariId[tertinggi[0].truk_id]?.plat ?? tertinggi[0].truk_id}, ${tertinggi[0].ts})` : "")
  );
  if (!diAtas) {
    console.log("\nKESIMPULAN: tidak ada baris di atas batas -> masalahnya DATA TIDAK ADA. Jalankan: node scripts/seed.js --apply");
  }

  const rows = await db.get(
    "positions",
    `?select=truk_id,lat,lon,kecepatan,ts&kecepatan=gt.${BATAS_KECEPATAN_KPJ}&order=ts.desc&limit=10000`
  );
  const now = Date.now();
  const dalam = (hari) => rows.filter((p) => now - new Date(p.ts).getTime() <= hari * 864e5).length;
  const perTruk = {};
  for (const p of rows) {
    const t = trukDariId[p.truk_id];
    const k = t ? `${t.plat} [${t.status}]` : `${p.truk_id} [TIDAK ADA DI trucks]`;
    perTruk[k] = (perTruk[k] ?? 0) + 1;
  }
  if (rows.length) {
    const ts = rows.map((p) => p.ts).sort();
    console.log(`\nrentang ts: ${ts[0]}  s.d.  ${ts.at(-1)}  (WIB ${tanggalWIB(ts[0])} s.d. ${tanggalWIB(ts.at(-1))})`);
    console.log(`masuk filter: 7 hari ${dalam(7)} | 30 hari ${dalam(30)} | 90 hari ${dalam(90)} | lebih lama ${rows.length - dalam(90)}`);
    console.log("\nper truk (baris):");
    for (const [k, n] of Object.entries(perTruk).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(28)} ${n}`);
    const nonaktif = rows.filter((p) => trukDariId[p.truk_id]?.status !== "aktif").length;
    if (nonaktif) console.log(`\n${nonaktif} baris milik truk NONAKTIF/tidak dikenal -> tersaring dari grafik.`);
    const aktifRows = rows.filter((p) => trukDariId[p.truk_id]?.status === "aktif");
    const insiden = kelompokkanInsiden(aktifRows);
    console.log(`\nINSIDEN (episode, jeda > 5 menit = insiden baru) truk aktif: ${insiden.length}`);
    console.log(`  7 hari ${insiden.filter((e) => now - new Date(e.mulai).getTime() <= 7 * 864e5).length} | 30 hari ${insiden.filter((e) => now - new Date(e.mulai).getTime() <= 30 * 864e5).length} | 90 hari ${insiden.filter((e) => now - new Date(e.mulai).getTime() <= 90 * 864e5).length}`);
    if (!aktifRows.length) console.log("\nKESIMPULAN: data ADA tetapi semua milik truk nonaktif -> TERSARING.");
    else if (!dalam(90)) console.log("\nKESIMPULAN: data ADA tetapi lebih lama dari 90 hari -> TERSARING oleh rentang.");
    else console.log("\nKESIMPULAN: data ada dan masuk rentang; bila grafik masih kosong, periksa fungsi SQL / jalur query.");
  }

  // Fungsi SQL agregasi (RPC) ada?
  const res = await fetch(`${db.URL}/rest/v1/rpc/analitik_ngebut`, {
    method: "POST",
    headers: db.headers,
    body: JSON.stringify({ p_hari: 181 }),
  });
  if (res.ok) {
    const agg = await res.json();
    console.log(`\nRPC analitik_ngebut: ADA, ${agg.length} baris agregat (181 hari), total insiden ${agg.reduce((s, r) => s + Number(r.jumlah), 0)}`);
  } else {
    console.log(`\nRPC analitik_ngebut: BELUM ADA (HTTP ${res.status}); aplikasi memakai jalur cadangan baris mentah. Jalankan supabase/analitik-agregat.sql.`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
