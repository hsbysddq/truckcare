"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { truckStatusMeta, petaPage } from "@/lib/content";

const TruckMap = dynamic(() => import("@/components/dashboard/TruckMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Memuat peta...
    </div>
  ),
});

const REFRESH_MS = 3000;

function formatWaktu(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PetaPage() {
  const [trucks, setTrucks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let batal = false;
    // Gagal 3x beruntun (~9 detik) = sumber data mati: kosongkan supaya
    // empty state muncul, jangan pajang posisi basi sebagai live.
    let gagalBeruntun = 0;
    async function muat() {
      try {
        const res = await fetch("/api/trucks", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch gagal");
        const data = await res.json();
        if (batal || !Array.isArray(data)) return;
        gagalBeruntun = 0;
        setTrucks(data);
      } catch {
        gagalBeruntun += 1;
        if (!batal && gagalBeruntun >= 3) setTrucks([]);
      }
    }
    muat();
    const interval = setInterval(muat, REFRESH_MS);
    return () => {
      batal = true;
      clearInterval(interval);
    };
  }, []);

  const terpeta = useMemo(
    () => trucks.filter((t) => Number.isFinite(t.lat) && Number.isFinite(t.lng)),
    [trucks]
  );
  const selected = useMemo(
    () => trucks.find((t) => t.id === selectedId) ?? terpeta[0] ?? null,
    [trucks, selectedId, terpeta]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {petaPage.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{petaPage.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="relative h-[60vh] overflow-hidden rounded-2xl border border-slate-200 bg-white lg:h-[calc(100vh-13rem)]">
          <TruckMap
            trucks={trucks}
            selectedTruckId={selected?.id ?? null}
            onSelectTruck={setSelectedId}
          />
          {terpeta.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-50/80 p-6">
              <p className="max-w-sm text-center text-sm text-slate-500">
                {petaPage.emptyMessage}
              </p>
            </div>
          )}
        </div>

        <aside className="flex h-fit flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              {petaPage.panelTitle}
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {terpeta.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 border-b border-slate-100 px-5 py-3">
            {truckStatusMeta &&
              Object.entries(truckStatusMeta).map(([key, meta]) => (
                <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: meta.markerColor }}
                  />
                  {meta.label}
                </span>
              ))}
          </div>

          <div className="max-h-[380px] flex-1 space-y-2 overflow-y-auto p-3 lg:max-h-none">
            {terpeta.map((truck) => {
              const status = truckStatusMeta[truck.status] ?? truckStatusMeta.istirahat;
              const aktif = truck.id === selected?.id;
              return (
                <button
                  key={truck.id}
                  type="button"
                  onClick={() => setSelectedId(truck.id)}
                  className={`flex w-full flex-col gap-1.5 rounded-xl border px-4 py-3 text-left transition-colors ${
                    aktif
                      ? "border-accent bg-accent-tint/50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      {truck.plateNumber}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>
                      {truck.speedKph ?? 0} {petaPage.speedUnit}
                    </span>
                    <span>
                      {truck.origin ? `${truck.origin} → ${truck.destination ?? ""}` : formatWaktu(truck.lastUpdate)}
                    </span>
                  </div>
                </button>
              );
            })}
            {terpeta.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-slate-400">
                {petaPage.emptyMessage}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}