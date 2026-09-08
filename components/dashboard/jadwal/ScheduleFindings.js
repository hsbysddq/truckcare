"use client";

import { AlertTriangle, Fuel, Navigation, PauseCircle } from "lucide-react";
import { jadwalPage } from "@/lib/content";
import { formatDateTime } from "@/lib/schedule-analysis";

const ICONS = {
  lateDeparture: AlertTriangle,
  movingWithoutSchedule: Navigation,
  idleWhileScheduled: PauseCircle,
  fuelDropWhileParked: Fuel,
};

export default function ScheduleFindings({ findings, onSelectSchedule }) {
  const copy = jadwalPage.findings;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{copy.subtitle}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {findings.length}
        </span>
      </div>

      {findings.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
          {copy.empty}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {findings.map((f) => {
            const Icon = ICONS[f.type] ?? AlertTriangle;
            const danger = f.severity === "danger";
            const Wrapper = f.scheduleId ? "button" : "div";
            return (
              <li key={f.id}>
                <Wrapper
                  {...(f.scheduleId
                    ? { type: "button", onClick: () => onSelectSchedule(f.scheduleId) }
                    : {})}
                  className={`flex w-full gap-3 py-3 text-left ${f.scheduleId ? "hover:bg-slate-50" : ""}`}
                >
                  <span
                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${
                      danger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className="text-sm font-semibold text-slate-900">{f.title}</span>
                      <span className="font-mono text-xs text-slate-500">{f.plateNumber}</span>
                      <span className="text-xs text-slate-400">{formatDateTime(f.at)}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">{f.description}</span>
                  </span>
                </Wrapper>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
