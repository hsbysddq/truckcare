"use client";

import { useEffect, useMemo, useState } from "react";
import { useFillViewport } from "@/components/dashboard/DashboardShell";
import Link from "next/link";
import {
  CalendarPlus,
  Kanban,
  List,
  Route,
  Search,
  Timer,
  Truck,
  UserRound,
} from "lucide-react";
import { pengemudiPage, driverStatusMeta } from "@/lib/content";
import DriverStatusBadge from "@/components/dashboard/pengemudi/DriverStatusBadge";

// Urutan kolom papan = urutan driverStatusMeta (bertugas, berhenti,
// istirahat, tidak_aktif). Status dihitung server (lib/driver-status.js).
const STATUS_ORDER = Object.keys(driverStatusMeta);
const PRIORITY = Object.fromEntries(STATUS_ORDER.map((k, i) => [k, i]));

// Warna avatar diturunkan dari nama supaya konsisten per orang.
const AVATAR_COLORS = [
  "bg-accent",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-teal-600",
  "bg-indigo-600",
];
function avatarColor(name) {
  let h = 0;
  for (const ch of String(name ?? "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function inisial(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
// UUID Supabase dipendekkan; id contoh (drv-01) apa adanya.
function idPendek(id) {
  const s = String(id ?? "");
  return /^[0-9a-f-]{36}$/i.test(s) ? s.slice(0, 8).toUpperCase() : s;
}

function DriverCard({ row }) {
  const copy = pengemudiPage;
  const bertugas = row.status === "bertugas" || row.status === "berhenti";
  return (
    <Link
      href={`/dashboard/pengemudi/${encodeURIComponent(row.id)}`}
      className={`block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-md ${
        row.status === "tidak_aktif" ? "opacity-70 hover:opacity-100" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(row.name)}`}
        >
          {inisial(row.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-slate-900">{row.name}</span>
          <span className="block truncate font-mono text-[11px] text-slate-400">
            {copy.idLabel} {idPendek(row.id)}
          </span>
        </span>
      </div>

      {bertugas && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {row.currentTruck?.plate && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono font-semibold text-slate-800">
              <Truck className="h-3 w-3 text-slate-500" strokeWidth={1.75} aria-hidden="true" />
              {row.currentTruck.plate}
            </span>
          )}
          {row.todayRoute && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Route className="h-3.5 w-3.5 flex-none text-slate-400" strokeWidth={1.75} aria-hidden="true" />
              <span className="truncate">
                {row.todayRoute.origin} → {row.todayRoute.destination}
              </span>
            </span>
          )}
        </div>
      )}

      <dl className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Route className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
          <dt className="sr-only">{copy.stats.tripsMonthLabel}</dt>
          <dd>
            <span className="font-semibold tabular-nums text-slate-800">{row.tripsThisMonth}</span>{" "}
            {copy.stats.tripsMiniLabel}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
          <dt className="sr-only">{copy.stats.onTimeLabel}</dt>
          <dd>
            <span className="font-semibold tabular-nums text-slate-800">
              {row.onTimePct === null ? "-" : `${row.onTimePct}%`}
            </span>{" "}
            {copy.stats.onTimeMiniLabel}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

function Column({ statusKey, rows }) {
  const meta = driverStatusMeta[statusKey];
  const copy = pengemudiPage;
  // Bayangan tipis di bawah header muncul setelah kolom digulir.
  const [tergulir, setTergulir] = useState(false);
  return (
    <section
      aria-label={meta.label}
      className="flex h-full min-h-0 min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/70"
    >
      <header className="relative z-10 flex flex-none items-center gap-2 px-4 py-3">
        <span className={`h-2.5 w-2.5 flex-none rounded-full ${meta.dotClass}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-900">{meta.label}</h2>
        <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600 ring-1 ring-slate-200">
          {rows.length}
        </span>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-full h-3 bg-gradient-to-b from-slate-900/10 to-transparent transition-opacity ${
            tergulir ? "opacity-100" : "opacity-0"
          }`}
        />
      </header>
      <div
        onScroll={(e) => setTergulir(e.currentTarget.scrollTop > 0)}
        className="scrollbar-halus min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3"
      >
        {rows.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300">
            <UserRound className="h-7 w-7" strokeWidth={1.25} aria-hidden="true" />
            <span className="mt-2 text-xs font-medium">{copy.columnEmpty}</span>
          </div>
        ) : (
          rows.map((r) => <DriverCard key={r.id} row={r} />)
        )}
      </div>
    </section>
  );
}

// Papan status pengemudi (kanban tanpa drag: status dihitung dari data).
export default function DriverList({ rows, summary, scheduleCount }) {
  const copy = pengemudiPage;
  const [query, setQuery] = useState("");
  const [view, setView] = useState("board");
  const [mobileFilter, setMobileFilter] = useState("semua");
  const [isSmall, setIsSmall] = useState(false);

  // Di bawah md: selalu mode daftar dengan pill filter, toggle disembunyikan.
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsSmall(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const byStatus = useMemo(() => {
    const groups = Object.fromEntries(STATUS_ORDER.map((k) => [k, []]));
    for (const r of filtered) (groups[r.status] ?? groups.tidak_aktif).push(r);
    for (const k of STATUS_ORDER) groups[k].sort((a, b) => a.name.localeCompare(b.name));
    return groups;
  }, [filtered]);

  const listRows = useMemo(() => {
    const base = isSmall && mobileFilter !== "semua" ? filtered.filter((r) => r.status === mobileFilter) : filtered;
    return [...base].sort((a, b) => PRIORITY[a.status] - PRIORITY[b.status] || a.name.localeCompare(b.name));
  }, [filtered, isSmall, mobileFilter]);

  const effectiveView = isSmall ? "list" : view;
  const tanpaJadwal = scheduleCount === 0;
  // Mode papan: halaman tidak menggulir, kolom mengisi sisa tinggi viewport.
  const modePapan = effectiveView === "board" && rows.length > 0;
  useFillViewport(modePapan);
  const ringkasan = [
    `${rows.length} ${copy.summaryUnit}`,
    ...STATUS_ORDER.map((k) => `${summary?.[k] ?? 0} ${driverStatusMeta[k].label.toLowerCase()}`),
  ].join(" · ");

  return (
    <div className={modePapan ? "flex min-h-0 flex-1 flex-col" : ""}>
      <div className="flex flex-none flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{ringkasan}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative flex-1 lg:w-72">
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
          {!isSmall && (
            <div role="group" aria-label={copy.viewToggle.groupLabel} className="hidden rounded-full border border-slate-200 bg-white p-1 md:inline-flex">
              {[
                { key: "board", label: copy.viewToggle.boardLabel, Icon: Kanban },
                { key: "list", label: copy.viewToggle.listLabel, Icon: List },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  aria-label={label}
                  title={label}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    view === key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {tanpaJadwal && rows.length > 0 && (
        <div
          role="status"
          className="mt-6 flex flex-none flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between"
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

      {isSmall && (
        <div role="group" aria-label={copy.filterLabel} className="mt-4 flex flex-wrap gap-2">
          {[{ key: "semua", label: copy.filterAllLabel, count: filtered.length }, ...STATUS_ORDER.map((k) => ({ key: k, label: driverStatusMeta[k].label, count: byStatus[k].length }))].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setMobileFilter(f.key)}
              aria-pressed={mobileFilter === f.key}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
                mobileFilter === f.key
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
              <span className={`text-xs tabular-nums ${mobileFilter === f.key ? "text-white/70" : "text-slate-400"}`}>{f.count}</span>
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">{copy.noDrivers}</p>
        </div>
      ) : effectiveView === "board" ? (
        <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-4 lg:grid-rows-1">
          {STATUS_ORDER.map((k) => (
            <div key={k} className="min-h-0">
              <Column statusKey={k} rows={byStatus[k]} />
            </div>
          ))}
        </div>
      ) : listRows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">{copy.emptyFilter.title}</p>
          <p className="mt-1 text-sm text-slate-500">{copy.emptyFilter.hint}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {listRows.map((r) => (
            <li key={r.id} className="relative">
              <DriverCard row={r} />
              <span className="pointer-events-none absolute right-4 top-4">
                <DriverStatusBadge status={r.status} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
