import { NextResponse } from "next/server";
import { supabaseUrl } from "@/lib/supabase";

// POST /api/complaints/[id] — validasi/tolak pengaduan lewat service role.
// Body: { status: "tervalidasi" | "ditolak", alasan? }
// "tervalidasi" dikonsultasikan dulu ke agent OpenClaw di VPS (fallback
// diterima otomatis kalau agent tak terjangkau); "ditolak" langsung manual.
export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  let status =
    body.status === "tervalidasi" ? "valid" :
    body.status === "ditolak" ? "ditolak" : null;
  if (!status) {
    return NextResponse.json({ error: "status wajib: tervalidasi | ditolak" }, { status: 400 });
  }

  const update = {};
  if (status === "valid") {
    const hasil = await validasiAI(id);
    if (hasil) {
      status = hasil.status;
      if (hasil.alasan) update.alasan = hasil.alasan;
    } else {
      update.alasan = "Validasi AI tidak tersedia, diterima otomatis.";
    }
  } else {
    update.alasan = body.alasan ?? "Ditolak manual oleh operator.";
  }
  update.status = status;

  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local" }, { status: 500 });
  }

  const url = supabaseUrl();
  const res = await fetch(`${url}/rest/v1/pengaduan?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      // Minta representasi supaya bisa bedakan "tidak ada baris cocok" (404)
      // dari update beneran. Tanpa ini PostgREST 204/ok walau 0 baris.
      Prefer: "return=representation",
    },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    return NextResponse.json({ error: `update pengaduan gagal: ${res.status}` }, { status: 502 });
  }
  const baris = await res.json().catch(() => []);
  if (!Array.isArray(baris) || baris.length === 0) {
    return NextResponse.json({ error: "pengaduan tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

// Tanya agent OpenClaw di VPS. Balik { status: "valid"|"ditolak", alasan? }
// atau null kalau endpoint belum dikonfigurasi / tak terjangkau / gagal.
async function validasiAI(pengaduanId) {
  const endpoint = process.env.OPENCLAW_ENDPOINT;
  if (!endpoint) return null;
  try {
    const res = await fetch(`${endpoint}/api/validasi-pengaduan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pengaduan_id: pengaduanId }),
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      status: data?.status === "ditolak" ? "ditolak" : "valid",
      alasan: data?.alasan ?? null,
    };
  } catch {
    return null;
  }
}
