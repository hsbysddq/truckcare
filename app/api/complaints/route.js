import { NextResponse } from "next/server";
import { getComplaintsShape } from "@/lib/supabase";

// GET /api/complaints — daftar pengaduan dari Supabase, shape nyamain lib/data.js.
export async function GET() {
  try {
    const complaints = await getComplaintsShape();
    return NextResponse.json(complaints);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
