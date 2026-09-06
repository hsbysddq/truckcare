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

export default function SpeedingByPlateChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 24, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="plateNumber"
            tick={{ fontSize: 12, fill: "#334155" }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
            formatter={(value) => [`${value} insiden`, "Jumlah"]}
          />
          <Bar dataKey="count" fill="#1b4f9c" radius={[0, 6, 6, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
