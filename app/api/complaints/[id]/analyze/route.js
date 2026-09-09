import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { analyzeComplaint } from "@/lib/complaint-analysis";
import { getComplaintsShape } from "@/lib/supabase";

// POST /api/complaints/[id]/analyze — "Analisis ulang" dari dashboard.
// Menjalankan lib/complaint-analysis.js (perhitungan oleh kode) lalu
// mengembalikan shape laporan terbaru untuk memperbarui panel tanpa reload.
export async function POST(_req, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "belum login" }, { status: 401 });
  const { id } = await params;
  try {
    await analyzeComplaint(id, { trigger: "pengguna" });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
  try {
    const rows = await getComplaintsShape({ includeDeleted: true });
    const row = rows.find((c) => c.id === id);
    return NextResponse.json({ ok: true, complaint: row ?? null });
  } catch (e) {
    return NextResponse.json({ ok: true, complaint: null, warning: e.message });
  }
}
