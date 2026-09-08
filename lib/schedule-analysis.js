// Analisis jadwal vs realisasi. Murni fungsi: masukan jadwal + telemetri
// truk + level solar harian, keluaran daftar penyimpangan. Dipakai halaman
// Jadwal (daftar di bawah timeline), GET /api/schedules/findings, dan
// sebagai tool agent di Chat AI ("cek_penyimpangan_jadwal").

import { jadwalPage } from "@/lib/content";

export const LATE_DEPARTURE_THRESHOLD_MIN = 30;
export const ON_TIME_ARRIVAL_TOLERANCE_MIN = 15;
export const MOVING_SPEED_THRESHOLD_KPH = 5;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export function formatTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDateShort(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatDateTime(iso) {
  if (!iso) return "-";
  return `${formatDateShort(iso)}, ${formatTime(iso)}`;
}

function localDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function minutesBetween(fromIso, toIso) {
  return Math.round((new Date(toIso) - new Date(fromIso)) / 60000);
}

export function departureDelayMinutes(schedule) {
  if (!schedule.actual_departure) return null;
  return minutesBetween(schedule.planned_departure, schedule.actual_departure);
}

export function arrivalDelayMinutes(schedule) {
  if (!schedule.actual_arrival) return null;
  return minutesBetween(schedule.planned_arrival, schedule.actual_arrival);
}

function routeLabel(s) {
  return `${s.origin} → ${s.destination}`;
}

// Jadwal yang seharusnya sedang berlangsung pada `now`.
export function isActiveAt(schedule, now) {
  if (schedule.status === "batal") return false;
  const start = new Date(schedule.actual_departure ?? schedule.planned_departure);
  const end = new Date(schedule.actual_arrival ?? schedule.planned_arrival);
  if (schedule.status === "berjalan") return true;
  return start <= now && now <= end && !schedule.actual_arrival;
}

export const SCHEDULE_STATUSES = ["dijadwalkan", "berjalan", "selesai", "terlambat", "batal"];

// Validasi payload tambah/ubah jadwal (dipakai route API). null = valid.
export function validateSchedulePayload(body) {
  const required = ["truck_id", "origin", "destination", "planned_departure", "planned_arrival"];
  for (const key of required) {
    if (!body[key] || !String(body[key]).trim()) return `${key} wajib diisi`;
  }
  const dep = new Date(body.planned_departure);
  const arr = new Date(body.planned_arrival);
  if (Number.isNaN(dep.getTime()) || Number.isNaN(arr.getTime())) return "waktu tidak valid";
  if (arr <= dep) return "planned_arrival harus setelah planned_departure";
  if (body.status && !SCHEDULE_STATUSES.includes(body.status)) return "status tidak dikenal";
  return null;
}

// Bentrok waktu untuk truk yang sama (jadwal batal diabaikan).
export function findConflicts(candidate, schedules) {
  const start = new Date(candidate.planned_departure);
  const end = new Date(candidate.planned_arrival);
  return schedules.filter((s) => {
    if (s.id === candidate.id || s.truck_id !== candidate.truck_id || s.status === "batal") return false;
    return new Date(s.planned_departure) < end && new Date(s.planned_arrival) > start;
  });
}

export function summarizeToday(schedules, now = new Date()) {
  const today = localDateKey(now);
  const todays = schedules.filter(
    (s) => localDateKey(s.planned_departure) === today && s.status !== "batal"
  );
  let onTime = 0;
  let late = 0;
  let notDeparted = 0;
  for (const s of todays) {
    const depDelay = departureDelayMinutes(s);
    const arrDelay = arrivalDelayMinutes(s);
    if (!s.actual_departure) {
      if (new Date(s.planned_departure) > now) notDeparted += 1;
      else late += 1;
      continue;
    }
    const isLate =
      s.status === "terlambat" ||
      (depDelay ?? 0) > LATE_DEPARTURE_THRESHOLD_MIN ||
      (arrDelay ?? 0) > ON_TIME_ARRIVAL_TOLERANCE_MIN;
    if (isLate) late += 1;
    else onTime += 1;
  }
  return { total: todays.length, onTime, late, notDeparted };
}

export function analyzeSchedules({ schedules, trucks = [], fuelDaily = [], now = new Date() }) {
  const copy = jadwalPage.findings.types;
  const findings = [];
  const truckById = new Map(trucks.map((t) => [t.id, t]));
  const truckByPlate = new Map(trucks.map((t) => [t.plateNumber, t]));
  const plateOf = (s) => s.plate_number ?? truckById.get(s.truck_id)?.plateNumber ?? s.truck_id;

  // 1. Keberangkatan terlambat melebihi ambang (sudah berangkat, atau belum
  //    berangkat padahal jadwal sudah lewat ambang).
  for (const s of schedules) {
    if (s.status === "batal") continue;
    const delay = departureDelayMinutes(s);
    if (delay !== null && delay > LATE_DEPARTURE_THRESHOLD_MIN) {
      findings.push({
        id: `late-${s.id}`,
        type: "lateDeparture",
        severity: "warning",
        truckId: s.truck_id,
        plateNumber: plateOf(s),
        scheduleId: s.id,
        at: s.actual_departure,
        title: copy.lateDeparture.label,
        description: fill(copy.lateDeparture.description, {
          plate: plateOf(s),
          minutes: delay,
          planned: formatDateTime(s.planned_departure),
          route: routeLabel(s),
        }),
      });
    } else if (delay === null && s.status === "dijadwalkan") {
      const overdue = minutesBetween(s.planned_departure, now.toISOString());
      if (overdue > LATE_DEPARTURE_THRESHOLD_MIN) {
        findings.push({
          id: `overdue-${s.id}`,
          type: "lateDeparture",
          severity: "warning",
          truckId: s.truck_id,
          plateNumber: plateOf(s),
          scheduleId: s.id,
          at: now.toISOString(),
          title: copy.lateDeparture.label,
          description: fill(copy.lateDeparture.pendingDescription, {
            plate: plateOf(s),
            minutes: overdue,
            planned: formatDateTime(s.planned_departure),
            route: routeLabel(s),
          }),
        });
      }
    }
  }

  // 2 & 3. Bandingkan status telemetri truk sekarang dengan jadwal aktif.
  for (const truck of trucks) {
    const active = schedules.filter((s) => s.truck_id === truck.id && isActiveAt(s, now));
    const moving = (truck.speedKph ?? 0) > MOVING_SPEED_THRESHOLD_KPH || truck.status === "bergerak";
    if (moving && active.length === 0) {
      findings.push({
        id: `moving-${truck.id}`,
        type: "movingWithoutSchedule",
        severity: "danger",
        truckId: truck.id,
        plateNumber: truck.plateNumber,
        scheduleId: null,
        at: now.toISOString(),
        title: copy.movingWithoutSchedule.label,
        description: fill(copy.movingWithoutSchedule.description, {
          plate: truck.plateNumber,
          speed: Math.round(truck.speedKph ?? 0),
        }),
      });
    }
    if (!moving && active.length > 0 && truck.status !== "insiden") {
      const s = active[0];
      findings.push({
        id: `idle-${s.id}`,
        type: "idleWhileScheduled",
        severity: "warning",
        truckId: truck.id,
        plateNumber: truck.plateNumber,
        scheduleId: s.id,
        at: now.toISOString(),
        title: copy.idleWhileScheduled.label,
        description: fill(copy.idleWhileScheduled.description, {
          plate: truck.plateNumber,
          route: routeLabel(s),
        }),
      });
    }
  }

  // 4. Solar turun tajam pada hari tanpa jadwal (truk seharusnya parkir).
  // Hanya hari yang tercakup data jadwal yang dicek, supaya hari di luar
  // rentang tidak dianggap "tanpa jadwal".
  const scheduleDates = schedules.map((s) => localDateKey(s.planned_departure)).sort();
  const firstScheduledDate = scheduleDates[0];
  const lastScheduledDate = scheduleDates[scheduleDates.length - 1];
  for (const truckFuel of fuelDaily) {
    const truck = truckByPlate.get(truckFuel.plateNumber);
    if (!truck || !firstScheduledDate) continue;
    for (const p of truckFuel.points) {
      if (!p.anomaly) continue;
      if (p.date < firstScheduledDate || p.date > lastScheduledDate) continue;
      const scheduledThatDay = schedules.some(
        (s) =>
          s.truck_id === truck.id &&
          s.status !== "batal" &&
          localDateKey(s.planned_departure) <= p.date &&
          localDateKey(s.planned_arrival) >= p.date
      );
      if (scheduledThatDay) continue;
      const liters = Math.abs(p.deltaLiters ?? 0);
      findings.push({
        id: `fuel-${truck.id}-${p.date}`,
        type: "fuelDropWhileParked",
        severity: "danger",
        truckId: truck.id,
        plateNumber: truck.plateNumber,
        scheduleId: null,
        at: `${p.date}T00:00:00`,
        title: copy.fuelDropWhileParked.label,
        description: fill(copy.fuelDropWhileParked.description, {
          plate: truck.plateNumber,
          liters,
          date: formatDateShort(`${p.date}T00:00:00`),
        }),
      });
    }
  }

  return findings.sort((a, b) => new Date(b.at) - new Date(a.at));
}

// Ringkasan teks untuk agent / chat.
export function describeFindings(findings) {
  if (findings.length === 0) return jadwalPage.findings.empty;
  return findings.map((f, i) => `${i + 1}. [${f.title}] ${f.description}`).join("\n");
}
