"use client";

import Link from "next/link";
import { jadwalPage, scheduleStatusMeta } from "@/lib/content";
import { formatTime, formatDateShort } from "@/lib/schedule-analysis";

const LABEL_COL = 160;
const ROW_H = 56;
const MIN_WIDTH = { day: 900, week: 1100, month: 1600 };

function buildTicks(range, view) {
  const ticks = [];
  const cursor = new Date(range.start);
  if (view === "day") {
    for (let h = 0; h <= 24; h += 2) {
      const t = new Date(range.start);
      t.setHours(h, 0, 0, 0);
      ticks.push({ at: t, label: `${String(h % 24).padStart(2, "0")}:00` });
    }
    return ticks;
  }
  const step = view === "week" ? 1 : 3;
  while (cursor <= range.end) {
    ticks.push({ at: new Date(cursor), label: formatDateShort(cursor.toISOString()) });
    cursor.setDate(cursor.getDate() + step);
  }
  return ticks;
}

export default function ScheduleTimeline({
  trucks,
  schedules,
  range,
  view,
  now,
  selectedId,
  onSelect,
}) {
  const copy = jadwalPage.timeline;
  const total = range.end - range.start;
  const pct = (iso) => Math.min(100, Math.max(0, ((new Date(iso) - range.start) / total) * 100));
  const ticks = buildTicks(range, view);
  const nowPct = now >= range.start && now <= range.end ? pct(now.toISOString()) : null;
  const byTruck = new Map(trucks.map((t) => [t.id, []]));
  for (const s of schedules) {
    if (!byTruck.has(s.truck_id)) byTruck.set(s.truck_id, []);
    byTruck.get(s.truck_id).push(s);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <div style={{ minWidth: MIN_WIDTH[view] }}>
        <div className="flex border-b border-slate-200 bg-slate-50">
          <div
            className="sticky left-0 z-20 flex-none border-r border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400"
            style={{ width: LABEL_COL }}
          >
            {copy.truckColumnLabel}
          </div>
          <div className="relative h-9 flex-1">
            {ticks.map((tick, i) => {
              const left = pct(tick.at.toISOString());
              // Label pertama/terakhir ditempel ke tepi supaya tidak terpotong.
              const align =
                i === 0 ? "translate-x-1" : left >= 99 ? "-translate-x-full -ml-1" : "-translate-x-1/2";
              return (
                <span
                  key={tick.at.toISOString()}
                  className={`absolute top-2 text-[11px] text-slate-500 ${align}`}
                  style={{ left: `${left}%` }}
                >
                  {tick.label}
                </span>
              );
            })}
            {nowPct !== null && (
              <span
                className="absolute top-0 -translate-x-1/2 rounded-b-md bg-cta px-1.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ left: `${nowPct}%` }}
              >
                {copy.nowLabel}
              </span>
            )}
          </div>
        </div>

        {trucks.map((truck) => {
          const rows = byTruck.get(truck.id) ?? [];
          return (
            <div key={truck.id} className="flex border-b border-slate-100 last:border-0">
              <div
                className="sticky left-0 z-20 flex flex-none flex-col justify-center border-r border-slate-200 bg-white px-4"
                style={{ width: LABEL_COL, height: ROW_H }}
              >
                <span className="font-mono text-sm font-semibold text-slate-900">
                  {truck.plateNumber}
                </span>
                {truck.driverId && truck.driverName ? (
                  <Link
                    href={`/dashboard/pengemudi/${encodeURIComponent(truck.driverId)}`}
                    className="truncate text-[11px] text-slate-500 underline-offset-2 hover:text-accent hover:underline"
                  >
                    {truck.driverName}
                  </Link>
                ) : (
                  <span className="truncate text-[11px] text-slate-500">
                    {truck.driverName ?? truck.nama ?? ""}
                  </span>
                )}
              </div>
              <div className="relative flex-1" style={{ height: ROW_H }}>
                {ticks.map((tick) => (
                  <span
                    key={tick.at.toISOString()}
                    className="absolute inset-y-0 w-px bg-slate-100"
                    style={{ left: `${pct(tick.at.toISOString())}%` }}
                  />
                ))}
                {nowPct !== null && (
                  <span
                    className="absolute inset-y-0 z-10 w-px bg-cta"
                    style={{ left: `${nowPct}%` }}
                  />
                )}
                {rows.length === 0 && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-300">
                    {copy.emptyRow}
                  </span>
                )}
                {rows.map((s) => {
                  const meta = scheduleStatusMeta[s.status] ?? scheduleStatusMeta.dijadwalkan;
                  const left = pct(s.planned_departure);
                  const width = Math.max(pct(s.planned_arrival) - left, 0.6);
                  const active = s.id === selectedId;
                  const actualStart = s.actual_departure ? pct(s.actual_departure) : null;
                  const actualEnd =
                    s.actual_departure
                      ? pct(s.actual_arrival ?? (now < range.end ? now.toISOString() : range.end.toISOString()))
                      : null;
                  const showLabel = width > 9;
                  return (
                    <div key={s.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(s.id)}
                        aria-label={`${s.plate_number ?? truck.plateNumber} ${s.origin} ke ${s.destination}, ${formatTime(s.planned_departure)}–${formatTime(s.planned_arrival)}`}
                        aria-pressed={active}
                        title={`${copy.plannedLabel}: ${formatTime(s.planned_departure)}–${formatTime(s.planned_arrival)}`}
                        className={`absolute top-2 h-5 rounded-md text-left transition-shadow ${meta.barClass} ${
                          active ? "ring-2 ring-offset-1 ring-slate-900" : "hover:ring-2 hover:ring-slate-300"
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        {showLabel && (
                          <span className="block truncate px-2 text-[11px] font-semibold leading-5 text-white">
                            {s.origin} → {s.destination}
                          </span>
                        )}
                      </button>
                      {actualStart !== null && (
                        <span
                          aria-hidden="true"
                          title={`${copy.actualLabel}: ${formatTime(s.actual_departure)}–${s.actual_arrival ? formatTime(s.actual_arrival) : copy.nowLabel}`}
                          className={`absolute top-9 h-1.5 rounded-full opacity-80 ${meta.barClass}`}
                          style={{ left: `${actualStart}%`, width: `${Math.max(actualEnd - actualStart, 0.4)}%` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
