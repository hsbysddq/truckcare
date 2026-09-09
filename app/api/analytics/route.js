import { NextResponse } from "next/server";
import { getAnalyticsSource } from "@/lib/data";
import { getAnalyticsSourceLive } from "@/lib/supabase";
import { buildAnalytics } from "@/lib/analytics";
import { getActiveTrucks } from "@/lib/trucks";

// GET /api/analytics?range=30&plates=W%203324%20IJ,L%208890%20ST
// Semua hitungan di lib/analytics.js. Sumber data live dari Supabase
// (getAnalyticsSourceLive, hanya truk aktif); jatuh ke data contoh (juga
// dibatasi truk aktif) bila DB tak terjangkau. Digate proxy.js.
export async function GET(req) {
  const params = new URL(req.url).searchParams;
  const rangeDays = Number(params.get("range") ?? "");
  const plates = (params.get("plates") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  try {
    let source;
    try {
      source = await getAnalyticsSourceLive();
    } catch {
      source = getAnalyticsSource(await getActiveTrucks());
    }
    const data = buildAnalytics(source, { rangeDays, plates });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
