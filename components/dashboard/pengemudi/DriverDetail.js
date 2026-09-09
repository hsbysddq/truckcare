import Link from "next/link";
import { ArrowLeft, Phone, Truck } from "lucide-react";
import { driverDetailPage, complaintStatusMeta } from "@/lib/content";
import { formatTicketId } from "@/lib/format";
import DriverStatusBadge from "@/components/dashboard/pengemudi/DriverStatusBadge";
import DriverHistory from "@/components/dashboard/pengemudi/DriverHistory";
import DriverTripsChart from "@/components/dashboard/pengemudi/DriverTripsChart";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Server component: seluruh angka sudah dihitung lib/driver-status.js.
// Nomor telepon hanya tampil di sini, tidak di daftar.
export default function DriverDetail({ detail }) {
  const copy = driverDetailPage;
  const { driver, status, currentTruck, summary, history, dailyTrips, complaints } = detail;

  const cards = copy.summary.map((card) => {
    const value = summary[card.key];
    return {
      ...card,
      display: value === null || value === undefined ? "-" : `${value}${card.suffix ?? ""}`,
    };
  });

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/pengemudi"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        {copy.backLabel}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{driver.name}</h1>
            <DriverStatusBadge status={status} />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
              {currentTruck ? (
                <>
                  {copy.currentTruckLabel}{" "}
                  <Link
                    href={`/dashboard/armada/${encodeURIComponent(currentTruck.id)}`}
                    className="font-mono font-semibold text-slate-900 hover:text-accent"
                  >
                    {currentTruck.plate}
                  </Link>
                  {currentTruck.name ? ` · ${currentTruck.name}` : ""}
                </>
              ) : (
                copy.noCurrentTruck
              )}
            </span>
            {driver.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                {copy.phoneLabel}: {driver.phone}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{card.display}</p>
            {card.hint && <p className="mt-1 text-xs text-slate-400">{card.hint}</p>}
          </div>
        ))}
      </div>

      <DriverHistory rows={history} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{copy.chart.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{copy.chart.subtitle}</p>
          <div className="mt-4">
            <DriverTripsChart data={dailyTrips} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{copy.complaints.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{copy.complaints.subtitle}</p>
          {complaints.length === 0 ? (
            <p className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              {copy.complaints.empty}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {complaints.map((c) => {
                const meta = complaintStatusMeta[c.status] ?? complaintStatusMeta.pending;
                return (
                  <li key={c.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {formatTicketId(c.id)} · <span className="font-mono">{c.plateNumber}</span> · {c.incidentAt}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-800">{c.judul ?? c.reporterNote}</p>
                    {c.agentReasoning && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        <span className="font-semibold">{copy.complaints.resultLabel}: </span>
                        {c.agentReasoning}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
