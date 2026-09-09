"use client";

import Link from "next/link";
import { AlertTriangle, Pencil } from "lucide-react";
import { jadwalPage, scheduleStatusMeta } from "@/lib/content";
import {
  formatDateTime,
  departureDelayMinutes,
  arrivalDelayMinutes,
} from "@/lib/schedule-analysis";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

function deltaLabel(minutes, copy) {
  if (minutes === null) return null;
  if (minutes > 5) return { text: fill(copy.delayLabel, { minutes }), tone: "text-amber-700" };
  if (minutes < -5) return { text: fill(copy.earlyLabel, { minutes: Math.abs(minutes) }), tone: "text-emerald-700" };
  return { text: copy.onTimeLabel, tone: "text-emerald-700" };
}

export default function ScheduleDetailPanel({ schedule, findings, onEdit }) {
  const copy = jadwalPage.panel;
  if (!schedule) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
        {copy.emptyMessage}
      </div>
    );
  }
  const meta = scheduleStatusMeta[schedule.status] ?? scheduleStatusMeta.dijadwalkan;
  const dep = deltaLabel(departureDelayMinutes(schedule), copy);
  const arr = deltaLabel(arrivalDelayMinutes(schedule), copy);
  const rows = [
    { label: copy.routeLabel, value: `${schedule.origin} → ${schedule.destination}` },
    { label: copy.truckLabel, value: `${schedule.plate_number ?? "-"}${schedule.truck_name ? ` · ${schedule.truck_name}` : ""}` },
    {
      label: copy.driverLabel,
      value:
        schedule.driver_id && schedule.driver_name ? (
          <Link
            href={`/dashboard/pengemudi/${encodeURIComponent(schedule.driver_id)}`}
            className="underline-offset-2 hover:text-accent hover:underline"
          >
            {schedule.driver_name}
          </Link>
        ) : (
          schedule.driver_name ?? "-"
        ),
    },
    { label: copy.cargoLabel, value: schedule.cargo_type ?? "-" },
  ];
  const times = [
    { label: copy.plannedDepartureLabel, value: formatDateTime(schedule.planned_departure) },
    {
      label: copy.actualDepartureLabel,
      value: schedule.actual_departure ? formatDateTime(schedule.actual_departure) : copy.notYetLabel,
      delta: dep,
    },
    { label: copy.plannedArrivalLabel, value: formatDateTime(schedule.planned_arrival) },
    {
      label: copy.actualArrivalLabel,
      value: schedule.actual_arrival ? formatDateTime(schedule.actual_arrival) : copy.notYetLabel,
      delta: arr,
    },
  ];
  const related = findings.filter((f) => f.scheduleId === schedule.id);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-slate-900">{schedule.plate_number}</p>
          <p className="text-sm text-slate-600">
            {schedule.origin} → {schedule.destination}
          </p>
        </div>
        <span
          className={`inline-flex flex-none items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
        >
          {meta.label}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="text-right font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
        {times.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="text-right">
              <span className="font-medium text-slate-900">{row.value}</span>
              {row.delta && (
                <span className={`block text-xs ${row.delta.tone}`}>{row.delta.text}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {schedule.notes && (
        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-500">{copy.notesLabel}: </span>
          {schedule.notes}
        </p>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {copy.findingsLabel}
        </p>
        {related.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{copy.noFindingsLabel}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {related.map((f) => (
              <li key={f.id} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" strokeWidth={1.75} />
                <span>
                  <span className="font-semibold">{f.title}.</span> {f.description}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => onEdit(schedule)}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
        {jadwalPage.editButtonLabel}
      </button>
    </div>
  );
}
