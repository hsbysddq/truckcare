import { MapPin, Truck } from "lucide-react";
import { complaintStatusMeta, agentConfidenceMeta } from "@/lib/content";

export default function ComplaintCard({ complaint, active, onSelect }) {
  const status = complaintStatusMeta[complaint.status];
  const confidence = agentConfidenceMeta[complaint.agentConfidence];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-white p-4 text-left transition-colors ${
        active
          ? "border-2 border-accent"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex-none text-sm font-semibold text-slate-900">
            #{complaint.id}
          </span>
          <span
            className={`inline-flex flex-none items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${confidence.badgeClass}`}
          >
            AI: {confidence.label}
          </span>
        </div>
        <span className="flex-none text-xs text-slate-400">
          {complaint.relativeTime}
        </span>
      </div>

      <h3 className="mt-2 text-sm font-semibold text-slate-900">
        {complaint.judul}
      </h3>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5 flex-none" strokeWidth={1.75} />
        <span className="truncate">{complaint.lokasi}</span>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-600">
            <Truck className="h-3.5 w-3.5 flex-none" strokeWidth={1.75} />
            <span className="whitespace-nowrap">{complaint.plateNumber}</span>
          </div>
          <span
            className={`inline-flex flex-none items-center rounded-full px-2.5 py-1 text-xs font-semibold ${status.badgeClass}`}
          >
            {status.label}
          </span>
        </div>
      </div>
    </button>
  );
}
