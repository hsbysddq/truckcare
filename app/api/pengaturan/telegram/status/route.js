import { NextResponse } from "next/server";

// GET /api/pengaturan/telegram/status — cek token bot ke Telegram (getMe).
// Token hanya dibaca di server dari TELEGRAM_BOT_TOKEN; tidak pernah dikirim
// ke client, hanya hasil cek + username bot.
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  if (!token) {
    return NextResponse.json({ configured: false, ok: false });
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      return NextResponse.json({ configured: true, ok: false });
    }
    return NextResponse.json({
      configured: true,
      ok: true,
      username: data.result?.username ?? null,
    });
  } catch {
    return NextResponse.json({ configured: true, ok: false });
  }
}
