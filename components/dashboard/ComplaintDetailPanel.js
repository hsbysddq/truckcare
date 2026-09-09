"use client";

import { useEffect, useRef, useState } from "react";
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
  MoreVertical,
  Pencil,
  RefreshCw,
  RotateCcw,
  SearchX,
  Send,
  ServerOff,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import {
  complaintStatusMeta,
  agentConfidenceMeta,
  pengaduanManagementPage,
} from "@/lib/content";
import Link from "next/link";
import { formatTicketId, normalizePlate } from "@/lib/format";
import { formatDateTime } from "@/lib/schedule-analysis";
import SpeedEvidenceChart from "@/components/dashboard/SpeedEvidenceChartLoader";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Status yang masih menunggu keputusan operator/agent (STATE A).
const BELUM_DIPUTUSKAN = new Set(["pending", "perlu-ditinjau", "luar-armada"]);
const DURASI_TRANSISI_MS = 200;
const KUTIPAN_PANJANG = 180;

function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, danger, busy, children, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
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

// Menu titik tiga di pojok kanan atas panel.
function PanelMenu({ items }) {
  const copy = pengaduanManagementPage.menu;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  if (items.length === 0) return null;
  return (
    <div ref={ref} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.label}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-popover mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`flex min-h-11 w-full items-center gap-2 px-4 text-left text-sm ${
                item.danger ? "text-red-700 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComplaintDetailPanel({ complaint, onStatusChange, fleetPlates }) {
  const copy = pengaduanManagementPage;
  const [memproses, setMemproses] = useState(null);
  const [tersalin, setTersalin] = useState(false);
  const [galat, setGalat] = useState(null);
  const [konfirmasiUbah, setKonfirmasiUbah] = useState(false);
  const [modeUbah, setModeUbah] = useState(false);
  const [dialogHapus, setDialogHapus] = useState(false);
  const [alasanHapus, setAlasanHapus] = useState("");
  const [catatan, setCatatan] = useState(""); // STATE A: textarea
  const [catatanBaru, setCatatanBaru] = useState(""); // STATE B: input inline
  const [formCatatanTerbuka, setFormCatatanTerbuka] = useState(false);
  const [kutipanPenuh, setKutipanPenuh] = useState(false);
  const [animasi, setAnimasi] = useState(null); // "keluar" | "masuk" | null
  const [riwayat, setRiwayat] = useState({ items: null, loading: false });

  useEffect(() => {
    if (!tersalin) return undefined;
    const timer = setTimeout(() => setTersalin(false), 2000);
    return () => clearTimeout(timer);
  }, [tersalin]);

  // Ganti laporan: reset mode & muat riwayat laporan itu.
  useEffect(() => {
    setModeUbah(false);
    setKonfirmasiUbah(false);
    setDialogHapus(false);
    setAlasanHapus("");
    setGalat(null);
    setCatatan("");
    setCatatanBaru("");
    setFormCatatanTerbuka(false);
    setKutipanPenuh(false);
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
  }, [complaint?.id]);

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

  // STATE A -> B: formulir memudar keluar, lalu blok keputusan masuk dari atas.
  async function kirimStatus(status) {
    const data = await panggil("POST", { status }, status);
    if (!data) return;
    const patch = {
      status: data.status ?? status,
      decisionSource: data.decisionSource ?? "operator",
      decidedBy: data.decidedBy ?? "operator",
      decidedByName: data.decidedByName ?? null,
      decidedAt: data.decidedAt ?? new Date().toISOString(),
      agentReasoning: data.agentReasoning ?? complaint.agentReasoning ?? null,
      decisionReasons: Array.isArray(data.decisionReasons) ? data.decisionReasons : complaint.decisionReasons ?? [],
    };
    setAnimasi("keluar");
    await new Promise((r) => setTimeout(r, DURASI_TRANSISI_MS));
    onStatusChange?.(complaint.id, patch);
    setModeUbah(false);
    setAnimasi("masuk");
    setTimeout(() => setAnimasi(null), DURASI_TRANSISI_MS + 50);
  }

  async function simpanCatatan(teks) {
    const isi = String(teks ?? "").trim();
    if (!isi) return;
    const data = await panggil("PATCH", { operator_note: isi }, "catatan");
    if (!data) return;
    onStatusChange?.(complaint.id, {
      operatorNotes: data.operatorNotes ?? [...(complaint.operatorNotes ?? []), { by: null, at: new Date().toISOString(), text: isi }],
      operatorNote: data.operatorNote ?? isi,
      operatorNoteAt: data.operatorNoteAt ?? new Date().toISOString(),
    });
    setCatatan("");
    setCatatanBaru("");
    setFormCatatanTerbuka(false);
  }

  async function hapus() {
    if (!alasanHapus.trim()) return;
    const data = await panggil("DELETE", { reason: alasanHapus.trim() }, "hapus");
    if (!data) return;
    onStatusChange?.(complaint.id, { deletedAt: data.deletedAt, deleteReason: data.deleteReason });
    setDialogHapus(false);
    setAlasanHapus("");
  }

  // "Analisis ulang": jalankan lib/complaint-analysis.js lagi di server, lalu
  // terapkan shape terbaru tanpa reload.
  async function analisisUlang() {
    if (!complaint || memproses) return;
    setMemproses("analisis");
    setGalat(null);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/analyze`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGalat(data?.error ?? copy.actions.errorMessage);
        return;
      }
      if (data?.complaint) {
        const { id: _id, ...patch } = data.complaint;
        onStatusChange?.(complaint.id, patch);
      }
    } catch {
      setGalat(copy.actions.errorMessage);
    } finally {
      setMemproses(null);
    }
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
  // Analisis agent (hasil lib/complaint-analysis.js, atau data contoh) tetap
  // ditampilkan meski operator kemudian mengubah keputusannya.
  const agentAnalysis =
    complaint.agentAnalysis ??
    (complaint.agentReasoning && (source === "agent" || complaint.decidedBy === "agent")
      ? { reasoning: complaint.agentReasoning, verdict: null, confidence: complaint.agentConfidence ?? null, findings: complaint.agentFindings ?? [] }
      : null);
  const agentConfidence = agentAnalysis?.confidence ? agentConfidenceMeta[agentAnalysis.confidence] ?? null : null;
  const operatorDecided = complaint.decidedBy === "operator";
  const sistemDecided = complaint.decidedBy === "sistem";
  const analysisStatus = complaint.analysisStatus ?? (agentAnalysis ? "selesai" : "menunggu");
  const sedangDianalisis = memproses === "analisis" || analysisStatus === "berjalan" || (analysisStatus === "menunggu" && !agentAnalysis && !complaint.deletedAt && complaint.status === "pending");
  const analisisGagal = analysisStatus === "gagal";
  const punyaBukti = (complaint.speedSeries?.length ?? 0) > 0;
  const platTerdaftar =
    !fleetPlates || fleetPlates.size === 0
      ? true
      : fleetPlates.has(normalizePlate(complaint.plateNumber));
  const terhapus = Boolean(complaint.deletedAt);
  const sudahDiputuskan = !BELUM_DIPUTUSKAN.has(complaint.status);
  const stateB = sudahDiputuskan && !modeUbah;
  const keputusanValid = complaint.status === "tervalidasi";
  const decisionCopy = copy.decisionSummary;
  const namaPemutus =
    complaint.decidedBy === "agent" || complaint.decidedBy === "sistem"
      ? decisionCopy.actors[complaint.decidedBy]
      : complaint.decidedByName ?? decisionCopy.actors.operator;
  const alasanKeputusan = (complaint.decisionReasons ?? []).slice(0, 3);
  const catatanList = complaint.operatorNotes ?? [];
  const kutipanPanjang = (complaint.reporterNote ?? "").length > KUTIPAN_PANJANG;

  const menuItems = [
    ...(stateB && !terhapus
      ? [{ label: copy.menu.changeDecision, icon: Pencil, onSelect: () => setKonfirmasiUbah(true) }]
      : []),
    ...(!terhapus
      ? [{ label: copy.menu.delete, icon: Trash2, danger: true, onSelect: () => setDialogHapus(true) }]
      : []),
  ];

  const tombolKeputusan = (
    <div className={`mt-6 ${animasi === "keluar" ? "animasi-keluar" : ""}`}>
      {modeUbah && <p className="mb-3 text-xs text-slate-500">{copy.actions.changeModeHint}</p>}
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
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* STATE B: blok keputusan sebagai header panel. */}
      {stateB && (
        <div
          className={`relative rounded-2xl border-l-4 p-5 ${
            keputusanValid ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"
          } ${animasi === "masuk" ? "animasi-keputusan-masuk" : ""}`}
        >
          {!terhapus && (
            <div className="-mr-1 -mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setKonfirmasiUbah(true)}
                className="min-h-8 text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
              >
                {decisionCopy.changeLabel}
              </button>
            </div>
          )}
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 flex-none items-center justify-center rounded-full ${
                keputusanValid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {keputusanValid ? (
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
              ) : (
                <XCircle className="h-7 w-7" strokeWidth={1.75} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${keputusanValid ? "text-emerald-800" : "text-rose-800"}`}>
                {copy.decisionHeader.labels[complaint.status] ?? status.label}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {decisionCopy.byLabel} <span className="font-semibold text-slate-900">{namaPemutus}</span>
                {" · "}
                {complaint.decidedAt ? formatDateTime(complaint.decidedAt) : decisionCopy.unknownTime}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-black/5 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {copy.decisionHeader.reasonsTitle}
            </p>
            {alasanKeputusan.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">{copy.decisionHeader.noReasons}</p>
            ) : (
              <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
                {alasanKeputusan.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${keputusanValid ? "bg-emerald-500" : "bg-rose-500"}`} aria-hidden="true" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className={`flex items-start justify-between gap-2 ${stateB ? "mt-5" : ""}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="min-w-0 text-lg font-bold tracking-tight text-slate-900">
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
        <div className="flex flex-none items-center gap-1">
          {!stateB && (
            <span className={`inline-flex flex-none items-center rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}>
              {status.label}
            </span>
          )}
          <PanelMenu items={menuItems} />
        </div>
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

      {/* Kotak analisis agent: selalu tampil (hasil, sedang dianalisis, gagal,
          atau belum). Tombol Analisis ulang untuk yang gagal / data baru. */}
      {!sistemDecided && (
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-tint/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-white">
                <Bot className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <h3 className="text-sm font-semibold text-slate-900">{copy.agentBox.title}</h3>
              {agentAnalysis?.verdict && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/30">
                  {copy.agentBox.verdictLabels[agentAnalysis.verdict] ?? agentAnalysis.verdict}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {agentAnalysis && agentConfidence && (
                <span className={`inline-flex flex-none items-center rounded-full px-3 py-1 text-xs font-semibold ${agentConfidence.badgeClass}`}>
                  <GlossaryText text={copy.agentBox.confidenceLabel} />: {agentConfidence.label}
                </span>
              )}
              {!terhapus && (
                <button
                  type="button"
                  onClick={analisisUlang}
                  disabled={memproses !== null}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-accent hover:bg-white disabled:opacity-50"
                >
                  {memproses === "analisis" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  {memproses === "analisis" ? copy.agentBox.reanalyzingLabel : copy.agentBox.reanalyzeLabel}
                </button>
              )}
            </div>
          </div>
          {sedangDianalisis ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={2} />
              {copy.agentBox.analyzingLabel}
            </p>
          ) : analisisGagal ? (
            <p className="mt-3 text-sm text-red-700">
              {copy.agentBox.failedLabel}
              {complaint.analysisError ? `: ${complaint.analysisError}` : ""}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {agentAnalysis?.reasoning ?? copy.agentBox.pendingReasoning}
            </p>
          )}
          {agentAnalysis?.findings?.length > 0 && !sedangDianalisis && (
            <div className="mt-4 flex flex-wrap gap-2">
              {agentAnalysis.findings.map((finding) => (
                <span key={finding} className="inline-flex items-center rounded-full border border-accent/30 bg-white px-3 py-1.5 text-xs font-medium text-accent">
                  {finding}
                </span>
              ))}
            </div>
          )}
          {agentAnalysis?.analyzedAt && !sedangDianalisis && (
            <p className="mt-3 text-[11px] text-slate-400">
              {copy.agentBox.analyzedAtPrefix} {formatDateTime(agentAnalysis.analyzedAt)}
            </p>
          )}
        </div>
      )}

      {/* Keputusan manusia: kotak netral berikon orang, tanpa tingkat keyakinan.
          Bila agent sudah menganalisis, kotak ini tampil DI BAWAH analisis agent. */}
      {operatorDecided && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <Users className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">{copy.decisionBoxes.operator.title}</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.decisionBoxes.operator.description}</p>
          <p className="mt-1 text-sm text-slate-700">
            {copy.decisionBoxes.operator.byLabel}{" "}
            <span className="font-semibold text-slate-900">{complaint.decidedByName ?? copy.history.actors.operator}</span>
            {complaint.decidedAt ? ` · ${formatDateTime(complaint.decidedAt)}` : ""}
          </p>
          {agentAnalysis && (
            <p className="mt-2 text-xs italic text-slate-500">{copy.decisionBoxes.operator.afterAgentNote}</p>
          )}
        </div>
      )}

      {sistemDecided && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <ServerOff className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">{copy.decisionBoxes.sistem.title}</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.decisionBoxes.sistem.description}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">{copy.chart.title}</h3>
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
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{copy.vehicleInfo.title}</h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.plateLabel}</dt>
              <dd className="font-medium text-slate-900">{complaint.plateNumber}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.typeLabel}</dt>
              <dd className="font-medium text-slate-900">{complaint.vehicleType ?? "-"}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-slate-500">{copy.vehicleInfo.driverLabel}</dt>
              <dd className="text-right font-medium text-slate-900">
                {complaint.driverName ? (
                  complaint.driverId ? (
                    <Link
                      href={`/dashboard/pengemudi/${encodeURIComponent(complaint.driverId)}`}
                      className="underline-offset-2 hover:text-accent hover:underline"
                    >
                      {complaint.driverName}
                    </Link>
                  ) : (
                    complaint.driverName
                  )
                ) : complaint.driverUncertain ? (
                  <span className="text-xs font-normal text-amber-700">{copy.vehicleInfo.driverUncertain}</span>
                ) : (
                  <span className="text-xs font-normal text-slate-400">{copy.vehicleInfo.notAnalyzed}</span>
                )}
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
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{copy.attachmentsTitle}</h4>
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
                <div key={n} className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                  <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Laporan asli: STATE A kotak abu-abu, STATE B kutipan ringkas. Tidak pernah bisa diedit. */}
      {stateB ? (
        <div className="mt-6">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Lock className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            {copy.originalReport.label}
          </p>
          <blockquote
            className={`mt-1.5 border-l-2 border-slate-200 pl-3 text-sm italic leading-relaxed text-slate-600 ${
              kutipanPenuh ? "" : "line-clamp-3"
            }`}
          >
            &ldquo;{complaint.reporterNote}&rdquo;
          </blockquote>
          {kutipanPanjang && (
            <button
              type="button"
              onClick={() => setKutipanPenuh((v) => !v)}
              className="mt-1 text-xs font-semibold text-accent hover:underline"
            >
              {kutipanPenuh ? copy.originalReport.lessLabel : copy.originalReport.moreLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{copy.reporterNoteTitle}</h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Lock className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
              {copy.originalReportLabel}
            </span>
          </div>
          <p className="mt-2 text-sm italic leading-relaxed text-slate-600">&ldquo;{complaint.reporterNote}&rdquo;</p>
        </div>
      )}

      {/* Catatan internal: STATE A formulir, STATE B timeline + input inline. */}
      {stateB ? (
        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{copy.notesTimeline.title}</h4>
          {catatanList.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">{copy.notesTimeline.empty}</p>
          ) : (
            <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
              {catatanList.map((n, i) => (
                <li key={`${n.at ?? i}-${i}`} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400" aria-hidden="true" />
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-600">{n.by ?? copy.notesTimeline.anonymousLabel}</span>
                    {n.at ? ` · ${formatDateTime(n.at)}` : ""}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-800">{n.text}</p>
                </li>
              ))}
            </ol>
          )}
          {!terhapus && (
            formCatatanTerbuka ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  simpanCatatan(catatanBaru);
                }}
                className="mt-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  autoFocus
                  value={catatanBaru}
                  onChange={(e) => setCatatanBaru(e.target.value)}
                  placeholder={copy.notesTimeline.placeholder}
                  maxLength={500}
                  className="min-h-11 min-w-0 flex-1 rounded-full border border-slate-200 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
                />
                <button
                  type="submit"
                  disabled={!catatanBaru.trim() || memproses !== null}
                  aria-label={copy.notesTimeline.sendLabel}
                  className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {memproses === "catatan" ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Send className="h-4 w-4" strokeWidth={1.75} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormCatatanTerbuka(false);
                    setCatatanBaru("");
                  }}
                  className="min-h-11 flex-none px-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  {copy.notesTimeline.cancelLabel}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setFormCatatanTerbuka(true)}
                className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-accent hover:underline"
              >
                {copy.notesTimeline.addLabel}
              </button>
            )
          )}
        </div>
      ) : (
        <div className={`mt-6 ${animasi === "keluar" ? "animasi-keluar" : ""}`}>
          <label htmlFor="catatan-operator" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {copy.operatorNote.title}
          </label>
          <p className="mt-1 text-xs text-slate-500">{copy.operatorNote.hint}</p>
          {catatanList.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              {catatanList.map((n, i) => (
                <li key={`${n.at ?? i}-${i}`}>
                  <span className="font-semibold text-slate-600">{n.by ?? copy.notesTimeline.anonymousLabel}</span>
                  {n.at ? ` · ${formatDateTime(n.at)}` : ""}: {n.text}
                </li>
              ))}
            </ul>
          )}
          <textarea
            id="catatan-operator"
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder={copy.operatorNote.placeholder}
            disabled={terhapus}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint disabled:bg-slate-50"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => simpanCatatan(catatan)}
              disabled={!catatan.trim() || memproses !== null || terhapus}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {memproses === "catatan" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {copy.operatorNote.saveLabel}
            </button>
          </div>
        </div>
      )}

      {galat && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {galat}
        </p>
      )}

      {!stateB && !terhapus && tombolKeputusan}

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
                  <span className="font-semibold">{h.actorName ?? copy.history.actors[h.actor] ?? h.actor}</span>{" "}
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
