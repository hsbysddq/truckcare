import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { ambilRiwayatChat, tulis } from "@/lib/supabase";

// DELETE /api/chat — hapus seluruh riwayat percakapan user yang login
// dari chat_logs (hanya miliknya sendiri). Digate proxy.js + getUser.
export async function DELETE() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }
  try {
    await tulis(
      "chat_logs",
      "DELETE",
      `?user_id=eq.${encodeURIComponent(user.id)}`
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/chat — riwayat percakapan user yang login, dari tabel chat_logs
// (satu baris = satu pasang tanya/jawab, dicatat saat POST /api/agent/chat).
// Tidak ada data contoh: belum ada riwayat = array kosong, UI menampilkan
// tampilan awal. Digate proxy.js (butuh sesi).
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ messages: [] }, { status: 401 });
  }
  try {
    const messages = await ambilRiwayatChat(user.id);
    return NextResponse.json({ messages });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
