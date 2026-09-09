import { NextResponse } from "next/server";
import { getComplaintsShape } from "@/lib/supabase";

// GET /api/complaints — daftar pengaduan dari Supabase, shape nyamain lib/data.js.
//   ?deleted=all  -> sertakan yang di-soft-delete (deletedAt terisi);
//   default       -> hanya yang belum dihapus.
export async function GET(req) {
  const deleted = new URL(req.url).searchParams.get("deleted");
  try {
    const complaints = await getComplaintsShape({ includeDeleted: deleted === "all" });
    return NextResponse.json(complaints);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
