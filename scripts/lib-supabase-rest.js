// Helper bersama untuk script Node (scripts/*.js): muat .env.local, lalu
// akses PostgREST Supabase dengan service role. Tanpa dependensi tambahan.
const fs = require("node:fs");
const path = require("node:path");

function muatEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function klien() {
  muatEnvLocal();
  const URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!URL || !KEY) {
    console.error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local dulu.");
    process.exit(1);
  }
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

  async function get(tabel, params = "") {
    const res = await fetch(`${URL}/rest/v1/${tabel}${params}`, { headers });
    if (!res.ok) throw new Error(`GET ${tabel}${params} -> ${res.status} ${await res.text()}`);
    return res.json();
  }
  // Jumlah baris tanpa mengunduh isinya (Prefer: count=exact + Range).
  async function hitung(tabel, params = "") {
    const res = await fetch(`${URL}/rest/v1/${tabel}${params || "?"}${params.includes("select=") ? "" : (params ? "&" : "") + "select=id"}`, {
      headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
    });
    if (!res.ok) throw new Error(`COUNT ${tabel}${params} -> ${res.status} ${await res.text()}`);
    const cr = res.headers.get("content-range") ?? "";
    const total = Number(cr.split("/")[1]);
    return Number.isFinite(total) ? total : 0;
  }
  async function post(tabel, rows) {
    const res = await fetch(`${URL}/rest/v1/${tabel}`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error(`POST ${tabel} -> ${res.status} ${await res.text()}`);
    return res.json();
  }
  async function patch(tabel, params, body) {
    const res = await fetch(`${URL}/rest/v1/${tabel}${params}`, { method: "PATCH", headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`PATCH ${tabel}${params} -> ${res.status} ${await res.text()}`);
  }
  async function del(tabel, params) {
    const res = await fetch(`${URL}/rest/v1/${tabel}${params}`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "count=exact" },
    });
    if (!res.ok) throw new Error(`DELETE ${tabel}${params} -> ${res.status} ${await res.text()}`);
    const cr = res.headers.get("content-range") ?? "";
    const total = Number(cr.split("/")[1]);
    return Number.isFinite(total) ? total : 0;
  }
  // Nilai min/max sebuah kolom lewat order+limit (tanpa fungsi agregat).
  async function rentang(tabel, kolom, params = "") {
    const q = (arah) => `?select=${kolom}${params ? "&" + params.replace(/^\?/, "") : ""}&order=${kolom}.${arah}&limit=1`;
    const [awal, akhir] = await Promise.all([get(tabel, q("asc")), get(tabel, q("desc"))]);
    return { min: awal?.[0]?.[kolom] ?? null, max: akhir?.[0]?.[kolom] ?? null };
  }
  const inList = (ids) => `(${ids.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(",")})`;
  return { URL, get, hitung, post, patch, del, rentang, inList };
}

module.exports = { klien, muatEnvLocal };
