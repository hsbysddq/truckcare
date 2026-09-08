import { NextResponse } from "next/server";
import { listSchedules, updateSchedule } from "@/lib/schedule-store";
import { findConflicts, validateSchedulePayload } from "@/lib/schedule-analysis";

// PATCH /api/schedules/[id] — ubah jadwal; 409 bila bentrok. Digate proxy.js.
export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const existing = await listSchedules();
    const current = existing.find((s) => s.id === id);
    if (!current) return NextResponse.json({ error: "jadwal tidak ditemukan" }, { status: 404 });
    const merged = { ...current, ...body, id };
    const invalid = validateSchedulePayload(merged);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const conflicts = findConflicts(merged, existing);
    if (conflicts.length > 0) {
      return NextResponse.json({ error: "jadwal bentrok", conflicts }, { status: 409 });
    }
    const row = await updateSchedule(id, {
      ...body,
      ...(body.planned_departure
        ? { planned_departure: new Date(body.planned_departure).toISOString() }
        : {}),
      ...(body.planned_arrival
        ? { planned_arrival: new Date(body.planned_arrival).toISOString() }
        : {}),
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
