import { NextResponse } from "next/server";
import { pengaturanPage } from "@/lib/content";

// POST /api/pengaturan/telegram/uji — kirim satu pesan percobaan lewat bot.
// Body opsional { chat_id }; kosong = TELEGRAM_CHAT_ID (chat pemilik).
// Token tetap di server (TELEGRAM_BOT_TOKEN), route ini digate proxy.js.
const POLA_CHAT_ID = /^-?\d{4,}$/;

export async function POST(req) {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  if (!token) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN belum dikonfigurasi di server" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const diminta = String(body.chat_id ?? "").trim();
  const chatId = diminta || (process.env.TELEGRAM_CHAT_ID ?? "").trim();
  if (!POLA_CHAT_ID.test(chatId)) {
    return NextResponse.json(
      { error: "chat_id tujuan wajib angka (isi manual atau set TELEGRAM_CHAT_ID)" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: pengaturanPage.telegramStatusCard.testMessage,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      return NextResponse.json(
        { error: data?.description ?? `Telegram menjawab ${res.status}` },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, chatId });
  } catch {
    return NextResponse.json(
      { error: "Tidak bisa menghubungi api.telegram.org" },
      { status: 502 }
    );
  }
}
