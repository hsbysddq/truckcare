import { NextResponse } from "next/server";
import { getTrucksShape } from "@/lib/supabase";

// GET /api/trucks — daftar armada baca dari Supabase, shape nyamain lib/data.js.
export async function GET() {
  try {
    const trucks = await getTrucksShape();
    return NextResponse.json(trucks);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
