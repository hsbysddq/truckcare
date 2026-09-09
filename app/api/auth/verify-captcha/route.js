import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";

const ACTION = "login";

// POST /api/auth/verify-captcha  { token }  ->  { ok: true }
// Gate untuk login: verifikasi Turnstile (action "login") sebelum
// signInWithPassword dijalankan dari client. Gagal -> 403.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const token = body?.token;
  if (!token) {
    return NextResponse.json({ error: "Captcha tidak sah." }, { status: 403 });
  }
  const remoteip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  if (!(await verifyTurnstile(token, ACTION, remoteip))) {
    return NextResponse.json({ error: "Verifikasi captcha gagal." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
