"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const LINE_COLORS = [
  "#0b2c5e",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#65a30d",
  "#db2777",
  "#4338ca",
  "#ea580c",
];

function buildChartRows(weeks, series) {
  return weeks.map((week, weekIndex) => {
    const row = { week };
    series.forEach((item) => {
      row[item.plateNumber] = item.values[weekIndex];
    });
    return row;
  });
}

function findAnomaly(anomalies, plateNumber, weekIndex) {
  return anomalies.find(
    (anomaly) =>
      anomaly.plateNumber === plateNumber && anomaly.weekIndex === weekIndex
  );
}

function CustomTooltip({ active, payload, label, weeks, anomalies }) {
  if (!active || !payload?.length) return null;
  const weekIndex = weeks.indexOf(label);
  const anomaliesThisWeek = anomalies.filter(
    (anomaly) => anomaly.weekIndex === weekIndex
  );

  return (
    <div className="max-w-xs rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
      <p className="font-semibold text-slate-700">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-1.5 text-slate-500">
              <span
                className="h-2 w-2 flex-none rounded-full"
                style={{ background: entry.color }}
              />
              {entry.dataKey}
            </span>
            <span className="font-medium text-slate-900">{entry.value} L</span>
          </div>
        ))}
      </div>
      {anomaliesThisWeek.map((anomaly) => (
        <p
          key={anomaly.plateNumber}
          className="mt-2 border-t border-slate-100 pt-2 text-red-600"
        >
          {anomaly.plateNumber}: {anomaly.note}
        </p>
      ))}
    </div>
  );
}

export default function FuelConsumptionChart({
  weeks,
  series,
  anomalies,
  yAxisLabel,
}) {
  const data = buildChartRows(weeks, series);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={40}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
              fontSize: 11,
            }}
          />
          <Tooltip content={<CustomTooltip weeks={weeks} anomalies={anomalies} />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {series.map((item, index) => {
            const color = LINE_COLORS[index % LINE_COLORS.length];
            return (
              <Line
                key={item.plateNumber}
                type="monotone"
                dataKey={item.plateNumber}
                stroke={color}
                strokeWidth={2}
                dot={(dotProps) => {
                  const anomaly = findAnomaly(
                    anomalies,
                    item.plateNumber,
                    dotProps.index
                  );
                  return anomaly ? (
                    <circle
                      key={`dot-${item.plateNumber}-${dotProps.index}`}
                      cx={dotProps.cx}
                      cy={dotProps.cy}
                      r={6}
                      fill="#dc2626"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ) : (
                    <circle
                      key={`dot-${item.plateNumber}-${dotProps.index}`}
                      cx={dotProps.cx}
                      cy={dotProps.cy}
                      r={2.5}
                      fill={color}
                    />
                  );
                }}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
