// Lapisan data jadwal (server-only, dipakai route /api/schedules).
// Supabase (tabel schedules, lihat supabase/schedules.sql) bila env terisi;
// selain itu salinan in-memory dari data contoh lib/data.js supaya halaman
// dan form tetap bisa dicoba tanpa database.

import { randomUUID } from "node:crypto";
import { getSchedules as getDummySchedules, getTrucks, getDrivers } from "./data.js";
import { baca, tulis } from "./supabase.js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function supabaseReady() {
  return Boolean(URL && ANON);
}

const memory = (globalThis.__circleTScheduleStore ??= { seeded: false, rows: [] });
function seed() {
  if (memory.seeded) return;
  memory.seeded = true;
  memory.rows = getDummySchedules();
}

const SELECT =
  "?select=id,truck_id,driver_id,origin,destination,planned_departure,planned_arrival,actual_departure,actual_arrival,status,cargo_type,notes,created_at,trucks(plat,nama),drivers(nama)";

function fromRow(r) {
  return {
    id: r.id,
    truck_id: r.truck_id,
    plate_number: r.trucks?.plat ?? null,
    truck_name: r.trucks?.nama ?? null,
    driver_id: r.driver_id,
    driver_name: r.drivers?.nama ?? null,
    origin: r.origin,
    destination: r.destination,
    planned_departure: r.planned_departure,
    planned_arrival: r.planned_arrival,
    actual_departure: r.actual_departure,
    actual_arrival: r.actual_arrival,
    status: r.status,
    cargo_type: r.cargo_type,
    notes: r.notes,
    created_at: r.created_at,
  };
}

const WRITABLE = [
  "truck_id", "driver_id", "origin", "destination", "planned_departure",
  "planned_arrival", "actual_departure", "actual_arrival", "status",
  "cargo_type", "notes",
];
function pickWritable(input) {
  const out = {};
  for (const key of WRITABLE) if (input[key] !== undefined) out[key] = input[key];
  return out;
}

export async function listSchedules({ from, to } = {}) {
  if (supabaseReady()) {
    const filter =
      (from ? `&planned_arrival=gte.${encodeURIComponent(from)}` : "") +
      (to ? `&planned_departure=lte.${encodeURIComponent(to)}` : "");
    const rows = await baca("schedules", `${SELECT}${filter}&order=planned_departure.asc&limit=500`, ANON);
    return (rows || []).map(fromRow);
  }
  seed();
  return memory.rows.filter(
    (s) => (!from || s.planned_arrival >= from) && (!to || s.planned_departure <= to)
  );
}

export async function createSchedule(input) {
  if (supabaseReady()) {
    const rows = await tulis("schedules", "POST", SELECT, pickWritable(input));
    return fromRow(Array.isArray(rows) ? rows[0] : rows);
  }
  seed();
  const truck = getTrucks().find((t) => t.id === input.truck_id);
  const driver = getDrivers().find((d) => d.id === input.driver_id);
  const row = {
    id: randomUUID(),
    ...pickWritable(input),
    plate_number: truck?.plateNumber ?? null,
    truck_name: truck?.nama ?? null,
    driver_name: driver?.name ?? null,
    status: input.status ?? "dijadwalkan",
    actual_departure: input.actual_departure ?? null,
    actual_arrival: input.actual_arrival ?? null,
    cargo_type: input.cargo_type ?? null,
    notes: input.notes ?? null,
    created_at: new Date().toISOString(),
  };
  memory.rows.push(row);
  return row;
}

export async function updateSchedule(id, input) {
  if (supabaseReady()) {
    const rows = await tulis("schedules", "PATCH", `?id=eq.${encodeURIComponent(id)}${SELECT.replace("?", "&")}`, pickWritable(input));
    const row = Array.isArray(rows) ? rows[0] : rows;
    return row ? fromRow(row) : null;
  }
  seed();
  const index = memory.rows.findIndex((s) => s.id === id);
  if (index === -1) return null;
  const truck = input.truck_id ? getTrucks().find((t) => t.id === input.truck_id) : null;
  const driver = input.driver_id ? getDrivers().find((d) => d.id === input.driver_id) : null;
  memory.rows[index] = {
    ...memory.rows[index],
    ...pickWritable(input),
    ...(truck ? { plate_number: truck.plateNumber, truck_name: truck.nama } : {}),
    ...(driver ? { driver_name: driver.name } : {}),
  };
  return memory.rows[index];
}
