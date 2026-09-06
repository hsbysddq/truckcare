"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getComplaints } from "@/lib/data";
import { pengaduanManagementPage } from "@/lib/content";
import ComplaintCard from "@/components/dashboard/ComplaintCard";
import ComplaintDetailPanel from "@/components/dashboard/ComplaintDetailPanel";

export default function DashboardPengaduanPage() {
  const [complaints, setComplaints] = useState(() => getComplaints());
  const [activeFilter, setActiveFilter] = useState("semua");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(complaints[0]?.id ?? null);

  useEffect(() => {
    let batal = false;
    fetch("/api/complaints", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // API valid (bahkan kosong) selalu dipercaya; dummy cuma kalau gagal.
        if (!batal && Array.isArray(data)) {
          setComplaints(data);
          setSelectedId((sekarang) =>
            data.some((c) => c.id === sekarang) ? sekarang : (data[0]?.id ?? null)
          );
        }
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((complaint) => {
      const matchesFilter =
        activeFilter === "semua" || complaint.status === activeFilter;
      const matchesQuery =
        q === "" ||
        complaint.id.toLowerCase().includes(q) ||
        complaint.plateNumber.toLowerCase().includes(q) ||
        complaint.lokasi.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [complaints, activeFilter, query]);

  const selected = complaints.find((c) => c.id === selectedId) ?? complaints[0] ?? null;

  function handleStatusChange(id, status) {
    setComplaints((sebelum) =>
      sebelum.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {pengaduanManagementPage.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {pengaduanManagementPage.subtitle}
          </p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={pengaduanManagementPage.searchPlaceholder}
            className="min-h-11 w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            {pengaduanManagementPage.filters.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-4">
            {filtered.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                active={complaint.id === selectedId}
                onSelect={() => setSelectedId(complaint.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                {pengaduanManagementPage.noResultsMessage}
              </p>
            )}
          </div>
        </div>

        <ComplaintDetailPanel complaint={selected} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}
