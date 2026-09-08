import { NextResponse } from "next/server";
import { muatTemuan } from "@/lib/schedule-findings";

// GET /api/schedules/findings — penyimpangan jadwal vs telemetri.
// Dipakai halaman Jadwal dan tool agent "cek_penyimpangan_jadwal".
export async function GET() {
  try {
    return NextResponse.json(await muatTemuan());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
