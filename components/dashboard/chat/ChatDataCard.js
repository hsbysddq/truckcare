import { toneMeta } from "@/lib/content";

export default function ChatDataCard({ card }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
      {card.title && (
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {card.title}
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {card.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 bg-slate-50/60 px-3 py-2 text-sm"
          >
            <span className="text-slate-500">{row.label}</span>
            {row.badge ? (
              <span
                className={`inline-flex flex-none items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  toneMeta[row.badge.tone].badgeClass
                }`}
              >
                {row.badge.label}
              </span>
            ) : (
              <span className="font-medium text-slate-900">{row.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
