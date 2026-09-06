"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getTrucks, getTruckHistory } from "@/lib/data";
import { overviewPage } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import TruckDetailPanel from "@/components/dashboard/TruckDetailPanel";

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
  const [selectedTruckId, setSelectedTruckId] = useState(
    trucks[0]?.id ?? null
  );

  useEffect(() => {
    let batal = false;
    fetch("/api/trucks", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!batal && Array.isArray(data) && data.length > 0) setTrucks(data);
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, []);

  const selectedTruck =
    trucks.find((truck) => truck.id === selectedTruckId) ?? trucks[0] ?? null;
  const history = selectedTruck ? getTruckHistory(selectedTruck.id) : null;

  const counts = {
    total: trucks.length,
    bergerak: trucks.filter((truck) => truck.status === "bergerak").length,
    istirahat: trucks.filter((truck) => truck.status === "istirahat").length,
    insiden: trucks.filter((truck) => truck.status === "insiden").length,
  };

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
          <h2 className="text-lg font-semibold text-slate-900">
            {overviewPage.mapCardTitle}
          </h2>
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
