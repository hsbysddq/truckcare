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

export default function ComplaintsTrendChart({ data, seriesLabels, seriesColors }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={30}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
            formatter={(value, name) => [value, seriesLabels[name] ?? name]}
          />
          <Legend
            formatter={(value) => seriesLabels[value] ?? value}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar dataKey="menunggu" stackId="a" fill={seriesColors.menunggu} />
          <Bar dataKey="tervalidasi" stackId="a" fill={seriesColors.tervalidasi} />
          <Bar dataKey="ditolak" stackId="a" fill={seriesColors.ditolak} />
          <Bar
            dataKey="perluDitinjau"
            stackId="a"
            fill={seriesColors.perluDitinjau}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
