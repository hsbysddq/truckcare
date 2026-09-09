"use client";

import { useMemo, useState } from "react";
import { armadaPage, truckStatusMeta } from "@/lib/content";
import { TRUCK_TYPES, TRUCK_TYPE_ORDER } from "@/lib/truck-types";
import ArmadaCard from "@/components/dashboard/ArmadaCard";

function Pills({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
            value === o.key
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {o.label}
          <span className={`text-xs tabular-nums ${value === o.key ? "text-white/70" : "text-slate-400"}`}>{o.count}</span>
        </button>
      ))}
    </div>
  );
}

// Daftar Armada dengan filter status dan jenis truk (pill). Data truk sudah
// memuat `type` (lihat lib/truck-types.js).
export default function ArmadaList({ trucks }) {
  const copy = armadaPage;
  const [status, setStatus] = useState("semua");
  const [jenis, setJenis] = useState("semua");

  const filtered = useMemo(
    () =>
      trucks.filter(
        (t) => (status === "semua" || t.status === status) && (jenis === "semua" || t.type === jenis)
      ),
    [trucks, status, jenis]
  );

  const count = (pred) => trucks.filter(pred).length;
  const statusOptions = [
    { key: "semua", label: copy.filters.allLabel, count: trucks.length },
    ...Object.entries(truckStatusMeta).map(([key, meta]) => ({
      key,
      label: meta.label,
      count: count((t) => t.status === key),
    })),
  ];
  const typeOptions = [
    { key: "semua", label: copy.filters.allLabel, count: trucks.length },
    ...TRUCK_TYPE_ORDER.map((key) => ({
      key,
      label: TRUCK_TYPES[key].short,
      count: count((t) => t.type === key),
    })),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
          {trucks.length} {copy.countBadgeSuffix}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
        <Pills label={copy.filters.statusLabel} options={statusOptions} value={status} onChange={setStatus} />
        <Pills label={copy.filters.typeLabel} options={typeOptions} value={jenis} onChange={setJenis} />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {copy.filters.emptyMessage}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((truck) => (
            <ArmadaCard
              key={truck.id}
              truck={truck}
              name={truck.model ?? truck.nama ?? truck.plateNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
}
