"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getTrucks, getTruckHistory } from "@/lib/data";
import { overviewPage } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import TruckDetailPanel from "@/components/dashboard/TruckDetailPanel";
import TruckSelect from "@/components/dashboard/TruckSelect";

const TruckMap = dynamic(() => import("@/components/dashboard/TruckMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      Memuat peta...
    </div>
  ),
});

export default function DashboardOverviewPage() {
  // Dummy dulu biar langsung tampil, timpa dengan data live kalau API balas.
  const [trucks, setTrucks] = useState(() => getTrucks());
  // Mulai tanpa pilihan supaya peta menampilkan seluruh armada dulu.
  const [selectedTruckId, setSelectedTruckId] = useState(null);

  useEffect(() => {
    let batal = false;
    async function muat() {
      try {
        const res = await fetch("/api/trucks", { cache: "no-store" });
        // API valid (bahkan kosong) selalu dipercaya; dummy cuma kalau gagal.
        if (!batal && res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setTrucks(data);
        }
      } catch {}
    }
    muat();
    // Polling seperti halaman Peta: simulator jalan terus, fetch sekali
    // saat mount bikin peta overview cepat basi dibanding bot.
    const interval = setInterval(muat, 5000);
    return () => {
      batal = true;
      clearInterval(interval);
    };
  }, []);

  const selectedTruck = useMemo(
    () => trucks.find((truck) => truck.id === selectedTruckId) ?? null,
    [trucks, selectedTruckId]
  );
  const history = useMemo(
    () => (selectedTruck ? getTruckHistory(selectedTruck.id) : null),
    [selectedTruck]
  );

  const counts = useMemo(
    () => ({
      total: trucks.length,
      bergerak: trucks.filter((truck) => truck.status === "bergerak").length,
      istirahat: trucks.filter((truck) => truck.status === "istirahat").length,
      insiden: trucks.filter((truck) => truck.status === "insiden").length,
    }),
    [trucks]
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {overviewPage.statCards.map((card) => {
          const Icon = iconMap[card.icon];
          const isDanger = card.key === "insiden";
          return (
            <div
              key={card.key}
              className={`rounded-2xl border p-6 ${
                isDanger
                  ? "border-red-100 bg-red-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDanger ? "text-red-600" : "text-slate-500"
                    }`}
                  >
                    {card.label}
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold tracking-tight ${
                      isDanger ? "text-red-700" : "text-slate-900"
                    }`}
                  >
                    {counts[card.key]}
                  </p>
                </div>
                <span
                  className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${
                    isDanger
                      ? "bg-red-100 text-red-600"
                      : "bg-accent-tint text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {overviewPage.mapCardTitle}
            </h2>
            {/* Satu state (selectedTruckId) dipakai dropdown, marker peta, dan panel detail. */}
            <TruckSelect
              trucks={trucks}
              selectedTruckId={selectedTruckId}
              onSelect={setSelectedTruckId}
            />
          </div>
          <div className="mt-4 h-[420px] overflow-hidden rounded-xl">
            <TruckMap
              trucks={trucks}
              selectedTruckId={selectedTruckId}
              onSelectTruck={setSelectedTruckId}
            />
          </div>
        </div>

        <TruckDetailPanel truck={selectedTruck} history={history} />
      </div>
    </div>
  );
}
