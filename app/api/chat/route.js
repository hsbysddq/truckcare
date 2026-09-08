import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { ambilRiwayatChat } from "@/lib/supabase";

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
