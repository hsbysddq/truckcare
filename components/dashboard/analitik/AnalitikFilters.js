"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { analitikPage } from "@/lib/content";

function PlateMultiSelect({ plates, selected, onChange }) {
  const copy = analitikPage.filters;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle(plate) {
    onChange(
      selected.includes(plate)
        ? selected.filter((p) => p !== plate)
        : [...selected, plate]
    );
  }

  const label =
    selected.length === 0
      ? copy.allFleetLabel
      : copy.selectedFleetLabel.replace("{count}", selected.length);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        {label}
        <ChevronDown className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label={copy.fleetLabel}
          className="absolute left-0 z-30 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10"
        >
          <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => onChange([...plates])}
              className="min-h-11 font-semibold text-accent hover:underline"
            >
              {copy.selectAllLabel}
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="min-h-11 font-semibold text-slate-500 hover:underline"
            >
              {copy.clearLabel}
            </button>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {plates.map((plate) => {
              const checked = selected.includes(plate);
              return (
                <li key={plate}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggle(plate)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-4 w-4 flex-none items-center justify-center rounded border ${
                        checked ? "border-accent bg-accent text-white" : "border-slate-300 bg-white"
                      }`}
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="font-mono">{plate}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AnalitikFilters({
  rangeDays,
  onRangeChange,
  plates,
  selectedPlates,
  onPlatesChange,
  hasFilter,
  onReset,
  summaryText,
}) {
  const copy = analitikPage.filters;

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label={copy.rangeLabel}
          className="inline-flex rounded-full border border-slate-300 bg-white p-1"
        >
          {copy.ranges.map((range) => {
            const active = range.days === rangeDays;
            return (
              <button
                key={range.days}
                type="button"
                onClick={() => onRangeChange(range.days)}
                aria-pressed={active}
                className={`min-h-9 rounded-full px-4 text-sm font-semibold transition-colors ${
                  active ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        <PlateMultiSelect
          plates={plates}
          selected={selectedPlates}
          onChange={onPlatesChange}
        />

        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-white hover:text-accent"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            {copy.resetLabel}
          </button>
        )}

        <p className="ml-auto text-sm text-slate-500" aria-live="polite">
          {summaryText}
        </p>
      </div>
    </div>
  );
}
