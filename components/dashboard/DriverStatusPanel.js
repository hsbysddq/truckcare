"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Route, Truck } from "lucide-react";
import { overviewPage, driverStatusMeta } from "@/lib/content";
import DriverStatusBadge from "@/components/dashboard/pengemudi/DriverStatusBadge";

// Urutan prioritas tampil: yang sedang bertugas dulu.
const PRIORITY = { bertugas: 0, berhenti: 1, istirahat: 2, tidak_aktif: 3 };

// Panel "Status Pengemudi" di Overview. Data (status terhitung, ringkasan)
// datang dari /api/drivers -> lib/driver-status.js; komponen ini hanya
// mengurutkan, memotong 6 teratas, dan menyorot pengemudi truk terpilih.
export default function DriverStatusPanel({ data, loading, error, selectedTruckId }) {
  const copy = overviewPage.driverPanel;
  const rows = data?.rows ?? [];
  const summary = data?.summary ?? null;

  const top = useMemo(
    () =>
      [...rows]
        .sort((a, b) => PRIORITY[a.status] - PRIORITY[b.status] || a.name.localeCompare(b.name))
        .slice(0, copy.maxRows),
    [rows, copy.maxRows]
  );

  const noSchedules = data && data.scheduleCount === 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{copy.subtitle}</p>
        </div>
        <Link
          href="/dashboard/pengemudi"
          className="inline-flex min-h-11 flex-none items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          {copy.viewAllLabel}
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      {summary && !noSchedules && (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(driverStatusMeta).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className={`h-2 w-2 flex-none rounded-full ${meta.dotClass}`} aria-hidden="true" />
              <dt className="truncate text-xs text-slate-500">{meta.label}</dt>
              <dd className="ml-auto text-sm font-bold tabular-nums text-slate-900">
                {summary[key] ?? 0}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {copy.errorMessage}
          </p>
        ) : noSchedules ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {copy.noScheduleMessage}
          </p>
        ) : top.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {copy.noDriverMessage}
          </p>
        ) : (
          <ul className="max-h-[22rem] divide-y divide-slate-100 overflow-y-auto lg:max-h-none">
            {top.map((r) => {
              const highlighted = Boolean(selectedTruckId) && r.currentTruck?.id === selectedTruckId;
              return (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/pengemudi/${encodeURIComponent(r.id)}`}
                    aria-current={highlighted ? "true" : undefined}
                    className={`-mx-2 flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
                      highlighted ? "bg-accent-tint" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{r.name}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        {r.currentTruck && (
                          <span className="inline-flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                            <span className="font-mono font-semibold text-slate-700">{r.currentTruck.plate}</span>
                          </span>
                        )}
                        {r.currentTruck && r.todayRoute && (
                          <span className="inline-flex items-center gap-1">
                            <Route className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                            {r.todayRoute.label}
                          </span>
                        )}
                      </span>
                    </span>
                    <DriverStatusBadge status={r.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
