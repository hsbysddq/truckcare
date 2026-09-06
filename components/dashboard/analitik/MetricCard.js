import { iconMap } from "@/components/icon-map";

export default function MetricCard({ label, icon, value, subtext }) {
  const Icon = iconMap[icon];

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
      {subtext && <p className="mt-3 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}
