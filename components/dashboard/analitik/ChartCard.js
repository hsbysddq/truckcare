import { Lightbulb, SearchX } from "lucide-react";
import { analitikPage } from "@/lib/content";

// Kartu grafik seragam: judul, satu kalimat penjelasan, grafik, lalu satu
// baris temuan otomatis. Skeleton saat memuat pertama; keadaan kosong jelas.
export default function ChartCard({
  title,
  subtitle,
  insight,
  loading = false,
  empty = false,
  action,
  children,
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {action && <div className="flex-none">{action}</div>}
      </div>

      <div className="mt-4 flex-1">
        {loading ? (
          <div className="h-72 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
        ) : empty ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
            <SearchX className="h-6 w-6 text-slate-400" strokeWidth={1.75} />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {analitikPage.empty.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">{analitikPage.empty.hint}</p>
          </div>
        ) : (
          children
        )}
      </div>

      {loading ? (
        <div className="mt-4 h-10 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
      ) : (
        insight &&
        !empty && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <Lightbulb className="mt-0.5 h-4 w-4 flex-none text-cta" strokeWidth={1.75} />
            <span>{insight}</span>
          </p>
        )
      )}
    </section>
  );
}
