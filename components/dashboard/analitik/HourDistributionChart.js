"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { analitikPage } from "@/lib/content";

export default function HourDistributionChart({ data }) {
  const copy = analitikPage.charts.hourDistribution;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="25%">
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval={1}
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
            labelFormatter={(label) => `Pukul ${label}.00`}
            formatter={(value, _name, item) => [
              `${value} ${copy.unit}${item.payload.peak ? ` · ${copy.peakLabel}` : ""}`,
              copy.title,
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell key={entry.hour} fill={entry.peak ? "#f4711f" : "#1b4f9c"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
