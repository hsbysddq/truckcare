"use client";

import { jadwalPage, scheduleStatusMeta } from "@/lib/content";
import { formatTime, formatDateShort } from "@/lib/schedule-analysis";

// Tampilan layar kecil: kartu per hari, digulir vertikal.
export default function ScheduleDayList({ schedules, selectedId, onSelect }) {
  const copy = jadwalPage;
  const groups = new Map();
  for (const s of schedules) {
    const key = new Date(s.planned_departure).toDateString();
    if (!groups.has(key)) groups.set(key, { date: s.planned_departure, items: [] });
    groups.get(key).items.push(s);
  }

  if (groups.size === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
        {copy.timeline.noSchedules}
      </p>
    );
  }

  return (
    <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
      {[...groups.values()].map((group) => (
        <section key={group.date}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {formatDateShort(group.date)}
          </h3>
          <div className="mt-2 space-y-2">
            {group.items.map((s) => {
              const meta = scheduleStatusMeta[s.status] ?? scheduleStatusMeta.dijadwalkan;
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={`w-full rounded-xl border bg-white p-3 text-left ${
                    active ? "border-2 border-accent" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-900">
                      {s.plate_number}
                    </span>
                    <span
                      className={`inline-flex flex-none items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
                    {s.origin} → {s.destination}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {copy.timeline.plannedLabel} {formatTime(s.planned_departure)}–{formatTime(s.planned_arrival)}
                    {s.actual_departure && (
                      <>
                        {" · "}
                        {copy.timeline.actualLabel} {formatTime(s.actual_departure)}–
                        {s.actual_arrival ? formatTime(s.actual_arrival) : copy.panel.notYetLabel}
                      </>
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
