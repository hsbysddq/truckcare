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
  const schedules = await listSchedules();
  const findings = analyzeSchedules({
    schedules,
    trucks,
    fuelDaily: getAnalyticsSource(trucks).fuelDaily,
    now,
  });
  return { findings, summary: summarizeToday(schedules, now), generatedAt: now.toISOString() };
}
