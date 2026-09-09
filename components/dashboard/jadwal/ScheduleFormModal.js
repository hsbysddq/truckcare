"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { jadwalPage, scheduleStatusMeta } from "@/lib/content";
import { findConflicts, formatDateTime } from "@/lib/schedule-analysis";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// ISO <-> nilai input datetime-local (waktu lokal browser).
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(value) {
  return value ? new Date(value).toISOString() : "";
}

const INPUT =
  "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint";

export default function ScheduleFormModal({
  open,
  initial,
  trucks,
  drivers,
  schedules,
  apiBase,
  onClose,
  onSaved,
}) {
  const copy = jadwalPage.form;
  const [form, setForm] = useState(() => blank(initial));
  const [errors, setErrors] = useState({});
  const [conflict, setConflict] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(blank(initial));
      setErrors({});
      setConflict(null);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function blank(s) {
    return {
      truck_id: s?.truck_id ?? "",
      driver_id: s?.driver_id ?? "",
      origin: s?.origin ?? "",
      destination: s?.destination ?? "",
      planned_departure: toLocalInput(s?.planned_departure),
      planned_arrival: toLocalInput(s?.planned_arrival),
      cargo_type: s?.cargo_type ?? "",
      notes: s?.notes ?? "",
      status: s?.status ?? "dijadwalkan",
    };
  }

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: null }));
    setConflict(null);
  };

  function validate() {
    const next = {};
    for (const key of ["truck_id", "origin", "destination", "planned_departure", "planned_arrival"]) {
      if (!String(form[key]).trim()) next[key] = copy.errors.required;
    }
    if (!next.planned_arrival && form.planned_arrival <= form.planned_departure) {
      next.planned_arrival = copy.errors.order;
    }
    setErrors(next);
    if (Object.keys(next).length) return false;
    const candidate = {
      id: initial?.id ?? null,
      truck_id: form.truck_id,
      planned_departure: fromLocalInput(form.planned_departure),
      planned_arrival: fromLocalInput(form.planned_arrival),
    };
    const clash = findConflicts(candidate, schedules)[0];
    if (clash) {
      setConflict(clash);
      return false;
    }
    return true;
  }

  async function submit(e) {
    e.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      driver_id: form.driver_id || null,
      cargo_type: form.cargo_type || null,
      notes: form.notes.trim() || null,
      planned_departure: fromLocalInput(form.planned_departure),
      planned_arrival: fromLocalInput(form.planned_arrival),
    };
    try {
      const res = await fetch(initial ? `${apiBase}/${initial.id}` : apiBase, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.conflicts?.[0]) {
        setConflict(data.conflicts[0]);
        return;
      }
      if (!res.ok) {
        setErrors({ form: data.error ?? copy.errors.network });
        return;
      }
      onSaved(data);
      onClose();
    } catch {
      setErrors({ form: copy.errors.network });
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  const truckOf = (id) => trucks.find((t) => t.id === id);

  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="jadwal-form-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="jadwal-form-title" className="text-lg font-bold text-slate-900">
            {initial ? copy.editTitle : copy.addTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.cancelLabel}
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            {copy.truckLabel}
            <select value={form.truck_id} onChange={set("truck_id")} className={INPUT}>
              <option value="">{copy.truckPlaceholder}</option>
              {trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plateNumber}
                  {t.vehicleType ? ` · ${t.vehicleType}` : ""}
                </option>
              ))}
            </select>
            {errors.truck_id && <span className="mt-1 block text-xs text-red-600">{errors.truck_id}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {copy.driverLabel}
            <select value={form.driver_id} onChange={set("driver_id")} className={INPUT}>
              <option value="">{copy.driverPlaceholder}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {copy.originLabel}
            <input type="text" value={form.origin} onChange={set("origin")} className={INPUT} />
            {errors.origin && <span className="mt-1 block text-xs text-red-600">{errors.origin}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {copy.destinationLabel}
            <input type="text" value={form.destination} onChange={set("destination")} className={INPUT} />
            {errors.destination && <span className="mt-1 block text-xs text-red-600">{errors.destination}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {copy.plannedDepartureLabel}
            <input type="datetime-local" value={form.planned_departure} onChange={set("planned_departure")} className={INPUT} />
            {errors.planned_departure && <span className="mt-1 block text-xs text-red-600">{errors.planned_departure}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {copy.plannedArrivalLabel}
            <input type="datetime-local" value={form.planned_arrival} onChange={set("planned_arrival")} className={INPUT} />
            {errors.planned_arrival && <span className="mt-1 block text-xs text-red-600">{errors.planned_arrival}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {copy.cargoLabel}
            <select value={form.cargo_type} onChange={set("cargo_type")} className={INPUT}>
              <option value="">-</option>
              {copy.cargoOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {initial && (
            <label className="block text-sm font-medium text-slate-700">
              Status
              <select value={form.status} onChange={set("status")} className={INPUT}>
                {Object.entries(scheduleStatusMeta).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            {copy.notesLabel}
            <textarea rows={2} value={form.notes} onChange={set("notes")} className={INPUT} />
          </label>

          {conflict && (
            <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:col-span-2">
              {fill(copy.errors.conflict, {
                plate: truckOf(conflict.truck_id)?.plateNumber ?? conflict.plate_number ?? conflict.truck_id,
                route: `${conflict.origin} → ${conflict.destination}`,
                start: formatDateTime(conflict.planned_departure),
                end: formatDateTime(conflict.planned_arrival),
              })}
            </p>
          )}
          {errors.form && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
              {errors.form}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copy.cancelLabel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {saving ? copy.savingLabel : copy.saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
