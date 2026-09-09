"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { overviewPage, truckStatusMeta } from "@/lib/content";

// Pemilih truk TUNGGAL untuk Overview (bukan multi-pilih seperti filter
// armada di Analitik): panel detail hanya menampilkan satu truk.
// State pilihan dipegang halaman, sama dengan yang dipakai marker peta.
export default function TruckSelect({ trucks, selectedTruckId, onSelect }) {
  const copy = overviewPage.truckSelect;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listboxId = useId();

  const selected = trucks.find((t) => t.id === selectedTruckId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trucks;
    return trucks.filter((t) =>
      [t.plateNumber, t.vehicleType, t.driverName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [trucks, query]);

  useEffect(() => {
    if (!open) return undefined;
    setQuery("");
    setHighlight(Math.max(trucks.findIndex((t) => t.id === selectedTruckId), 0));
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, trucks, selectedTruckId]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${highlight}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function choose(truck) {
    onSelect(truck.id);
    setOpen(false);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[highlight]) choose(filtered[highlight]);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.label}
        className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto sm:justify-start"
      >
        <span className={selected ? "font-mono" : ""}>
          {selected ? selected.plateNumber : copy.placeholder}
        </span>
        <ChevronDown className="h-4 w-4 flex-none text-slate-400" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          onKeyDown={onKeyDown}
          className="absolute left-0 right-0 z-popover mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10 sm:left-auto sm:w-80"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={1.75}
            />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-controls={listboxId}
              aria-expanded="true"
              aria-autocomplete="list"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="min-h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
            />
          </div>

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={copy.label}
            className="mt-2 max-h-80 overflow-y-auto"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-400">
                {copy.noResults}
              </li>
            )}
            {filtered.map((truck, index) => {
              const status = truckStatusMeta[truck.status] ?? truckStatusMeta.istirahat;
              const isSelected = truck.id === selectedTruckId;
              const isHighlighted = index === highlight;
              return (
                <li key={truck.id} data-index={index}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(truck)}
                    onMouseEnter={() => setHighlight(index)}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "bg-accent-tint"
                        : isHighlighted
                          ? "bg-slate-50"
                          : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-sm font-semibold text-slate-900">
                        {truck.plateNumber}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {truck.driverName ?? truck.vehicleType ?? "-"}
                      </span>
                    </span>
                    <span
                      className={`inline-flex flex-none items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 flex-none text-accent" strokeWidth={2.5} />
                    )}
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
