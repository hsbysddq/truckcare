import Link from "next/link";
import { ArrowUpRight, Bot, Fuel } from "lucide-react";
import { overviewPage, truckStatusMeta } from "@/lib/content";

export default function TruckDetailPanel({ truck, history }) {
  const { detailPanel } = overviewPage;

  if (!truck) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        {detailPanel.emptyStateMessage}
      </div>
    );
  }

  const status = truckStatusMeta[truck.status] ?? truckStatusMeta.istirahat;
  const speedPoints = history?.speedHistory ?? [];
  const maxSpeed = Math.max(...speedPoints.map((point) => point.speedKph), 1);
  const detailHref = `/dashboard/armada/${truck.id}`;
  const chatHref = `/dashboard/chat?truk=${encodeURIComponent(truck.plateNumber)}`;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
        >
          {status.label}
        </span>
        <span className="text-xs text-slate-400">{truck.lastUpdate ?? "-"}</span>
      </div>

      {/* Plat + nama truk menjadi tautan ke halaman detail (menggantikan
          tombol "Lihat Detail"). */}
      <Link
        href={detailHref}
        title={detailPanel.detailLinkLabel}
        className="group mt-4 -mx-2 flex cursor-pointer items-start justify-between gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-slate-50"
      >
        <span className="min-w-0">
          <span className="block text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-accent">
            {truck.plateNumber}
          </span>
          <span className="block text-sm text-slate-500">
            {truck.vehicleType ?? "-"}
            {truck.model && truck.model !== truck.vehicleType ? ` · ${truck.model}` : ""}
          </span>
        </span>
        <ArrowUpRight
          className="mt-1 h-5 w-5 flex-none text-slate-300 transition-colors group-hover:text-accent"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className="sr-only">{detailPanel.detailLinkLabel}</span>
      </Link>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-400">{detailPanel.driverLabel}</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {truck.driverId && truck.driverName ? (
              <Link
                href={`/dashboard/pengemudi/${encodeURIComponent(truck.driverId)}`}
                className="underline-offset-2 hover:text-accent hover:underline"
              >
                {truck.driverName}
              </Link>
            ) : (
              truck.driverName ?? "-"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">{detailPanel.speedLabel}</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {truck.speedKph ?? 0} {detailPanel.speedUnit}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        <Fuel className="h-4 w-4 flex-none" strokeWidth={1.75} />
        {detailPanel.fuelLabel}: {truck.fuelLevelPct ?? "-"}%
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {detailPanel.speedChartTitle}
        </p>
        <div className="mt-3 flex h-24 items-end gap-1">
          {speedPoints.map((point) => (
            <div
              key={point.label}
              className="min-h-1 flex-1 rounded-t bg-accent/80"
              style={{ height: `${Math.max((point.speedKph / maxSpeed) * 100, 4)}%` }}
              title={`${point.label}: ${point.speedKph} km/jam`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {detailPanel.historyTitle}
        </p>
        <ol className="mt-3 space-y-4 border-l border-slate-200 pl-4">
          {(history?.tripHistory ?? []).map((entry) => (
            <li key={entry.time} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-accent" />
              <p className="text-xs font-medium text-slate-400">
                {entry.time}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {entry.title}
              </p>
              <p className="text-sm text-slate-500">{entry.description}</p>
            </li>
          ))}
        </ol>
      </div>

      <Link
        href={chatHref}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        <Bot className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        {detailPanel.aiButtonLabel}
      </Link>
    </div>
  );
}
