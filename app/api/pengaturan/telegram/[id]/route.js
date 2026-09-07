import { NextResponse } from "next/server";
import { hapusBotAkses } from "@/lib/supabase";

// DELETE /api/pengaturan/telegram/[id] — cabut akses chat dari bot.
export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id wajib" }, { status: 400 });
  }
  try {
    await hapusBotAkses(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}