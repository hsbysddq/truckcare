// Server-only: kumpulkan jadwal + telemetri + solar, lalu jalankan
// lib/schedule-analysis.js. Dipakai GET /api/schedules/findings dan tool
// agent "cek_penyimpangan_jadwal" di /api/agent/chat.

import { listSchedules } from "./schedule-store.js";
import { getTrucksShape } from "./supabase.js";
import { getTrucks, getAnalyticsSource } from "./data.js";
import { analyzeSchedules, summarizeToday } from "./schedule-analysis.js";

export async function muatTemuan() {
  const now = new Date();
  let trucks;
  try {
    trucks = await getTrucksShape();
  } catch {
    trucks = getTrucks();
  }
  const schedules = await listSchedules();
  const findings = analyzeSchedules({
    schedules,
    trucks,
    fuelDaily: getAnalyticsSource().fuelDaily,
    now,
  });
  return { findings, summary: summarizeToday(schedules, now), generatedAt: now.toISOString() };
}
