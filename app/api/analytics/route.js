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
  // ?debug=1 -> sertakan jejak query yang benar-benar dijalankan beserta
  // jumlah baris (diagnosis grafik kosong). Route ini digate proxy.js.
  const debug = params.get("debug") === "1";
  try {
    let source;
    let jejak;
    try {
      source = await getAnalyticsSourceLive({ rangeDays, debug });
      jejak = source.debug;
    } catch (e) {
      // Jatuh ke data contoh HANYA bila Supabase tak terjangkau; alasannya
      // dicatat supaya tidak diam-diam menampilkan angka contoh.
      source = getAnalyticsSource(await getActiveTrucks());
      jejak = { jalur: "data contoh (lib/data.js)", error: e.message };
    }
    const data = buildAnalytics(source, { rangeDays, plates });
    return NextResponse.json(debug ? { ...data, debug: jejak } : data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
