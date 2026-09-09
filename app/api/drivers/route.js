import { NextResponse } from "next/server";
import { loadDriverOverview } from "@/lib/driver-data";

// GET /api/drivers — ringkasan pengemudi untuk dashboard (digate proxy.js).
// Status dihitung lib/driver-status.js dari jadwal + telemetri; tidak ada
// kolom status di tabel drivers. Tanpa nomor telepon (privasi).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await loadDriverOverview());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
