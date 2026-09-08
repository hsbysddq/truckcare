import { NextResponse } from "next/server";
import { getMessages, saveMessage } from "@/lib/chat-store";

// GET  /api/chat — riwayat percakapan, urut waktu.
// POST /api/chat — simpan satu pesan { role, content, toolTrace?, dataCard?, truckContext? }.
// Digate proxy.js (butuh sesi). Validasi di sini karena ini batas kepercayaan.
const ROLES = new Set(["user", "agent"]);
const MAX_CONTENT = 4000;

function objekAtauNull(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

export async function GET() {
  try {
    return NextResponse.json(await getMessages());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const role = String(body.role ?? "");
  const content = String(body.content ?? "").trim();
  if (!ROLES.has(role)) {
    return NextResponse.json({ error: "role wajib user atau agent" }, { status: 400 });
  }
  if (!content || content.length > MAX_CONTENT) {
    return NextResponse.json(
      { error: `content wajib diisi, maksimal ${MAX_CONTENT} karakter` },
      { status: 400 }
    );
  }
  const truckContext =
    typeof body.truckContext === "string" && body.truckContext.trim()
      ? body.truckContext.trim().slice(0, 20)
      : null;

  try {
    const record = await saveMessage({
      role,
      content,
      toolTrace: objekAtauNull(body.toolTrace),
      dataCard: objekAtauNull(body.dataCard),
      truckContext,
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
