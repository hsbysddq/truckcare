import { NextResponse } from "next/server";
import { getActiveTrucks } from "@/lib/trucks";
import { listSchedules } from "@/lib/schedule-store";
import { loadDrivers, jendelaJadwalAktif } from "@/lib/driver-data";
import { attachCurrentDrivers } from "@/lib/driver-status";

// Jangan di-prerender saat build: peta butuh posisi terbaru tiap request.
// (Tanpa ini respons GET bisa beku sejak deploy sementara bot selalu live.)
export const dynamic = "force-dynamic";

// GET /api/trucks — daftar armada baca dari Supabase, shape nyamain lib/data.js.
export async function GET() {
  try {
    let trucks = await getActiveTrucks();
    // Best-effort: pengemudi yang sedang membawa truk (dari jadwal aktif)
    // supaya nama pengemudi di Overview/Jadwal bisa ditautkan.
    try {
      // Hanya jadwal yang mungkin sedang berlangsung, bukan seluruh tabel.
      const [schedules, drivers] = await Promise.all([listSchedules(jendelaJadwalAktif()), loadDrivers()]);
      trucks = attachCurrentDrivers(trucks, schedules, new Map(drivers.map((d) => [d.id, d])));
    } catch {
      // Tanpa jadwal: shape truk apa adanya.
    }
    return NextResponse.json(trucks);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
