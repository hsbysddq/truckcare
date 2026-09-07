import { NextResponse } from "next/server";

// GET /api/pengaturan/openclaw — status koneksi ke skill server OpenClaw.
// Read-only: hanya host + hasil health check, tanpa secret apa pun.
export async function GET() {
  const endpoint = (process.env.OPENCLAW_ENDPOINT ?? "").replace(/\/$/, "");
  if (!endpoint) {
    return NextResponse.json({ host: null, ok: false });
  }
  const host = endpoint.replace(/^https?:\/\//, "");
  const mulai = Date.now();
  try {
    const res = await fetch(`${endpoint}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ host, ok: false });
    return NextResponse.json({
      host,
      ok: true,
      latencyMs: Date.now() - mulai,
    });
  } catch {
    return NextResponse.json({ host, ok: false });
  }
}