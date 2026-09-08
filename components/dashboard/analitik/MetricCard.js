import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { iconMap } from "@/components/icon-map";

// Warna panah mengikuti makna (goodWhen), bukan arah: insiden naik = merah,
// penyelesaian otomatis naik = hijau, metrik netral = abu.
function deltaTone(direction, goodWhen) {
  if (direction === "flat" || goodWhen === "neutral") return "text-slate-500";
  return direction === goodWhen ? "text-emerald-600" : "text-red-600";
}

export default function MetricCard({
  label,
  icon,
  value,
  subtext,
  delta,
  goodWhen = "neutral",
  compareLabel,
  noCompareLabel,
  loading = false,
}) {
  const Icon = iconMap[icon];

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6" aria-hidden="true">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 h-3 w-36 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  const DeltaIcon =
    delta?.direction === "up"
      ? ArrowUpRight
      : delta?.direction === "down"
        ? ArrowDownRight
        : Minus;
  const tone = deltaTone(delta?.direction, goodWhen);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-accent-tint text-accent">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>

      {delta && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className={`inline-flex items-center gap-1 font-semibold ${tone}`}>
            <DeltaIcon className="h-3.5 w-3.5" strokeWidth={2} />
            {delta.changePct === null
              ? "—"
              : `${delta.changePct > 0 ? "+" : ""}${delta.changePct}%`}
          </span>
          <span className="text-slate-400">
            {delta.changePct === null ? noCompareLabel : compareLabel}
          </span>
        </div>
      )}

      {subtext && <p className="mt-2 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}
