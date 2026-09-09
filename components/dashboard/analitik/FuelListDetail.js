"use client";

import { useEffect, useState } from "react";
import GlossaryText from "@/components/dashboard/GlossaryText";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  Cell,
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
const CHART_MARGIN = { top: 48, right: 32, bottom: 8, left: 8 };

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// Label pill untuk titik sorot (rect membulat + teks putih), seperti
// referensi. viewBox dari ReferenceDot = kotak lingkaran; pusat = x + w/2.
// Pill diberi jarak dari cincin; bila titik terlalu dekat tepi atas, pill
// dibalik ke bawah titik supaya tidak terpotong.
const PILL_GAP = 14;
const PILL_HEIGHT = 22;
function PillLabel({ viewBox, text, color }) {
  const cx = viewBox.x + viewBox.width / 2;
  const width = text.length * 7 + 16;
  const above = viewBox.y - PILL_GAP - PILL_HEIGHT >= 2;
  const y = above
    ? viewBox.y - PILL_GAP - PILL_HEIGHT
    : viewBox.y + viewBox.height + PILL_GAP;
  const tipY = above ? y + PILL_HEIGHT : y;
  const tipPoint = above ? tipY + 5 : tipY - 5;
  return (
    <g>
      <rect x={cx - width / 2} y={y} width={width} height={PILL_HEIGHT} rx={11} fill={color} />
      <polygon
        points={`${cx - 4},${tipY} ${cx + 4},${tipY} ${cx},${tipPoint}`}
        fill={color}
      />
      <text
        x={cx}
        y={y + PILL_HEIGHT / 2 + 4}
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

function FuelTooltip({ active, payload, copy, view }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const status = point.anomaly
    ? fill(copy.tooltip.anomaly, {
        drop: point.dropLiters,
        loss: point.lossLabel,
      })
    : point.refill
      ? copy.tooltip.refill
      : copy.tooltip.normal;
  const primary =
    view === "usage"
      ? { label: copy.tooltip.usedLabel, value: point.usedLiters, fleet: point.fleetAvgUsedLiters }
      : { label: copy.tooltip.levelLabel, value: point.liters, fleet: point.fleetAvgLiters };
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-slate-700">{point.label}</p>
      <p className="mt-1 text-slate-600">
        {primary.label}:{" "}
        <span className="font-semibold text-slate-900">
          {primary.value} {copy.unit}
        </span>
      </p>
      {primary.fleet !== null && (
        <p className="text-slate-500">
          {copy.tooltip.fleetLabel}: {primary.fleet} {copy.unit}
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
            dataKey="liters"
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

const AXIS_TICK = { fontSize: 11, fill: "#64748b" };
const X_AXIS_PROPS = {
  dataKey: "label",
  tick: { fontSize: 11, fill: "#64748b" },
  tickLine: false,
  axisLine: { stroke: "#e2e8f0" },
  interval: "preserveStartEnd",
  minTickGap: 28,
  tickMargin: 10,
  height: 36,
};

function yAxisLabel(text) {
  return {
    value: text,
    angle: -90,
    position: "insideLeft",
    offset: 12,
    style: { fontSize: 11, fill: "#94a3b8", textAnchor: "middle" },
  };
}

function LevelChart({ truck, copy }) {
  const anomalies = truck.points.filter((p) => p.anomaly);
  const refills = truck.points.filter((p) => p.refill);
  return (
    <LineChart data={truck.points} margin={CHART_MARGIN}>
      <CartesianGrid stroke="#e2e8f0" vertical={false} />
      <XAxis {...X_AXIS_PROPS} />
      <YAxis
        domain={[0, truck.capacityLiters]}
        tick={AXIS_TICK}
        tickLine={false}
        axisLine={false}
        width={56}
        label={yAxisLabel(copy.yAxisLevel)}
      />
      <Tooltip content={<FuelTooltip copy={copy} view="level" />} />
      <Line
        type="monotone"
        dataKey="fleetAvgLiters"
        stroke={FLEET}
        strokeWidth={1.5}
        strokeOpacity={0.7}
        dot={false}
        activeDot={false}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="liters"
        stroke={ACCENT}
        strokeWidth={2.5}
        dot={false}
        activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
      />
      {refills.map((point) => (
        <ReferenceDot
          key={`refill-${point.date}`}
          x={point.label}
          y={point.liters}
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
            { x: point.label, y: point.liters },
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
          y={point.liters}
          r={6}
          fill="#ffffff"
          stroke={DANGER}
          strokeWidth={3}
          label={(props) => (
            <PillLabel
              viewBox={props.viewBox}
              text={fill(copy.pill, { value: point.liters })}
              color={DANGER}
            />
          )}
        />
      ))}
    </LineChart>
  );
}

function UsageChart({ truck, copy }) {
  const anomalies = truck.points.filter((p) => p.anomaly);
  return (
    <ComposedChart data={truck.points} margin={CHART_MARGIN} barCategoryGap="30%">
      <CartesianGrid stroke="#e2e8f0" vertical={false} />
      <XAxis {...X_AXIS_PROPS} />
      <YAxis
        tick={AXIS_TICK}
        tickLine={false}
        axisLine={false}
        width={56}
        allowDecimals={false}
        label={yAxisLabel(copy.yAxisUsage)}
      />
      <Tooltip
        cursor={{ fill: "#f1f5f9" }}
        content={<FuelTooltip copy={copy} view="usage" />}
      />
      <Bar dataKey="usedLiters" radius={[4, 4, 0, 0]} maxBarSize={24}>
        {truck.points.map((point) => (
          <Cell key={point.date} fill={point.anomaly ? DANGER : ACCENT} />
        ))}
      </Bar>
      <Line
        type="monotone"
        dataKey="fleetAvgUsedLiters"
        stroke={FLEET}
        strokeWidth={1.5}
        strokeOpacity={0.7}
        dot={false}
        activeDot={false}
        isAnimationActive={false}
      />
      <ReferenceLine
        y={truck.avgDailyUseLiters}
        stroke={ACCENT}
        strokeDasharray="6 4"
        strokeWidth={1.5}
      />
      {anomalies.map((point) => (
        <ReferenceDot
          key={`anomali-${point.date}`}
          x={point.label}
          y={point.usedLiters}
          r={6}
          fill="#ffffff"
          stroke={DANGER}
          strokeWidth={3}
          label={(props) => (
            <PillLabel
              viewBox={props.viewBox}
              text={fill(copy.pill, { value: point.usedLiters })}
              color={DANGER}
            />
          )}
        />
      ))}
    </ComposedChart>
  );
}

export default function FuelListDetail({ trucks }) {
  const copy = analitikPage.charts.fuel;
  const [selectedPlate, setSelectedPlate] = useState(trucks[0]?.plateNumber ?? null);
  const [view, setView] = useState("level");

  // Truk pertama terpilih otomatis; jaga pilihan tetap valid saat filter berubah.
  useEffect(() => {
    if (!trucks.some((t) => t.plateNumber === selectedPlate)) {
      setSelectedPlate(trucks[0]?.plateNumber ?? null);
    }
  }, [trucks, selectedPlate]);

  const selected = trucks.find((t) => t.plateNumber === selectedPlate) ?? trucks[0];
  if (!selected) return null;

  const summary = [
    {
      label: copy.summary.avgDailyLabel,
      value: `${selected.avgDailyUseLiters} ${copy.summary.avgDailyUnit}`,
    },
    { label: copy.summary.refillLabel, value: `${selected.refillCount}×` },
    {
      label: copy.summary.anomalyLabel,
      value: String(selected.anomalyCount),
      danger: selected.anomalyCount > 0,
    },
    {
      label: copy.summary.lossLabel,
      value: selected.lossRupiahLabel,
      danger: selected.lossRupiah > 0,
    },
  ];
  const legendTruck =
    view === "usage"
      ? fill(copy.legend.usageTruck, { plate: selected.plateNumber })
      : fill(copy.legend.truck, { plate: selected.plateNumber });

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
      <ul
        role="listbox"
        aria-label={copy.title}
        className="max-h-56 space-y-1 overflow-y-auto pr-1 md:max-h-[460px]"
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
                  {truck.vehicleType && (
                    <span className="block truncate text-[11px] text-slate-400">{truck.vehicleType}</span>
                  )}
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
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700">
              {fill(copy.detailTitle, { plate: selected.plateNumber })}
              <span className="ml-2 text-xs font-normal text-slate-400">
                {fill(copy.capacityLabel, { capacity: selected.capacityLiters })}
              </span>
            </p>
            <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {summary.map((item) => (
                <div key={item.label} className="flex items-baseline gap-1">
                  <dt><GlossaryText text={item.label} /></dt>
                  <dd className={`font-semibold ${item.danger ? "text-red-600" : "text-slate-900"}`}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            role="group"
            aria-label={copy.title}
            className="inline-flex flex-none rounded-full border border-slate-200 bg-white p-0.5"
          >
            {Object.entries(copy.views).map(([key, label]) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={active}
                  className={`min-h-9 rounded-full px-3 text-xs font-semibold transition-colors ${
                    active ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: ACCENT }} />
            {legendTruck}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: FLEET }} />
            {copy.legend.fleet}
          </span>
          {view === "usage" && (
            <span className="flex items-center gap-1.5">
              <span
                className="h-0 w-4 border-t-2 border-dashed"
                style={{ borderColor: ACCENT }}
              />
              {fill(copy.legend.normalLine, { avg: selected.avgDailyUseLiters })}
            </span>
          )}
        </div>

        <div className="mt-2 h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {view === "usage" ? (
              <UsageChart truck={selected} copy={copy} />
            ) : (
              <LevelChart truck={selected} copy={copy} />
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
