import { NextResponse, after } from "next/server";
import { tulis } from "@/lib/supabase";
import { analyzeComplaint } from "@/lib/complaint-analysis";
import { kirimNotifikasiPengaduan } from "@/lib/telegram";
import { isValidPlate, normalizePlate } from "@/lib/format";

// Verifikasi Turnstile sebelum insert (gating, bukan replace). Host yang
// boleh submit di-allowlist lewat env TURNSTILE_HOSTNAMES (koma-terpisah);
// produksi tanpa localhost. Kosong = fail-closed (403).
const expectedHostnames = new Set(
  (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
);

const ACTION = "pengaduan";
const MIN_DESKRIPSI = 20;

async function verifyTurnstile(token, remoteip) {
  let result;
  try {
    const r = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET ?? "",
          response: token,
          ...(remoteip ? { remoteip } : {}),
        }),
      }
    );
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch {
    result = { success: false };
  }
  return (
    result.success === true &&
    result.action === ACTION &&
    expectedHostnames.has(result.hostname)
  );
}

// POST /api/pengaduan — terima laporan publik, verifikasi Turnstile, lalu
// insert lewat service role (bukan policy publik). Foto tetap di-upload
// client terpisah ke storage; route ini hanya menyimpan baris pengaduan.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const token = body?.token;
  if (
    typeof token !== "string" ||
    !token ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    return NextResponse.json({ error: "Verifikasi captcha tidak sah." }, { status: 403 });
  }

  const remoteip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  if (!(await verifyTurnstile(token, remoteip))) {
    return NextResponse.json({ error: "Verifikasi captcha gagal." }, { status: 403 });
  }

  const plat = typeof body.plat === "string" ? normalizePlate(body.plat) : "";
  const tanggal = typeof body.tanggal === "string" ? body.tanggal : "";
  const jam = typeof body.jam === "string" && body.jam ? body.jam : null;
  const deskripsi = typeof body.deskripsi === "string" ? body.deskripsi.trim() : "";
  const fotoUrl = typeof body.foto_url === "string" && body.foto_url ? body.foto_url : null;
  // Satu-satunya status yang boleh ditentukan klien: plat tidak terdaftar
  // (hasil /api/check-plate). Nilai lain diabaikan, default DB "menunggu".
  const status = body.status === "luar_armada" ? "luar_armada" : null;

  if (!isValidPlate(plat) || !tanggal || deskripsi.length < MIN_DESKRIPSI) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  try {
    const rows = await tulis("pengaduan", "POST", "", {
      plat,
      tanggal,
      jam,
      deskripsi,
      foto_url: fotoUrl,
      ...(status ? { status } : {}),
    });
    const baris = Array.isArray(rows) ? rows[0] : rows;
    // Analisis otomatis segera setelah respons dikirim (server-side); daftar
    // dashboard menampilkan "Sedang dianalisis" sampai selesai. Notifikasi
    // Telegram ke semua chat terdaftar juga best-effort lewat after().
    if (baris?.id) {
      after(async () => {
        try {
          await analyzeComplaint(baris.id, { trigger: "otomatis" });
        } catch {
          // Status gagal sudah dicatat oleh analyzeComplaint.
        }
      });
      after(async () => {
        try {
          await kirimNotifikasiPengaduan({ plat, tanggal, jam, deskripsi });
        } catch {
          // Pengaduan sudah tersimpan; notifikasi gagal = diam saja.
        }
      });
    }
    return NextResponse.json({ id: baris?.id ?? null });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
