// Server-only: kumpulkan jadwal + telemetri + solar, lalu jalankan
// lib/schedule-analysis.js. Dipakai GET /api/schedules/findings dan tool
// agent "cek_penyimpangan_jadwal" di /api/agent/chat.

import { listSchedules } from "./schedule-store.js";
import { getActiveTrucks } from "./trucks.js";
import { getAnalyticsSource } from "./data.js";
import { analyzeSchedules, summarizeToday } from "./schedule-analysis.js";

export async function muatTemuan() {
  const now = new Date();
  const trucks = await getActiveTrucks();
  // 30 hari ke belakang + 7 ke depan cukup untuk temuan hari ini dan cek
  // penurunan solar pada hari tanpa jadwal; bukan seluruh tabel.
  const schedules = await listSchedules({
    from: new Date(now.getTime() - 30 * 864e5).toISOString(),
    to: new Date(now.getTime() + 7 * 864e5).toISOString(),
  });
  const findings = analyzeSchedules({
    schedules,
    trucks,
    fuelDaily: getAnalyticsSource(trucks).fuelDaily,
    now,
  });
  return { findings, summary: summarizeToday(schedules, now), generatedAt: now.toISOString() };
}
