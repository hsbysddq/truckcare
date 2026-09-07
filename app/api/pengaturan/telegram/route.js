import { NextResponse } from "next/server";
import { daftarBotAkses, tambahBotAkses } from "@/lib/supabase";

// GET /api/pengaturan/telegram — daftar chat yang boleh akses bot.
// POST /api/pengaturan/telegram — tambah { chat_id, nama? }. Tulis pakai
// service role; validasi di sini karena ini batas kepercayaan.
const POLA_CHAT_ID = /^-?\d{4,}$/;

export async function GET() {
  try {
    return NextResponse.json(await daftarBotAkses());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const chatId = String(body.chat_id ?? body.chatId ?? "").trim();
  const nama = String(body.nama ?? "").trim().slice(0, 100) || null;
  if (!POLA_CHAT_ID.test(chatId)) {
    return NextResponse.json(
      { error: "chat_id wajib angka (boleh negatif untuk grup)" },
      { status: 400 }
    );
  }
  try {
    const baris = await tambahBotAkses(chatId, nama);
    return NextResponse.json(baris, { status: 201 });
  } catch (e) {
    const dobel = /duplicate|conflict|23505/i.test(e.message);
    return NextResponse.json(
      { error: dobel ? "chat_id sudah terdaftar" : e.message },
      { status: dobel ? 409 : 500 }
    );
  }
}