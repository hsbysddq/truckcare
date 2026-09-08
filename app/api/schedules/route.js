import { NextResponse } from "next/server";
import { listSchedules, createSchedule } from "@/lib/schedule-store";
import { findConflicts, validateSchedulePayload } from "@/lib/schedule-analysis";

// GET  /api/schedules?from=ISO&to=ISO — daftar jadwal (Supabase, atau contoh
//      in-memory bila env kosong).
// POST /api/schedules — tambah jadwal; 409 bila bentrok dengan jadwal truk
//      yang sama. Digate proxy.js.
export async function GET(req) {
  const params = new URL(req.url).searchParams;
  try {
    const rows = await listSchedules({
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
    });
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const invalid = validateSchedulePayload(body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  try {
    const existing = await listSchedules();
    const conflicts = findConflicts({ ...body, id: null }, existing);
    if (conflicts.length > 0) {
      return NextResponse.json({ error: "jadwal bentrok", conflicts }, { status: 409 });
    }
    const row = await createSchedule({
      ...body,
      planned_departure: new Date(body.planned_departure).toISOString(),
      planned_arrival: new Date(body.planned_arrival).toISOString(),
      status: body.status ?? "dijadwalkan",
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
