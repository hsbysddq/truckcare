import { NextResponse } from "next/server";
import { hapusBotAkses } from "@/lib/supabase";

// DELETE /api/pengaturan/telegram/[id] — cabut akses chat dari bot.
const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!id || !POLA_UUID.test(id)) {
    return NextResponse.json({ error: "id wajib UUID valid" }, { status: 400 });
  }
  try {
    await hapusBotAkses(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}