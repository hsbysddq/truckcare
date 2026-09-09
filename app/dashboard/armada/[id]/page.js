import Link from "next/link";
import GlossaryText from "@/components/dashboard/GlossaryText";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import { getTruckHistory } from "@/lib/data";
import { getActiveTrucks } from "@/lib/trucks";
import { truckDetailPage, truckStatusMeta } from "@/lib/content";
import TruckRouteMapLoader from "@/components/dashboard/armada/TruckRouteMapLoader";
import {
  TruckSpeedChartLoader as TruckSpeedChart,
  TruckFuelChartLoader as TruckFuelChart,
} from "@/components/dashboard/armada/TruckChartsLoader";

// Truk live dari Supabase kalau id-nya ada di sana; selain itu pakai dummy.
async function muatTruk(id) {
  // Hanya truk aktif (lib/trucks.js): truk nonaktif -> 404.
  const trucks = await getActiveTrucks();
  return trucks.find((t) => t.id === id) ?? null;
}

function formatOdometer(km) {
  if (!Number.isFinite(km)) return "-";
  return `${new Intl.NumberFormat("id-ID").format(km)} km`;
}

export default async function TruckDetailPage({ params }) {
  const { id } = await params;
  const truck = await muatTruk(id);
  if (!truck) notFound();

  const copy = truckDetailPage;
  const history = getTruckHistory(truck.id);
  const status = truckStatusMeta[truck.status] ?? truckStatusMeta.istirahat;
  const speedKph = Math.round(Number(truck.speedKph) || 0);
  const progressPct = Math.min(
    Math.max(Math.round(Number(truck.progressPct) || 0), 0),
    100
  );
  const hasPosition =
    Number.isFinite(truck.lat) && Number.isFinite(truck.lng);
  const routePath = history.routePath ?? [];
  const daySpeed = history.daySpeedHistory ?? [];
  const dayFuel = history.fuelHistory ?? [];
  const tripHistory = history.tripHistory ?? [];
  const chatHref = `/dashboard/chat?truk=${encodeURIComponent(truck.plateNumber)}`;

  const infoRows = [
    { label: copy.infoPanel.driverLabel, value: truck.driverName ?? "-" },
    { label: copy.infoPanel.typeLabel, value: truck.vehicleType ?? truck.model ?? "-" },
    {
      label: copy.infoPanel.routeLabel,
      value:
        truck.origin && truck.destination
          ? `${truck.origin} → ${truck.destination}`
          : "-",
    },
    { label: copy.infoPanel.progressLabel, value: `${progressPct}%` },
    { label: copy.infoPanel.odometerLabel, value: formatOdometer(truck.odometerKm) },
    { label: copy.infoPanel.speedLabel, value: `${speedKph} ${copy.speedChart.unit}` },
    {
      label: copy.infoPanel.fuelLabel,
      value: Number.isFinite(truck.fuelLevelPct) ? `${truck.fuelLevelPct}%` : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/armada"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        {copy.backLabel}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-900">
              {truck.plateNumber}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {truck.vehicleType ?? "-"}
            {truck.model && truck.model !== truck.vehicleType ? ` · ${truck.model}` : ""}
          </p>
        </div>
        <Link
          href={chatHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          <Bot className="h-4 w-4" strokeWidth={1.75} />
          {copy.aiButtonLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{copy.map.title}</h2>
          <div className="relative z-0 isolate mt-4 h-[380px] overflow-hidden rounded-xl">
            {routePath.length > 0 || hasPosition ? (
              <TruckRouteMapLoader
                routePath={routePath}
                position={hasPosition ? { lat: truck.lat, lng: truck.lng } : null}
                status={truck.status}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 px-6 text-center text-sm text-slate-400">
                {copy.map.emptyMessage}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              {copy.map.startLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cta" />
              {copy.map.endLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: status.markerColor }}
              />
              {copy.map.currentLabel}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {copy.infoPanel.title}
          </h2>
          <dl className="mt-4 divide-y divide-slate-100">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 py-3 text-sm">
                <dt className="text-slate-500">{row.label}</dt>
                <dd className="text-right font-medium text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{copy.speedChart.title}</h2>
          <p className="mt-1 text-sm text-slate-500"><GlossaryText text={copy.speedChart.subtitle} /></p>
          <div className="mt-4">
            {daySpeed.length > 0 ? (
              <TruckSpeedChart data={daySpeed} limitKph={copy.speedLimitKph} />
            ) : (
              <p className="flex h-64 items-center justify-center rounded-xl bg-slate-50 px-6 text-center text-sm text-slate-400">
                {copy.speedChart.emptyMessage}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{copy.fuelChart.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{copy.fuelChart.subtitle}</p>
          <div className="mt-4">
            {dayFuel.length > 0 ? (
              <TruckFuelChart data={dayFuel} />
            ) : (
              <p className="flex h-64 items-center justify-center rounded-xl bg-slate-50 px-6 text-center text-sm text-slate-400">
                {copy.fuelChart.emptyMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{copy.timelineTitle}</h2>
        {tripHistory.length > 0 ? (
          <ol className="mt-4 space-y-5 border-l border-slate-200 pl-5">
            {tripHistory.map((entry) => (
              <li key={`${entry.time}-${entry.title}`} className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-accent" />
                <p className="text-xs font-medium text-slate-400">{entry.time}</p>
                <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                <p className="text-sm text-slate-500">{entry.description}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-slate-400">{copy.timelineEmpty}</p>
        )}
      </div>
    </div>
  );
}
