import { MapPin, Truck } from "lucide-react";
import {
  complaintStatusMeta,
  agentConfidenceMeta,
  pengaduanManagementPage,
} from "@/lib/content";
import { formatTicketId } from "@/lib/format";

export default function ComplaintCard({ complaint, active, onSelect }) {
  const copy = pengaduanManagementPage;
  const status = complaintStatusMeta[complaint.status] ?? complaintStatusMeta.pending;
  // Laporan yang sudah diputuskan tampil lebih tenang supaya yang menunggu
  // lebih menonjol.
  const tenang = complaint.status === "tervalidasi" || complaint.status === "ditolak";
  // Badge keyakinan hanya bila agent benar-benar menganalisis laporan ini.
  const confidence =
    complaint.decisionSource === "agent" && complaint.agentConfidence
      ? agentConfidenceMeta[complaint.agentConfidence] ?? null
      : null;

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
        <span className="min-w-0 truncate font-mono text-sm font-semibold text-slate-900">
          {formatTicketId(complaint.id)}
        </span>
        <span className="flex-none whitespace-nowrap text-xs text-slate-400">
          {complaint.relativeTime ?? complaint.incidentAt}
        </span>
      </div>

      <h3 className={`mt-2 line-clamp-2 text-sm font-semibold ${tenang ? "text-slate-500" : "text-slate-900"}`}>
        {complaint.judul}
      </h3>

      {complaint.lokasi && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 flex-none" strokeWidth={1.75} />
          <span className="truncate">{complaint.lokasi}</span>
        </div>
      )}

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-600">
            <Truck className="h-3.5 w-3.5 flex-none" strokeWidth={1.75} />
            <span className="whitespace-nowrap font-mono">{complaint.plateNumber}</span>
          </div>
          <div className="flex flex-none flex-wrap items-center gap-2">
            {confidence && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${confidence.badgeClass}`}
              >
                {copy.aiBadgePrefix}: {confidence.label}
              </span>
            )}
            {complaint.deletedAt ? (
              <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 line-through">
                {copy.deletedBadgeLabel}
              </span>
            ) : (
              <span
                className={`inline-flex items-center rounded-full font-semibold ${status.badgeClass} ${
                  tenang ? "px-2 py-0.5 text-[11px] opacity-80" : "px-2.5 py-1 text-xs"
                }`}
              >
                {status.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
