"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { driverDetailPage, jadwalPage, scheduleStatusMeta } from "@/lib/content";
import { formatTime, formatDateShort } from "@/lib/schedule-analysis";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

function Punctuality({ row }) {
  const copy = driverDetailPage.history;
  if (row.status === "batal") {
    return <span className="text-xs font-semibold text-slate-400">{copy.cancelled}</span>;
  }
  if (row.onTime === null) {
    return <span className="text-xs font-semibold text-slate-400">{copy.notDeparted}</span>;
  }
  return row.onTime ? (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      {copy.onTime}
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      {fill(copy.late, { minutes: row.delayMinutes })}
    </span>
  );
}

// Riwayat kerja per perjalanan (baris = satu jadwal), filter rentang tanggal
// dan paginasi di sisi klien. Data dihitung di lib/driver-status.js.
export default function DriverHistory({ rows }) {
  const copy = driverDetailPage.history;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => rows.filter((r) => (!from || r.date >= from) && (!to || r.date <= to)),
    [rows, from, to]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / copy.perPage));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * copy.perPage, current * copy.perPage);

  const input =
    "min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-slate-500">
            {copy.fromLabel}
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={`mt-1 block ${input}`} />
          </label>
          <label className="text-xs font-medium text-slate-500">
            {copy.toLabel}
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={`mt-1 block ${input}`} />
          </label>
          {(from || to) && (
            <button
              type="button"
              onClick={() => { setFrom(""); setTo(""); setPage(1); }}
              className="min-h-11 rounded-full px-3 text-sm font-semibold text-accent hover:bg-accent-tint"
            >
              {copy.resetLabel}
            </button>
          )}
        </div>
      </div>

      {pageRows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">{copy.empty}</p>
      ) : (
        <>
          {/* Tabel di layar lebar */}
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-3">{copy.columns.date}</th>
                  <th className="py-2 pr-3">{copy.columns.truck}</th>
                  <th className="py-2 pr-3">{copy.columns.route}</th>
                  <th className="py-2 pr-3">{copy.columns.planned}</th>
                  <th className="py-2 pr-3">{copy.columns.actual}</th>
                  <th className="py-2">{copy.columns.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-3 whitespace-nowrap text-slate-700">{formatDateShort(r.plannedDeparture)}</td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {r.truck.plate ? (
                        <Link href={`/dashboard/armada/${encodeURIComponent(r.truck.id)}`} className="font-mono font-semibold text-slate-900 hover:text-accent">
                          {r.truck.plate}
                        </Link>
                      ) : "-"}
                    </td>
                    <td className="py-3 pr-3 text-slate-700">{r.route}</td>
                    <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-slate-700">{formatTime(r.plannedDeparture)}</td>
                    <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-slate-700">
                      {r.actualDeparture ? formatTime(r.actualDeparture) : "-"}
                    </td>
                    <td className="py-3"><Punctuality row={r} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu di layar kecil */}
          <ul className="mt-4 space-y-3 md:hidden">
            {pageRows.map((r) => {
              const meta = scheduleStatusMeta[r.status] ?? scheduleStatusMeta.dijadwalkan;
              return (
                <li key={r.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">{formatDateShort(r.plannedDeparture)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}>{meta.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-900">
                    {r.truck.plate ? (
                      <Link href={`/dashboard/armada/${encodeURIComponent(r.truck.id)}`} className="font-mono font-semibold hover:text-accent">
                        {r.truck.plate}
                      </Link>
                    ) : "-"}
                    <span className="text-slate-500"> · {r.route}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {jadwalPage.timeline.plannedLabel} {formatTime(r.plannedDeparture)}
                    {" · "}
                    {jadwalPage.timeline.actualLabel} {r.actualDeparture ? formatTime(r.actualDeparture) : "-"}
                  </p>
                  <div className="mt-2"><Punctuality row={r} /></div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span>{fill(copy.pageLabel, { page: current, total: totalPages })}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current <= 1}
                aria-label={copy.prev}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current >= totalPages}
                aria-label={copy.next}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
