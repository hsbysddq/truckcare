"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import { analitikPage } from "@/lib/content";

function Sparkline({ points }) {
  return (
    <div className="h-7 w-20 flex-none" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Line
            type="monotone"
            dataKey="liters"
            stroke="#1b4f9c"
            strokeWidth={2}
            dot={(props) =>
              props.payload.anomaly ? (
                <circle
                  key={`sp-${props.index}`}
                  cx={props.cx}
                  cy={props.cy}
                  r={3.5}
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              ) : null
            }
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function FuelListDetail({ trucks }) {
  const copy = analitikPage.charts.fuel;
  const [selectedPlate, setSelectedPlate] = useState(trucks[0]?.plateNumber ?? null);

  // Truk pertama terpilih otomatis; jaga pilihan tetap valid saat filter berubah.
  useEffect(() => {
    if (!trucks.some((t) => t.plateNumber === selectedPlate)) {
      setSelectedPlate(trucks[0]?.plateNumber ?? null);
    }
  }, [trucks, selectedPlate]);

  const selected = trucks.find((t) => t.plateNumber === selectedPlate) ?? trucks[0];
  if (!selected) return null;
  const anomalies = selected.points.filter((p) => p.anomaly);

  return (
    <div className="grid h-72 grid-cols-1 gap-4 md:grid-cols-[minmax(0,15rem)_1fr]">
      <ul
        role="listbox"
        aria-label={copy.title}
        className="max-h-72 space-y-1 overflow-y-auto pr-1"
      >
        {trucks.map((truck) => {
          const active = truck.plateNumber === selected.plateNumber;
          return (
            <li key={truck.plateNumber}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => setSelectedPlate(truck.plateNumber)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-1.5 text-left transition-colors ${
                  active
                    ? "border-accent bg-accent-tint/60"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-sm font-semibold text-slate-900">
                    {truck.plateNumber}
                  </span>
                  <span
                    className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      truck.anomalyCount > 0
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {truck.anomalyCount > 0
                      ? copy.anomalyBadge.replace("{n}", truck.anomalyCount)
                      : copy.normalBadge}
                  </span>
                </span>
                <Sparkline points={truck.points} />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex min-w-0 flex-col">
        <p className="text-sm font-semibold text-slate-700">
          {copy.detailTitle.replace("{plate}", selected.plateNumber)}
        </p>
        <div className="mt-2 min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selected.points} margin={{ top: 16, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
                formatter={(value) => [`${value} ${copy.unit}`, selected.plateNumber]}
              />
              <Line
                type="monotone"
                dataKey="liters"
                stroke="#1b4f9c"
                strokeWidth={2}
                dot={{ r: 4, fill: "#1b4f9c", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              {anomalies.map((point) => (
                <ReferenceDot
                  key={point.week}
                  x={point.week}
                  y={point.liters}
                  r={7}
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
