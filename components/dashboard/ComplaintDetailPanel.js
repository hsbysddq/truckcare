"use client";

import { useEffect, useState } from "react";
import GlossaryText from "@/components/dashboard/GlossaryText";
import {
  Bot,
  Check,
  CheckCircle2,
  Copy,
  History,
  Image as ImageIcon,
  Loader2,
  Lock,
  RotateCcw,
  SearchX,
  ServerOff,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  complaintStatusMeta,
  agentConfidenceMeta,
  pengaduanManagementPage,
} from "@/lib/content";
import { formatTicketId, normalizePlate } from "@/lib/format";
import { formatDateTime } from "@/lib/schedule-analysis";
import SpeedEvidenceChart from "@/components/dashboard/SpeedEvidenceChart";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Status yang masih menunggu keputusan operator/agent.
const BELUM_DIPUTUSKAN = new Set(["pending", "perlu-ditinjau", "luar-armada"]);

function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, danger, busy, children, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="dialog-judul" className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h3 id="dialog-judul" className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        {children}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComplaintDetailPanel({ complaint, onStatusChange, fleetPlates }) {
  const copy = pengaduanManagementPage;
  const [memproses, setMemproses] = useState(null);
  const [tersalin, setTersalin] = useState(false);
  const [galat, setGalat] = useState(null);
  // Mode ubah keputusan: buka dialog konfirmasi dulu, baru tombol muncul lagi.
  const [konfirmasiUbah, setKonfirmasiUbah] = useState(false);
  const [modeUbah, setModeUbah] = useState(false);
  const [dialogHapus, setDialogHapus] = useState(false);
  const [alasanHapus, setAlasanHapus] = useState("");
  const [catatan, setCatatan] = useState("");
  const [riwayat, setRiwayat] = useState({ items: null, loading: false });

  useEffect(() => {
    if (!tersalin) return undefined;
    const timer = setTimeout(() => setTersalin(false), 2000);
    return () => clearTimeout(timer);
  }, [tersalin]);

  // Ganti laporan: reset mode & muat catatan + riwayat laporan itu.
  useEffect(() => {
    setModeUbah(false);
    setKonfirmasiUbah(false);
    setDialogHapus(false);
    setAlasanHapus("");
    setGalat(null);
    setCatatan(complaint?.operatorNote ?? "");
    if (!complaint) return undefined;
    let batal = false;
    setRiwayat({ items: null, loading: true });
    fetch(`/api/complaints/${complaint.id}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!batal) setRiwayat({ items: Array.isArray(data?.history) ? data.history : [], loading: false });
      })
      .catch(() => {
        if (!batal) setRiwayat({ items: [], loading: false });
      });
    return () => {
      batal = true;
    };
  }, [complaint?.id, complaint?.operatorNote]);

  async function salinId() {
    try {
      await navigator.clipboard.writeText(complaint.id);
      setTersalin(true);
    } catch {
      // Clipboard ditolak browser; biarkan tanpa umpan balik.
    }
  }

  async function panggil(method, body, kunci) {
    if (!complaint || memproses) return null;
    setMemproses(kunci);
    setGalat(null);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGalat(data?.error ?? copy.actions.errorMessage);
        return null;
      }
      return data;
    } catch {
      setGalat(copy.actions.errorMessage);
      return null;
    } finally {
      setMemproses(null);
    }
  }

  async function kirimStatus(status) {
    const data = await panggil("POST", { status }, status);
    if (!data) return;
    onStatusChange?.(complaint.id, {
      status: data.status ?? status,
      decisionSource: data.decisionSource ?? "operator",
      decidedBy: data.decidedBy ?? "operator",
      decidedByName: data.decidedByName ?? null,
      decidedAt: data.decidedAt ?? new Date().toISOString(),
      agentReasoning: data.agentReasoning ?? complaint.agentReasoning ?? null,
    });
    setModeUbah(false);
  }

  async function simpanCatatan() {
    const data = await panggil("PATCH", { operator_note: catatan }, "catatan");
    if (!data) return;
    onStatusChange?.(complaint.id, { operatorNote: data.operatorNote, operatorNoteAt: data.operatorNoteAt });
  }

  async function hapus() {
    if (!alasanHapus.trim()) return;
    const data = await panggil("DELETE", { reason: alasanHapus.trim() }, "hapus");
    if (!data) return;
    onStatusChange?.(complaint.id, { deletedAt: data.deletedAt, deleteReason: data.deleteReason });
    setDialogHapus(false);
    setAlasanHapus("");
  }

  async function pulihkan() {
    const data = await panggil("PATCH", { restore: true }, "pulihkan");
    if (!data) return;
    onStatusChange?.(complaint.id, { deletedAt: null, deleteReason: null });
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
  const terhapus = Boolean(complaint.deletedAt);
  const sudahDiputuskan = !BELUM_DIPUTUSKAN.has(complaint.status);
  const tampilkanTombol = !terhapus && (!sudahDiputuskan || modeUbah);
  const keputusanValid = complaint.status === "tervalidasi";
  const decisionCopy = copy.decisionSummary;
  const namaPemutus =
    complaint.decidedBy === "agent" || complaint.decidedBy === "sistem"
      ? decisionCopy.actors[complaint.decidedBy]
      : complaint.decidedByName ?? decisionCopy.actors.operator;
  const catatanBerubah = (catatan ?? "") !== (complaint.operatorNote ?? "");

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

      {terhapus && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
          <span>
            <span className="font-semibold">{copy.deletion.deletedBanner}</span>
            {complaint.deletedAt ? ` · ${formatDateTime(complaint.deletedAt)}` : ""}
            {complaint.deleteReason ? ` · ${complaint.deleteReason}` : ""}
          </span>
          <button
            type="button"
            onClick={pulihkan}
            disabled={memproses !== null}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {memproses === "pulihkan" ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <RotateCcw className="h-4 w-4" strokeWidth={1.75} />}
            {copy.deletion.restoreLabel}
          </button>
        </div>
      )}

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
              <dd className="font-medium text-slate-900">{complaint.plateNumber}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.typeLabel}</dt>
              <dd className="font-medium text-slate-900">{complaint.vehicleType ?? "-"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.driverLabel}</dt>
              <dd className="font-medium text-slate-900">{complaint.driverName ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            <GlossaryText text={copy.telemetryInfo.title} />
          </h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.telemetryInfo.recordedSpeedLabel}</dt>
              <dd className="font-medium text-slate-900">{complaint.recordedSpeed ?? "-"} km/jam</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.telemetryInfo.speedLimitLabel}</dt>
              <dd className="font-medium text-slate-900">{complaint.speedLimit ?? "-"} km/jam</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.telemetryInfo.coordinatesLabel}</dt>
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
                  className="mx-auto h-64 w-auto max-w-full object-contain"
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

      {/* Laporan asli: teks statis, tidak pernah bisa diedit dari dashboard. */}
      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {copy.reporterNoteTitle}
          </h4>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Lock className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            {copy.originalReportLabel}
          </span>
        </div>
        <p className="mt-2 text-sm italic leading-relaxed text-slate-600">
          &ldquo;{complaint.reporterNote}&rdquo;
        </p>
      </div>

      {/* Catatan internal operator: satu-satunya teks yang boleh diedit. */}
      <div className="mt-6">
        <label htmlFor="catatan-operator" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {copy.operatorNote.title}
        </label>
        <p className="mt-1 text-xs text-slate-500">{copy.operatorNote.hint}</p>
        <textarea
          id="catatan-operator"
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder={copy.operatorNote.placeholder}
          disabled={terhapus}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint disabled:bg-slate-50"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-400">
            {complaint.operatorNoteAt ? `${copy.operatorNote.updatedPrefix} ${formatDateTime(complaint.operatorNoteAt)}` : ""}
          </span>
          <button
            type="button"
            onClick={simpanCatatan}
            disabled={!catatanBerubah || memproses !== null || terhapus}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {memproses === "catatan" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            {copy.operatorNote.saveLabel}
          </button>
        </div>
      </div>

      {galat && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {galat}
        </p>
      )}

      {/* Area keputusan: tombol aksi hanya saat belum diputuskan (atau mode ubah). */}
      {tampilkanTombol ? (
        <div className="mt-6">
          {modeUbah && (
            <p className="mb-3 text-xs text-slate-500">{copy.actions.changeModeHint}</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={memproses !== null}
              onClick={() => kirimStatus("ditolak")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {memproses === "ditolak" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {memproses === "ditolak" ? copy.actions.processingLabel : copy.rejectButtonLabel}
            </button>
            <button
              type="button"
              disabled={memproses !== null}
              onClick={() => kirimStatus("tervalidasi")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {memproses === "tervalidasi" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {memproses === "tervalidasi" ? copy.actions.processingLabel : copy.validateButtonLabel}
            </button>
            {modeUbah && (
              <button
                type="button"
                onClick={() => setModeUbah(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                {copy.actions.cancelLabel}
              </button>
            )}
          </div>
        </div>
      ) : sudahDiputuskan ? (
        <div
          className={`mt-6 rounded-2xl border p-5 ${
            keputusanValid ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                keputusanValid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {keputusanValid ? (
                <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <XCircle className="h-5 w-5" strokeWidth={1.75} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold ${keputusanValid ? "text-emerald-800" : "text-rose-800"}`}>
                {status.label}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {decisionCopy.byLabel} <span className="font-medium text-slate-900">{namaPemutus}</span>
                {" · "}
                {complaint.decidedAt ? formatDateTime(complaint.decidedAt) : decisionCopy.unknownTime}
              </p>
            </div>
            {!terhapus && (
              <button
                type="button"
                onClick={() => setKonfirmasiUbah(true)}
                className="inline-flex min-h-11 flex-none items-center rounded-full px-3 text-xs font-semibold text-slate-600 underline-offset-2 hover:underline"
              >
                {decisionCopy.changeLabel}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {!terhapus && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setDialogHapus(true)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {copy.deletion.deleteLabel}
          </button>
        </div>
      )}

      {/* Riwayat perubahan: agent_runs + kolom decided_by/decided_at, operator_note_at, deleted_at. */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <History className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          {copy.history.title}
        </h4>
        {riwayat.loading ? (
          <p className="mt-3 text-xs text-slate-400">{copy.history.loading}</p>
        ) : !riwayat.items || riwayat.items.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">{copy.history.empty}</p>
        ) : (
          <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
            {riwayat.items.map((h) => (
              <li key={h.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-accent" />
                <p className="text-xs text-slate-400">{formatDateTime(h.at)}</p>
                <p className="text-slate-800">
                  <span className="font-semibold">
                    {h.actorName ?? copy.history.actors[h.actor] ?? h.actor}
                  </span>{" "}
                  {h.type === "decided"
                    ? fill(copy.history.events.decided, { status: complaintStatusMeta[h.status]?.label ?? h.status })
                    : h.type === "agent_run"
                      ? fill(copy.history.events.agentRun, { outcome: h.outcome ?? "-" })
                      : copy.history.events[h.type] ?? h.type}
                  {h.note ? <span className="text-slate-500"> — {h.note}</span> : null}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <ConfirmDialog
        open={konfirmasiUbah}
        title={decisionCopy.confirmTitle}
        description={fill(decisionCopy.confirmDescription, { ticket: formatTicketId(complaint.id) })}
        confirmLabel={decisionCopy.confirmLabel}
        cancelLabel={copy.actions.cancelLabel}
        onConfirm={() => {
          setKonfirmasiUbah(false);
          setModeUbah(true);
        }}
        onCancel={() => setKonfirmasiUbah(false)}
      />

      <ConfirmDialog
        open={dialogHapus}
        title={copy.deletion.confirmTitle}
        description={fill(copy.deletion.confirmDescription, { ticket: formatTicketId(complaint.id) })}
        confirmLabel={copy.deletion.confirmLabel}
        cancelLabel={copy.actions.cancelLabel}
        danger
        busy={memproses === "hapus"}
        onConfirm={hapus}
        onCancel={() => setDialogHapus(false)}
      >
        <label className="mt-4 block text-sm font-medium text-slate-700">
          {copy.deletion.reasonLabel}
          <textarea
            rows={3}
            value={alasanHapus}
            onChange={(e) => setAlasanHapus(e.target.value)}
            placeholder={copy.deletion.reasonPlaceholder}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
          />
          {!alasanHapus.trim() && (
            <span className="mt-1 block text-xs text-slate-400">{copy.deletion.reasonRequired}</span>
          )}
        </label>
      </ConfirmDialog>
    </div>
  );
}
