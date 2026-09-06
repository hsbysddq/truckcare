import { Route, Gauge } from "lucide-react";
import { armadaPage, tripStatusMeta } from "@/lib/content";

export default function ArmadaCard({ name, truck }) {
  const status = tripStatusMeta[truck.tripStatus];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          {name}
        </h3>
        <span
          className={`inline-flex flex-none items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 flex-none rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </div>

      <p className="mt-1 truncate whitespace-nowrap text-sm text-slate-500">
        {truck.plateNumber}
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <Route className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} />
        <span className="truncate">
          {truck.origin} → {truck.destination}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{armadaPage.progressLabel}</span>
          <span className="font-semibold text-slate-700">
            {truck.progressPct}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${truck.progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100" />

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
          <Gauge className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} />
          <span className="whitespace-nowrap">
            {truck.speedKph} {armadaPage.speedUnit}
          </span>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 flex-none items-center justify-center whitespace-nowrap rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          {armadaPage.detailButtonLabel}
        </button>
      </div>
    </div>
  );
}
