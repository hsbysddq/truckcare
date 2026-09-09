// Bersihkan laporan uji coba dari tabel pengaduan di Supabase.
// Penghapusan memakai SOFT DELETE (isi deleted_at + delete_reason, lihat
// supabase/pengaduan-keputusan.sql) supaya tetap bisa diaudit/dipulihkan.
// Contoh yang tertangkap: deskripsi "wefasdfasdfrwerawerawerasdf",
// plat "L 9012D" dan "W 4734 D".
//
// Yang dianggap uji coba:
//   1. plat tidak memenuhi format Indonesia (mis. "L 9012D")
//   2. deskripsi acak: satu kata tanpa spasi >= 8 huruf (mis. "asdfsafsdfsdfasdfsadf")
//      atau lebih dari separuh hurufnya tanpa vokal
// Sekalian merapikan plat luar Jawa Timur dari seed lama (DK -> W).
//
// Pakai:
//   node scripts/clean-test-data.js           -> dry run, hanya menampilkan kandidat
//   node scripts/clean-test-data.js --apply   -> benar-benar menghapus/memperbarui
// Butuh NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local
// (atau di environment). Service role dipakai karena RLS menolak anon.

import fs from "node:fs";
import path from "node:path";

const PLATE_PATTERN = /^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/;
const PLATE_FIXES = {
  "DK 5566 OP": "W 6612 OP",
  "DK 5678 CD": "W 9042 CD",
};

function muatEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function deskripsiAcak(text) {
  const t = String(text ?? "").trim();
  if (!t) return true;
  const satuKata = !/\s/.test(t) && t.length >= 8;
  const huruf = t.replace(/[^a-z]/gi, "");
  const vokal = (huruf.match(/[aeiou]/gi) ?? []).length;
  const minimVokal = huruf.length >= 8 && vokal / huruf.length < 0.2;
  return satuKata || minimVokal;
}

async function main() {
  muatEnvLocal();
  const URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!URL || !KEY) {
    console.error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dulu.");
    process.exit(1);
  }
  const apply = process.argv.includes("--apply");
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

  const res = await fetch(`${URL}/rest/v1/pengaduan?select=id,plat,deskripsi,status,created_at&deleted_at=is.null&order=created_at.desc&limit=1000`, { headers });
  if (!res.ok) throw new Error(`GET pengaduan gagal: ${res.status}`);
  const rows = await res.json();

  const hapus = [];
  const perbaiki = [];
  for (const r of rows) {
    const plat = String(r.plat ?? "").trim().toUpperCase().replace(/\s+/g, " ");
    if (PLATE_FIXES[plat]) {
      perbaiki.push({ id: r.id, dari: r.plat, ke: PLATE_FIXES[plat] });
      continue;
    }
    const alasan = [];
    if (!PLATE_PATTERN.test(plat)) alasan.push(`plat tidak valid "${r.plat}"`);
    if (deskripsiAcak(r.deskripsi)) alasan.push(`deskripsi acak "${String(r.deskripsi).slice(0, 30)}"`);
    if (alasan.length) hapus.push({ id: r.id, alasan: alasan.join("; ") });
  }

  console.log(`Total pengaduan: ${rows.length}`);
  console.log(`Kandidat hapus: ${hapus.length}`);
  for (const h of hapus) console.log(`  - ${h.id}  ${h.alasan}`);
  console.log(`Kandidat perbaiki plat: ${perbaiki.length}`);
  for (const p of perbaiki) console.log(`  - ${p.id}  ${p.dari} -> ${p.ke}`);

  if (!apply) {
    console.log("\nDry run. Jalankan lagi dengan --apply untuk menerapkan.");
    return;
  }

  for (const h of hapus) {
    const del = await fetch(`${URL}/rest/v1/pengaduan?id=eq.${h.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        deleted_at: new Date().toISOString(),
        delete_reason: `Data uji coba (script clean-test-data): ${h.alasan}`,
      }),
    });
    console.log(del.ok ? `soft-delete ${h.id}: ok` : `soft-delete ${h.id}: GAGAL ${del.status}`);
  }
  for (const p of perbaiki) {
    const patch = await fetch(`${URL}/rest/v1/pengaduan?id=eq.${p.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ plat: p.ke }),
    });
    console.log(patch.ok ? `perbaiki ${p.id}: ok` : `perbaiki ${p.id}: GAGAL ${patch.status}`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
