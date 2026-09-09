import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseUrl } from "@/lib/supabase";
import { muatPrompt } from "@/lib/agent-config";

const KUNCI = "agent_prompt";

// GET /api/pengaturan/agent — ambil system prompt AI yang tersimpan
// (fallback default). Hanya untuk user yang login.
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  const prompt = await muatPrompt();
  return NextResponse.json({ prompt });
}

// PUT /api/pengaturan/agent  { prompt } — simpan system prompt AI.
export async function PUT(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt)
    return NextResponse.json({ error: "Prompt tidak boleh kosong." }, { status: 400 });
  if (prompt.length > 20000)
    return NextResponse.json({ error: "Prompt terlalu panjang (maks 20.000 karakter)." }, { status: 400 });

  try {
    const res = await fetch(`${supabaseUrl()}/rest/v1/settings`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ kunci: KUNCI, nilai: prompt }),
    });
    if (!res.ok) throw new Error(`simpan gagal ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
