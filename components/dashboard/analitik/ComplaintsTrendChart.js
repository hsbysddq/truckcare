"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const SERIES_ORDER = ["tervalidasi", "perluDitinjau", "ditolak"];

export default function ComplaintsTrendChart({ data, seriesLabels, seriesColors }) {
  const tickInterval = data.length > 45 ? 9 : data.length > 10 ? 3 : 0;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
            formatter={(value, name) => [value, seriesLabels[name] ?? name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-slate-600">{seriesLabels[value] ?? value}</span>
            )}
            wrapperStyle={{ fontSize: 11 }}
          />
          {SERIES_ORDER.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="pengaduan"
              fill={seriesColors[key]}
              stroke="#ffffff"
              strokeWidth={2}
              maxBarSize={24}
              radius={index === SERIES_ORDER.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
