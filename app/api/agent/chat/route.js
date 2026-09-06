import { NextResponse } from "next/server";

// POST /api/agent/chat — teruskan pertanyaan ke agent OpenClaw di VPS.
// Konsumen: lib/agent.js sendMessageToAgent -> return { role: "agent", text }.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const pesan = body?.message ?? body?.pesan;
  if (!pesan || typeof pesan !== "string") {
    return NextResponse.json({ text: "" }, { status: 400 });
  }

  const endpoint = process.env.OPENCLAW_ENDPOINT;
  const resText = await telusurAgent(endpoint, pesan);

  if (resText) {
    return NextResponse.json({ text: resText.jawaban, mode: resText.mode ?? "luring" });
  }

  return NextResponse.json({ text: "Agent AI belum terhubung (OpenClaw belum dikonfigurasi).", mode: "luring" });
}

async function telusurAgent(endpoint, pesan) {
  if (!endpoint) return null;
  try {
    const res = await fetch(`${endpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pesan }),
      signal: AbortSignal.timeout(30000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
