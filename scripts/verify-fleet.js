// Verifikasi konsistensi armada di database (READ-ONLY):
//   - truk aktif tepat 15 dan identik dengan scripts/fleet-data.js (id + plat)
//   - pengemudi identik dengan daftar tetap (id + nama)
//   - semua pengaduan, jadwal, telemetri (positions) merujuk truk di daftar
//   - sidik jari identitas (plat + nama pengemudi) untuk dibandingkan antara
//     dua kali menjalankan seed: harus sama persis
//
// Pakai: node scripts/verify-fleet.js
import { createHash } from "node:crypto";
import { klien } from "./lib-supabase-rest.js";
import { FLEET_TRUCKS, FLEET_DRIVERS } from "./fleet-data.js";

const kunci = (p) => String(p ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

export async function periksaArmada(db) {
  const trucks = await db.get("trucks", "?select=id,plat,nama,tipe,status&order=nama&limit=1000");
  const drivers = await db.get("drivers", "?select=id,nama,no_hp&order=nama&limit=1000");
  const aktif = trucks.filter((t) => t.status === "aktif");
  const idAktif = new Set(aktif.map((t) => t.id));
  const platAktif = new Set(aktif.map((t) => kunci(t.plat)));

  const trukCocok =
    aktif.length === FLEET_TRUCKS.length &&
    FLEET_TRUCKS.every((f) => aktif.some((t) => t.id === f.id && kunci(t.plat) === kunci(f.plat)));
  const drvCocok =
    drivers.length === FLEET_DRIVERS.length &&
    FLEET_DRIVERS.every((f) => drivers.some((d) => d.id === f.id && d.nama === f.nama));

  const aduan = await db.get("pengaduan", "?select=id,plat,truck_id,status&deleted_at=is.null&limit=10000");
  const aduanLuar = aduan.filter((a) => !platAktif.has(kunci(a.plat)) && a.status !== "luar_armada");
  const jadwal = await db.get("schedules", "?select=id,truck_id&limit=10000").catch(() => []);
  const jadwalLuar = jadwal.filter((s) => !idAktif.has(s.truck_id));
  const posTotal = await db.hitung("positions");
  const posAktif = aktif.length ? await db.hitung("positions", `?truk_id=in.${db.inList([...idAktif])}`) : 0;

  const sidik = createHash("sha256")
    .update(
      JSON.stringify({
        trucks: aktif.map((t) => [t.id, t.plat]).sort(),
        drivers: drivers.map((d) => [d.id, d.nama]).sort(),
      })
    )
    .digest("hex")
    .slice(0, 16);

  return {
    aktif,
    drivers,
    trukCocok,
    drvCocok,
    aduanTotal: aduan.length,
    aduanLuar,
    jadwalTotal: jadwal.length,
    jadwalLuar,
    posTotal,
    posAktif,
    sidik,
  };
}

export function cetakLaporan(h) {
  const ok = (b) => (b ? "OK " : "GAGAL");
  console.log(`${ok(h.aktif.length === FLEET_TRUCKS.length)} truk aktif: ${h.aktif.length} (harus ${FLEET_TRUCKS.length})`);
  console.log(`${ok(h.trukCocok)} truk aktif identik dengan fleet-data.js (id + plat)`);
  console.log(`     ${h.aktif.map((t) => t.plat).join(", ")}`);
  console.log(`${ok(h.drvCocok)} pengemudi identik dengan fleet-data.js: ${h.drivers.length} (harus ${FLEET_DRIVERS.length})`);
  console.log(`${ok(h.aduanLuar.length === 0)} pengaduan merujuk truk di daftar: ${h.aduanTotal - h.aduanLuar.length}/${h.aduanTotal}`);
  console.log(`${ok(h.jadwalLuar.length === 0)} jadwal merujuk truk di daftar: ${h.jadwalTotal - h.jadwalLuar.length}/${h.jadwalTotal}`);
  console.log(`${ok(h.posTotal === h.posAktif)} telemetri merujuk truk di daftar: ${h.posAktif}/${h.posTotal}`);
  console.log(`sidik jari identitas (plat + nama pengemudi): ${h.sidik}`);
  console.log("   jalankan seed dua kali; sidik jari harus sama persis.");
  const semua = h.aktif.length === FLEET_TRUCKS.length && h.trukCocok && h.drvCocok && !h.aduanLuar.length && !h.jadwalLuar.length && h.posTotal === h.posAktif;
  console.log(semua ? "\nSEMUA PEMERIKSAAN LULUS." : "\nADA PEMERIKSAAN GAGAL (lihat di atas). Jalankan: node scripts/seed.js --apply");
  return semua;
}

const dijalankanLangsung = process.argv[1] && /verify-fleet\.js$/.test(process.argv[1]);
if (dijalankanLangsung) {
  periksaArmada(klien())
    .then((h) => process.exit(cetakLaporan(h) ? 0 : 1))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
