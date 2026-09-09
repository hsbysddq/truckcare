"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import GlossaryText from "@/components/dashboard/GlossaryText";
import { Plus } from "lucide-react";
import { jadwalPage, scheduleStatusMeta } from "@/lib/content";
import { summarizeToday } from "@/lib/schedule-analysis";
import { iconMap } from "@/components/icon-map";
import ScheduleTimeline from "@/components/dashboard/jadwal/ScheduleTimeline";
import ScheduleDayList from "@/components/dashboard/jadwal/ScheduleDayList";
import ScheduleDetailPanel from "@/components/dashboard/jadwal/ScheduleDetailPanel";
import ScheduleFormModal from "@/components/dashboard/jadwal/ScheduleFormModal";
import ScheduleFindings from "@/components/dashboard/jadwal/ScheduleFindings";

const TONE = {
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-600",
  neutral: "bg-slate-100 text-slate-600",
};

function rangeFor(view, now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (view === "day") {
    end.setDate(end.getDate() + 1);
  } else if (view === "week") {
    const dow = (start.getDay() + 6) % 7; // Senin = 0
    start.setDate(start.getDate() - dow);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 7);
  } else {
    start.setDate(1);
    end.setTime(start.getTime());
    end.setMonth(end.getMonth() + 1);
  }
  return { start, end };
}

// initialTrucks / initialDrivers: dari server (getActiveTrucks + loadDrivers),
// sumber yang sama dengan halaman Armada dan Pengemudi.
export default function JadwalDashboard({ apiBase = "/api/schedules", initialTrucks = [], initialDrivers = [] }) {
  const copy = jadwalPage;
  const [now, setNow] = useState(() => new Date());
  const [view, setView] = useState("day");
  const [schedules, setSchedules] = useState([]);
  const [findings, setFindings] = useState([]);
  const [trucks, setTrucks] = useState(() => initialTrucks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState({ open: false, initial: null });
  const drivers = initialDrivers;

  const load = useCallback(async () => {
    setError(null);
    try {
      const [schedRes, findRes, truckRes] = await Promise.all([
        fetch(apiBase, { cache: "no-store" }),
        fetch(`${apiBase}/findings`, { cache: "no-store" }),
        fetch("/api/trucks", { cache: "no-store" }).catch(() => null),
      ]);
      if (!schedRes.ok) throw new Error(String(schedRes.status));
      setSchedules(await schedRes.json());
      if (findRes.ok) setFindings((await findRes.json()).findings ?? []);
      if (truckRes?.ok) {
        const data = await truckRes.json();
        if (Array.isArray(data) && data.length) setTrucks(data);
      }
      setNow(new Date());
    } catch {
      setError(copy.errorLabel);
    } finally {
      setLoading(false);
    }
  }, [apiBase, copy.errorLabel]);

  useEffect(() => {
    load();
  }, [load]);

  const range = useMemo(() => rangeFor(view, now), [view, now]);
  const inRange = useMemo(
    () =>
      schedules.filter(
        (s) => new Date(s.planned_arrival) >= range.start && new Date(s.planned_departure) <= range.end
      ),
    [schedules, range]
  );
  const summary = useMemo(() => summarizeToday(schedules, now), [schedules, now]);
  const selected = schedules.find((s) => s.id === selectedId) ?? null;

  function handleSaved(row) {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === row.id);
      const next = exists ? prev.map((s) => (s.id === row.id ? row : s)) : [...prev, row];
      return next.sort((a, b) => a.planned_departure.localeCompare(b.planned_departure));
    });
    setSelectedId(row.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500"><GlossaryText text={copy.subtitle} /></p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ open: true, initial: null })}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {copy.addButtonLabel}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={load} className="min-h-11 rounded-full px-3 font-semibold hover:bg-red-100">
            {copy.retryLabel}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {copy.summary.map((card) => {
          const Icon = iconMap[card.icon];
          return (
            <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${TONE[card.tone] ?? "bg-accent-tint text-accent"}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {loading ? "–" : summary[card.key]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Tampilan" className="inline-flex rounded-full border border-slate-300 bg-white p-1">
              {copy.views.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setView(v.key)}
                  aria-pressed={view === v.key}
                  className={`min-h-9 rounded-full px-4 text-sm font-semibold transition-colors ${
                    view === v.key ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
              {Object.entries(scheduleStatusMeta).map(([key, meta]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-4 rounded-sm ${meta.barClass}`} />
                  {meta.label}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-4 rounded-full bg-slate-500" />
                {copy.timeline.actualLabel}
              </span>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-64 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
            ) : (
              <>
                <div className="hidden lg:block">
                  <ScheduleTimeline
                    trucks={trucks}
                    schedules={inRange}
                    range={range}
                    view={view}
                    now={now}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </div>
                <div className="lg:hidden">
                  <ScheduleDayList schedules={inRange} selectedId={selectedId} onSelect={setSelectedId} />
                </div>
              </>
            )}
          </div>
        </section>

        <ScheduleDetailPanel
          schedule={selected}
          findings={findings}
          onEdit={(s) => setModal({ open: true, initial: s })}
        />
      </div>

      <ScheduleFindings findings={findings} onSelectSchedule={setSelectedId} />

      <ScheduleFormModal
        open={modal.open}
        initial={modal.initial}
        trucks={trucks}
        drivers={drivers}
        schedules={schedules}
        apiBase={apiBase}
        onClose={() => setModal({ open: false, initial: null })}
        onSaved={handleSaved}
      />
    </div>
  );
}
