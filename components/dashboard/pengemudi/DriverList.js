"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Route, Search, Truck } from "lucide-react";
import { pengemudiPage, driverStatusMeta } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import DriverStatusBadge from "@/components/dashboard/pengemudi/DriverStatusBadge";

const TONE = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-slate-100 text-slate-600",
};

// Daftar pengemudi. Status/angka sudah dihitung di server
// (lib/driver-status.js); komponen ini hanya mencari dan memfilter.
// Nomor telepon sengaja tidak ada di daftar (privasi).
export default function DriverList({ rows, summary }) {
  const copy = pengemudiPage;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) => (status === "semua" || r.status === status) && (!q || r.name.toLowerCase().includes(q))
    );
  }, [rows, query, status]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {copy.summary.map((card) => {
          const Icon = iconMap[card.icon];
          return (
            <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${
                    TONE[card.tone] ?? "bg-accent-tint text-accent"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {summary[card.key] ?? 0}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
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
          {[{ key: "semua", label: copy.filterAllLabel }, ...Object.entries(driverStatusMeta).map(([key, m]) => ({ key, label: m.label }))].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatus(f.key)}
              aria-pressed={status === f.key}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                status === f.key
                  ? "border-accent bg-accent text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:text-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          {copy.emptyMessage}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/dashboard/pengemudi/${encodeURIComponent(r.id)}`}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-accent/40 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold tracking-tight text-slate-900 group-hover:text-accent">
                      {r.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {r.tripsThisMonth} {copy.tripsMonthLabel}
                    </p>
                  </div>
                  <DriverStatusBadge status={r.status} />
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Truck className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} />
                    <dt className="sr-only">{copy.currentTruckLabel}</dt>
                    <dd className="truncate">
                      {r.currentTruck ? (
                        <>
                          <span className="font-mono font-semibold text-slate-900">{r.currentTruck.plate}</span>
                          {r.currentTruck.name ? ` · ${r.currentTruck.name}` : ""}
                        </>
                      ) : (
                        <span className="text-slate-400">{copy.noTruckLabel}</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Route className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} />
                    <dt className="sr-only">{copy.todayRouteLabel}</dt>
                    <dd className="truncate">
                      {r.todayRoute ?? <span className="text-slate-400">{copy.noRouteLabel}</span>}
                      {r.todayTripCount > 1 ? ` (+${r.todayTripCount - 1})` : ""}
                    </dd>
                  </div>
                </dl>

                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {copy.detailLinkLabel}
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
