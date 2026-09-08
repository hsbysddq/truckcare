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
  ReferenceLine,
} from "recharts";
import { analitikPage } from "@/lib/content";

const ACCENT = "#1b4f9c";
const DANGER = "#dc2626";
const FLEET = "#94a3b8";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Label pill di atas titik sorot (rect membulat + teks putih), seperti
// referensi. viewBox dari ReferenceDot = kotak lingkaran; pusat = x + w/2.
function PillLabel({ viewBox, text, color }) {
  const cx = viewBox.x + viewBox.width / 2;
  const top = viewBox.y;
  const width = text.length * 7 + 16;
  const height = 22;
  const y = top - height - 10;
  return (
    <g>
      <rect
        x={cx - width / 2}
        y={y}
        width={width}
        height={height}
        rx={11}
        fill={color}
      />
      <polygon
        points={`${cx - 4},${y + height} ${cx + 4},${y + height} ${cx},${y + height + 5}`}
        fill={color}
      />
      <text
        x={cx}
        y={y + height / 2 + 4}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#ffffff"
      >
        {text}
      </text>
    </g>
  );
}

function FuelTooltip({ active, payload, copy }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const status = point.anomaly
    ? fill(copy.tooltip.anomaly, { drop: point.dropPct })
    : point.refill
      ? copy.tooltip.refill
      : copy.tooltip.normal;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-slate-700">{point.label}</p>
      <p className="mt-1 text-slate-600">
        {copy.tooltip.levelLabel}:{" "}
        <span className="font-semibold text-slate-900">{point.fuelPct}%</span>
      </p>
      {point.fleetAvgPct !== null && (
        <p className="text-slate-500">
          {copy.tooltip.fleetLabel}: {point.fleetAvgPct}%
        </p>
      )}
      <p className={`mt-1 ${point.anomaly ? "font-semibold text-red-600" : "text-slate-500"}`}>
        {copy.tooltip.statusLabel}: {status}
      </p>
    </div>
  );
}

function Sparkline({ points }) {
  return (
    <div className="h-7 w-20 flex-none" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Line
            type="monotone"
            dataKey="fuelPct"
            stroke={ACCENT}
            strokeWidth={1.5}
            dot={(props) =>
              props.payload.anomaly ? (
                <circle
                  key={`sp-${props.index}`}
                  cx={props.cx}
                  cy={props.cy}
                  r={3.5}
                  fill={DANGER}
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
  const refills = selected.points.filter((p) => p.refill);
  const tickInterval = selected.points.length > 45 ? 9 : selected.points.length > 10 ? 3 : 0;
  const summary = [
    {
      label: copy.summary.avgDailyLabel,
      value: `${selected.avgDailyUse} ${copy.summary.avgDailyUnit}`,
    },
    { label: copy.summary.refillLabel, value: `${selected.refillCount}×` },
    {
      label: copy.summary.anomalyLabel,
      value: String(selected.anomalyCount),
      danger: selected.anomalyCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:h-80 md:grid-cols-[minmax(0,15rem)_1fr]">
      <ul
        role="listbox"
        aria-label={copy.title}
        className="max-h-56 space-y-1 overflow-y-auto pr-1 md:max-h-80"
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
                      ? fill(copy.anomalyBadge, { n: truck.anomalyCount })
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
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-semibold text-slate-700">
            {fill(copy.detailTitle, { plate: selected.plateNumber })}
          </p>
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {summary.map((item) => (
              <div key={item.label} className="flex items-baseline gap-1">
                <dt>{item.label}</dt>
                <dd className={`font-semibold ${item.danger ? "text-red-600" : "text-slate-900"}`}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: ACCENT }} />
            {fill(copy.legend.truck, { plate: selected.plateNumber })}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: FLEET }} />
            {copy.legend.fleet}
          </span>
        </div>

        <div className="mt-2 h-56 min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={selected.points}
              margin={{ top: 36, right: 12, bottom: 0, left: -16 }}
            >
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval={tickInterval}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<FuelTooltip copy={copy} />} />
              <Line
                type="monotone"
                dataKey="fleetAvgPct"
                stroke={FLEET}
                strokeWidth={1.5}
                strokeOpacity={0.7}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="fuelPct"
                stroke={ACCENT}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
              />
              {refills.map((point) => (
                <ReferenceDot
                  key={`refill-${point.date}`}
                  x={point.label}
                  y={point.fuelPct}
                  r={5}
                  fill="#ffffff"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                />
              ))}
              {anomalies.map((point) => (
                <ReferenceLine
                  key={`line-${point.date}`}
                  segment={[
                    { x: point.label, y: 0 },
                    { x: point.label, y: point.fuelPct },
                  ]}
                  stroke={DANGER}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              ))}
              {anomalies.map((point) => (
                <ReferenceDot
                  key={`anomali-${point.date}`}
                  x={point.label}
                  y={point.fuelPct}
                  r={6}
                  fill="#ffffff"
                  stroke={DANGER}
                  strokeWidth={3}
                  label={(props) => (
                    <PillLabel
                      viewBox={props.viewBox}
                      text={`${point.fuelPct}%`}
                      color={DANGER}
                    />
                  )}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
