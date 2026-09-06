import { Bot, Image as ImageIcon } from "lucide-react";
import {
  complaintStatusMeta,
  agentConfidenceMeta,
  pengaduanManagementPage,
} from "@/lib/content";
import SpeedEvidenceChart from "@/components/dashboard/SpeedEvidenceChart";

export default function ComplaintDetailPanel({ complaint }) {
  const copy = pengaduanManagementPage;

  if (!complaint) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        {copy.emptyStateMessage}
      </div>
    );
  }

  const status = complaintStatusMeta[complaint.status];
  const confidence = agentConfidenceMeta[complaint.agentConfidence];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Detail Laporan #{complaint.id}
        </h2>
        <span
          className={`inline-flex flex-none items-center rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
        >
          {status.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {copy.reporterRowLabel}: {copy.defaultReporterLabel} · {complaint.incidentAt}
      </p>

      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-tint/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-white">
              <Bot className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.agentBox.title}
            </h3>
          </div>
          <span
            className={`inline-flex flex-none items-center rounded-full px-3 py-1 text-xs font-semibold ${confidence.badgeClass}`}
          >
            {copy.agentBox.confidenceLabel}: {confidence.label}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {complaint.agentReasoning}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {complaint.agentFindings.map((finding) => (
            <span
              key={finding}
              className="inline-flex items-center rounded-full border border-accent/30 bg-white px-3 py-1.5 text-xs font-medium text-accent"
            >
              {finding}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">
          {copy.chart.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{copy.chart.subtitle}</p>
        <div className="mt-4">
          <SpeedEvidenceChart
            speedSeries={complaint.speedSeries}
            speedLimit={complaint.speedLimit}
            incidentLabel={copy.chart.incidentLabel}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {copy.vehicleInfo.title}
          </h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.plateLabel}</dt>
              <dd className="font-medium text-slate-900">
                {complaint.plateNumber}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.typeLabel}</dt>
              <dd className="font-medium text-slate-900">
                {complaint.vehicleType}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.driverLabel}</dt>
              <dd className="font-medium text-slate-900">
                {complaint.driverName}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {copy.telemetryInfo.title}
          </h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">
                {copy.telemetryInfo.recordedSpeedLabel}
              </dt>
              <dd className="font-medium text-slate-900">
                {complaint.recordedSpeed} km/jam
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">
                {copy.telemetryInfo.speedLimitLabel}
              </dt>
              <dd className="font-medium text-slate-900">
                {complaint.speedLimit} km/jam
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">
                {copy.telemetryInfo.coordinatesLabel}
              </dt>
              <dd className="font-medium text-slate-900">
                {complaint.coordinates.lat.toFixed(4)},{" "}
                {complaint.coordinates.lng.toFixed(4)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {copy.attachmentsTitle}
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300"
            >
              <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {copy.reporterNoteTitle}
        </h4>
        <p className="mt-2 text-sm italic leading-relaxed text-slate-600">
          &ldquo;{complaint.reporterNote}&rdquo;
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          {copy.rejectButtonLabel}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          {copy.validateButtonLabel}
        </button>
      </div>
    </div>
  );
}
