// Status dan ringkasan pengemudi DIHITUNG dari data, tidak disimpan:
//   - jadwal (tabel schedules: driver_id, truck_id, planned_*, actual_*, status)
//   - telemetri truk (shape lib/data.js / getTrucksShape: status, speedKph)
//   - pengaduan (plat + waktu kejadian) untuk daftar pengaduan terkait
// Semua fungsi murni (tanpa I/O) supaya bisa dipakai server maupun client.

import {
  LATE_DEPARTURE_THRESHOLD_MIN,
  MOVING_SPEED_THRESHOLD_KPH,
  departureDelayMinutes,
} from "./schedule-analysis.js";
import { plateKey, incidentDateKey } from "./format.js";

export const DRIVER_STATUSES = ["bertugas", "berhenti", "istirahat", "tidak_aktif"];
const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 7;

export function localDateKey(input) {
  const d = input instanceof Date ? input : new Date(input);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isCancelled(s) {
  return s.status === "batal";
}

// Jadwal yang sedang berlangsung: berstatus berjalan, sudah berangkat tapi
// belum tiba, atau waktu sekarang berada di dalam rentang rencananya.
export function isScheduleActive(s, now) {
  if (isCancelled(s) || s.status === "selesai") return false;
  if (s.status === "berjalan") return true;
  if (s.actual_departure && !s.actual_arrival) return true;
  const dep = new Date(s.planned_departure);
  const arr = new Date(s.planned_arrival);
  return dep <= now && now <= arr;
}

export function isTruckMoving(truck) {
  if (!truck) return false;
  if (Number(truck.speedKph) > MOVING_SPEED_THRESHOLD_KPH) return true;
  return truck.status === "bergerak";
}

export function activeScheduleFor(driverId, schedules, now) {
  return (
    schedules.find((s) => s.driver_id === driverId && isScheduleActive(s, now)) ?? null
  );
}

// Aturan status:
//   bertugas    - ada jadwal aktif dan telemetri truknya bergerak
//   berhenti    - ada jadwal aktif tetapi truk tercatat diam
//   istirahat   - tidak ada jadwal aktif, tetapi ada jadwal hari ini atau
//                 dalam 7 hari terakhir
//   tidak_aktif - tidak ada jadwal sama sekali dalam 7 hari terakhir
export function computeDriverStatus({ driverId, schedules, trucksById, now = new Date() }) {
  const mine = schedules.filter((s) => s.driver_id === driverId && !isCancelled(s));
  const active = mine.find((s) => isScheduleActive(s, now));
  if (active) {
    const truck = trucksById.get(active.truck_id);
    return isTruckMoving(truck) ? "bertugas" : "berhenti";
  }
  const today = localDateKey(now);
  const since = now.getTime() - RECENT_DAYS * DAY_MS;
  const recent = mine.some((s) => {
    const dep = new Date(s.planned_departure);
    return localDateKey(dep) === today || (dep.getTime() >= since && dep <= now);
  });
  return recent ? "istirahat" : "tidak_aktif";
}

function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function hasDeparted(s, now) {
  return Boolean(s.actual_departure) || new Date(s.planned_departure) <= now;
}

function routeLabel(s) {
  return `${s.origin} → ${s.destination}`;
}

function truckLabel(s, trucksById) {
  const truck = trucksById.get(s.truck_id);
  return {
    id: s.truck_id,
    plate: s.plate_number ?? truck?.plateNumber ?? null,
    name: s.truck_name ?? truck?.nama ?? null,
  };
}

// Baris daftar pengemudi. Tidak menyertakan nomor telepon (privasi).
export function buildDriverOverview({ drivers, schedules, trucks, now = new Date() }) {
  const trucksById = new Map(trucks.map((t) => [t.id, t]));
  const today = localDateKey(now);
  const rows = drivers.map((driver) => {
    const mine = schedules.filter((s) => s.driver_id === driver.id && !isCancelled(s));
    const status = computeDriverStatus({ driverId: driver.id, schedules, trucksById, now });
    const active = mine.find((s) => isScheduleActive(s, now)) ?? null;
    const todays = mine
      .filter((s) => localDateKey(s.planned_departure) === today)
      .sort((a, b) => a.planned_departure.localeCompare(b.planned_departure));
    const tripsThisMonth = mine.filter(
      (s) => sameMonth(new Date(s.planned_departure), now) && hasDeparted(s, now)
    ).length;
    // Tepat waktu: berangkat maksimal LATE_DEPARTURE_THRESHOLD_MIN dari rencana,
    // dihitung dari perjalanan yang punya waktu berangkat aktual.
    const withActual = mine.filter((s) => s.actual_departure);
    const onTimeCount = withActual.filter(
      (s) => (departureDelayMinutes(s) ?? 0) <= LATE_DEPARTURE_THRESHOLD_MIN
    ).length;
    const onTimePct = withActual.length ? Math.round((onTimeCount / withActual.length) * 100) : null;
    // Jam kerja hari ini: durasi perjalanan hari ini yang sudah berangkat
    // (realisasi bila ada; perjalanan berjalan dihitung sampai sekarang).
    const hoursToday =
      Math.round(
        (todays.reduce((sum, s) => {
          if (!hasDeparted(s, now)) return sum;
          const start = new Date(s.actual_departure ?? s.planned_departure);
          const end = s.actual_arrival
            ? new Date(s.actual_arrival)
            : new Date(Math.min(now.getTime(), new Date(s.planned_arrival).getTime()));
          return sum + Math.max(end - start, 0);
        }, 0) /
          3600000) *
          10
      ) / 10;
    return {
      id: driver.id,
      name: driver.name,
      status,
      currentTruck: active ? truckLabel(active, trucksById) : null,
      todayRoute: todays.length
        ? { origin: todays[0].origin, destination: todays[0].destination, label: routeLabel(todays[0]) }
        : null,
      todayTripCount: todays.length,
      tripsThisMonth,
      onTimePct,
      hoursToday,
    };
  });
  const summary = { total: rows.length, bertugas: 0, berhenti: 0, istirahat: 0, tidak_aktif: 0 };
  for (const r of rows) summary[r.status] += 1;
  // scheduleCount 0 = belum ada data jadwal, status tidak bermakna.
  return { rows, summary, scheduleCount: schedules.length };
}

// Pengaduan terkait: plat laporan sama dengan truk yang dibawa pengemudi ini
// pada tanggal kejadian (menurut jadwal). Pencocokan detail tetap urusan agent.
export function relatedComplaintsFor(driverSchedules, complaints, trucksById) {
  const byDate = new Map(); // dateKey -> Set(plateKey)
  for (const s of driverSchedules) {
    if (isCancelled(s)) continue;
    const plate = s.plate_number ?? trucksById.get(s.truck_id)?.plateNumber;
    if (!plate) continue;
    const key = localDateKey(s.planned_departure);
    if (!byDate.has(key)) byDate.set(key, new Set());
    byDate.get(key).add(plateKey(plate));
  }
  return complaints.filter((c) => {
    const key = incidentDateKey(c.incidentAt);
    return key && byDate.get(key)?.has(plateKey(c.plateNumber));
  });
}

export function buildDriverDetail({ driver, schedules, trucks, complaints = [], now = new Date() }) {
  const trucksById = new Map(trucks.map((t) => [t.id, t]));
  const mine = schedules
    .filter((s) => s.driver_id === driver.id)
    .sort((a, b) => b.planned_departure.localeCompare(a.planned_departure));
  const valid = mine.filter((s) => !isCancelled(s));
  const status = computeDriverStatus({ driverId: driver.id, schedules, trucksById, now });
  const active = valid.find((s) => isScheduleActive(s, now)) ?? null;

  const departed = valid.filter((s) => hasDeparted(s, now));
  const withActual = departed.filter((s) => s.actual_departure);
  const onTime = withActual.filter(
    (s) => (departureDelayMinutes(s) ?? 0) <= LATE_DEPARTURE_THRESHOLD_MIN
  ).length;
  const onTimePct = withActual.length ? Math.round((onTime / withActual.length) * 100) : null;

  const thisMonth = departed.filter((s) => sameMonth(new Date(s.planned_departure), now));
  const hoursThisMonth =
    Math.round(
      (thisMonth.reduce((sum, s) => {
        const start = new Date(s.actual_departure ?? s.planned_departure);
        const end = new Date(s.actual_arrival ?? s.planned_arrival);
        return sum + Math.max(end - start, 0);
      }, 0) /
        3600000) *
        10
    ) / 10;

  const history = mine.map((s) => {
    const delay = departureDelayMinutes(s);
    return {
      id: s.id,
      date: localDateKey(s.planned_departure),
      truck: truckLabel(s, trucksById),
      route: routeLabel(s),
      plannedDeparture: s.planned_departure,
      actualDeparture: s.actual_departure,
      plannedArrival: s.planned_arrival,
      actualArrival: s.actual_arrival,
      status: s.status,
      delayMinutes: delay,
      onTime: isCancelled(s) || delay === null ? null : delay <= LATE_DEPARTURE_THRESHOLD_MIN,
    };
  });

  const dailyTrips = [];
  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date(now.getTime() - i * DAY_MS);
    const key = localDateKey(day);
    dailyTrips.push({
      date: key,
      label: `${day.getDate()}/${day.getMonth() + 1}`,
      count: valid.filter((s) => localDateKey(s.planned_departure) === key && hasDeparted(s, now)).length,
    });
  }

  const related = relatedComplaintsFor(mine, complaints, trucksById);

  return {
    driver: { id: driver.id, name: driver.name, phone: driver.phone ?? null },
    status,
    currentTruck: active ? truckLabel(active, trucksById) : null,
    summary: {
      totalTrips: departed.length,
      onTimePct,
      complaints: related.length,
      hoursThisMonth,
    },
    history,
    dailyTrips,
    complaints: related,
  };
}

// Sisipkan pengemudi yang sedang membawa truk (dari jadwal aktif) ke shape
// truk, supaya nama pengemudi di Armada/Overview/Jadwal bisa ditautkan.
export function attachCurrentDrivers(trucks, schedules, driversById = new Map(), now = new Date()) {
  return trucks.map((truck) => {
    const active = schedules.find((s) => s.truck_id === truck.id && isScheduleActive(s, now));
    if (!active?.driver_id) return truck;
    const driver = driversById.get(active.driver_id);
    return {
      ...truck,
      driverId: active.driver_id,
      driverName: active.driver_name ?? driver?.name ?? truck.driverName ?? null,
    };
  });
}
