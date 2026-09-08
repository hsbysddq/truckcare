"use client";

import { useEffect, useState } from "react";
import GlossaryText from "@/components/dashboard/GlossaryText";
import {
  Bot,
  Check,
  Copy,
  Image as ImageIcon,
  SearchX,
  ServerOff,
  UserCheck,
} from "lucide-react";
import {
  complaintStatusMeta,
  agentConfidenceMeta,
  pengaduanManagementPage,
} from "@/lib/content";
import { formatTicketId, normalizePlate } from "@/lib/format";
import SpeedEvidenceChart from "@/components/dashboard/SpeedEvidenceChart";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export default function ComplaintDetailPanel({ complaint, onStatusChange, fleetPlates }) {
  const copy = pengaduanManagementPage;
  const [memproses, setMemproses] = useState(null);
  const [tersalin, setTersalin] = useState(false);

  useEffect(() => {
    if (!tersalin) return undefined;
    const timer = setTimeout(() => setTersalin(false), 2000);
    return () => clearTimeout(timer);
  }, [tersalin]);

  async function salinId() {
    try {
      await navigator.clipboard.writeText(complaint.id);
      setTersalin(true);
    } catch {
      // Clipboard ditolak browser; biarkan tanpa umpan balik.
    }
  }

  async function kirimStatus(status) {
    if (!complaint || memproses) return;
    setMemproses(status);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) onStatusChange?.(complaint.id, status);
    } catch {
      // Gagal jaringan, biarkan status lama.
    } finally {
      setMemproses(null);
    }
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        {copy.emptyStateMessage}
      </div>
    );
  }

  const status = complaintStatusMeta[complaint.status] ?? complaintStatusMeta.pending;
  const source = complaint.decisionSource ?? null;
  // Keyakinan hanya ditampilkan bila agent yang menganalisis; keputusan
  // operator/sistem memakai kotak netral tanpa badge.
  const confidence =
    source === "agent" && complaint.agentConfidence
      ? agentConfidenceMeta[complaint.agentConfidence] ?? null
      : null;
  const nonAgentBox = source === "operator" || source === "sistem" ? copy.decisionBoxes[source] : null;
  const findings = complaint.agentFindings ?? [];
  const punyaBukti = (complaint.speedSeries?.length ?? 0) > 0;
  const platTerdaftar =
    !fleetPlates || fleetPlates.size === 0
      ? true
      : fleetPlates.has(normalizePlate(complaint.plateNumber));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {copy.ticketLabel}{" "}
            <span className="font-mono">{formatTicketId(complaint.id)}</span>
          </h2>
          <button
            type="button"
            onClick={salinId}
            title={copy.copyIdLabel}
            aria-label={copy.copyIdLabel}
            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {tersalin ? (
              <Check className="h-4 w-4 text-emerald-600" strokeWidth={2} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
          {tersalin && (
            <span className="text-xs font-medium text-emerald-600" role="status">
              {copy.copiedLabel}
            </span>
          )}
        </div>
        <span
          className={`inline-flex flex-none items-center rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
        >
          {status.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {copy.reporterRowLabel}: {copy.defaultReporterLabel} · {complaint.incidentAt}
      </p>

      {nonAgentBox ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-200 text-slate-600">
              {source === "operator" ? (
                <UserCheck className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <ServerOff className="h-4 w-4" strokeWidth={1.75} />
              )}
            </span>
            <h3 className="text-sm font-semibold text-slate-900">{nonAgentBox.title}</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {nonAgentBox.description}
          </p>
          {complaint.agentReasoning && (
            <p className="mt-2 text-sm italic text-slate-500">
              &ldquo;{complaint.agentReasoning}&rdquo;
            </p>
          )}
        </div>
      ) : (
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
            {confidence && (
              <span
                className={`inline-flex flex-none items-center rounded-full px-3 py-1 text-xs font-semibold ${confidence.badgeClass}`}
              >
                <GlossaryText text={copy.agentBox.confidenceLabel} />: {confidence.label}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {source === "agent" && complaint.agentReasoning
              ? complaint.agentReasoning
              : copy.agentBox.pendingReasoning}
          </p>
          {source === "agent" && findings.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {findings.map((finding) => (
                <span
                  key={finding}
                  className="inline-flex items-center rounded-full border border-accent/30 bg-white px-3 py-1.5 text-xs font-medium text-accent"
                >
                  {finding}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">
          {copy.chart.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{copy.chart.subtitle}</p>
        <div className="mt-4">
          {punyaBukti ? (
            <SpeedEvidenceChart
              speedSeries={complaint.speedSeries}
              speedLimit={complaint.speedLimit}
              incidentLabel={copy.chart.incidentLabel}
            />
          ) : (
            <div className="flex flex-col items-center rounded-xl bg-slate-50 px-6 py-8 text-center">
              <SearchX className="h-6 w-6 text-slate-400" strokeWidth={1.75} />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                <GlossaryText text={copy.chart.empty.title} />
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                {platTerdaftar
                  ? copy.chart.empty.outsideRange
                  : fill(copy.chart.empty.plateMissing, { plate: complaint.plateNumber })}
              </p>
            </div>
          )}
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
                {complaint.vehicleType ?? "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.driverLabel}</dt>
              <dd className="font-medium text-slate-900">
                {complaint.driverName ?? "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            <GlossaryText text={copy.telemetryInfo.title} />
          </h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">
                {copy.telemetryInfo.recordedSpeedLabel}
              </dt>
              <dd className="font-medium text-slate-900">
                {complaint.recordedSpeed ?? "-"} km/jam
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">
                {copy.telemetryInfo.speedLimitLabel}
              </dt>
              <dd className="font-medium text-slate-900">
                {complaint.speedLimit ?? "-"} km/jam
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">
                {copy.telemetryInfo.coordinatesLabel}
              </dt>
              <dd className="font-medium text-slate-900">
                {complaint.coordinates
                  ? `${complaint.coordinates.lat.toFixed(4)}, ${complaint.coordinates.lng.toFixed(4)}`
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {copy.attachmentsTitle}
        </h4>
        <div className="mt-3">
          {complaint.foto_url ? (
            <div className="grid grid-cols-1 gap-3">
              <a
                href={complaint.foto_url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={complaint.foto_url}
                  alt="Lampiran laporan"
                  className="h-auto w-full object-contain"
                  loading="lazy"
                />
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300"
                >
                  <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          )}
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
          disabled={memproses !== null}
          onClick={() => kirimStatus("ditolak")}
          className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          {memproses === "ditolak" ? "Memproses..." : copy.rejectButtonLabel}
        </button>
        <button
          type="button"
          disabled={memproses !== null}
          onClick={() => kirimStatus("tervalidasi")}
          className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {memproses === "tervalidasi" ? "Memproses..." : copy.validateButtonLabel}
        </button>
      </div>
    </div>
  );
}
