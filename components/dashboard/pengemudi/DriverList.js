"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Clock, Route, Search, Truck } from "lucide-react";
import { pengemudiPage, driverStatusMeta } from "@/lib/content";
import DriverStatusBadge from "@/components/dashboard/pengemudi/DriverStatusBadge";

// Inisial untuk avatar: dua huruf pertama dari dua kata pertama nama.
function inisial(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Grid kartu pengemudi (konsisten dengan halaman Armada). Status dan angka
// sudah dihitung server lewat lib/driver-status.js; komponen ini hanya
// mencari dan memfilter. Nomor telepon sengaja tidak ada di daftar.
export default function DriverList({ rows, summary, scheduleCount }) {
  const copy = pengemudiPage;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) => (status === "semua" || r.status === status) && (!q || r.name.toLowerCase().includes(q))
    );
  }, [rows, query, status]);

  const pills = [
    { key: "semua", label: copy.filterAllLabel, count: rows.length },
    ...Object.entries(driverStatusMeta).map(([key, m]) => ({ key, label: m.label, count: summary?.[key] ?? 0 })),
  ];
  const tanpaJadwal = scheduleCount === 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
          {rows.length} {copy.countBadgeSuffix}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative w-full lg:w-80">
          <span className="sr-only">{copy.searchLabel}</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="min-h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
          />
        </label>
        <div role="group" aria-label={copy.filterLabel} className="flex flex-wrap gap-2">
          {pills.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatus(f.key)}
              aria-pressed={status === f.key}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
                status === f.key
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
              <span className={`text-xs tabular-nums ${status === f.key ? "text-white/70" : "text-slate-400"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Jadwal kosong: banner saja, daftar pengemudi tetap dirender. */}
      {tanpaJadwal && rows.length > 0 && (
        <div
          role="status"
          className="mt-6 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{copy.noSchedule.message}</span>
          <Link
            href={copy.noSchedule.href}
            className="inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-300 hover:bg-amber-100 sm:min-h-9"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {copy.noSchedule.linkLabel}
          </Link>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">{copy.noDrivers}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">{copy.emptyFilter.title}</p>
          <p className="mt-1 text-sm text-slate-500">{copy.emptyFilter.hint}</p>
          {(query || status !== "semua") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("semua");
              }}
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copy.emptyFilter.resetLabel}
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id} className="flex">
              <article className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent text-sm font-bold text-white"
                    >
                      {inisial(r.name)}
                    </span>
                    <h3 className="truncate text-lg font-bold tracking-tight text-slate-900">{r.name}</h3>
                  </div>
                  <DriverStatusBadge status={r.status} />
                </div>

                <dl className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                    <dt className="sr-only">{copy.currentTruckLabel}</dt>
                    <dd className="truncate">
                      {r.currentTruck ? (
                        <span className="font-mono font-semibold text-slate-900">{r.currentTruck.plate}</span>
                      ) : (
                        <span className="text-slate-400">{copy.noTruckLabel}</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                    <dt className="sr-only">{copy.todayRouteLabel}</dt>
                    <dd className="truncate">
                      {r.todayRoute ? (
                        <>
                          {r.todayRoute.origin} {copy.routeConnector} {r.todayRoute.destination}
                          {r.todayTripCount > 1 ? ` (+${r.todayTripCount - 1})` : ""}
                        </>
                      ) : (
                        <span className="text-slate-400">{copy.noRouteLabel}</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-xs text-slate-500">{copy.stats.tripsMonthLabel}</dt>
                    <dd className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{r.tripsThisMonth}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-xs text-slate-500">{copy.stats.onTimeLabel}</dt>
                    <dd className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                      {r.onTimePct === null ? "-" : `${r.onTimePct}%`}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 border-t border-slate-100" />

                {/* gap-3 (12px) supaya tombol tidak menabrak teks jam kerja. */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
                    <Clock className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                    <span className="truncate whitespace-nowrap tabular-nums">
                      {fill(copy.stats.hoursTodayLabel, { hours: r.hoursToday })}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/pengemudi/${encodeURIComponent(r.id)}`}
                    className="inline-flex min-h-11 flex-none items-center justify-center whitespace-nowrap rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    {copy.detailButtonLabel}
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
