"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { driverDetailPage } from "@/lib/content";

// Satu seri (jumlah perjalanan per hari, 30 hari): tanpa legenda, satu warna.
export default function DriverTripsChart({ data }) {
  const copy = driverDetailPage.chart;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval={4}
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
            labelFormatter={(label) => label}
            formatter={(value) => [`${value} ${copy.unit}`, copy.title]}
          />
          <Bar dataKey="count" fill="#1b4f9c" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
