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
  LabelList,
} from "recharts";
import { analitikPage } from "@/lib/content";

const ACCENT = "#1b4f9c";
const TOP = "#f4711f";

// Label sumbu Y: plat (monospace) + jenis truk kecil di bawahnya.
function PlateTick({ x, y, payload, data }) {
  const row = data.find((d) => d.plateNumber === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-4} y={-2} textAnchor="end" fontSize={12} fontFamily="monospace" fill="#334155">
        {payload.value}
      </text>
      {row?.vehicleType && (
        <text x={-4} y={11} textAnchor="end" fontSize={10} fill="#94a3b8">
          {row.vehicleType}
        </text>
      )}
    </g>
  );
}

// Lebar penuh: seluruh armada ditampilkan (data sudah urut terbanyak dari
// lib/analytics.js); batang teratas diberi warna beda sebagai penyumbang
// pelanggaran terbanyak.
export default function SpeedingByPlateChart({ data }) {
  const copy = analitikPage.charts.speedingByPlate;

  return (
    // Tinggi mengikuti jumlah truk (min 400px) supaya semua label plat + jenis muat.
    <div className="w-full" style={{ height: Math.max(400, data.length * 28 + 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
          barCategoryGap="30%"
        >
          <CartesianGrid stroke="#e2e8f0" horizontal={false} />
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
            tick={<PlateTick data={data} />}
            interval={0}
            tickLine={false}
            axisLine={false}
            width={150}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
            labelFormatter={(label, items) => {
              const jenis = items?.[0]?.payload?.vehicleType;
              return jenis ? `${label} · ${jenis}` : label;
            }}
            formatter={(value, _name, item) => [
              `${value} ${copy.unit}${item.payload === data[0] ? ` · ${copy.topLabel}` : ""}`,
              copy.title,
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((row, index) => (
              <Cell key={row.plateNumber} fill={index === 0 ? TOP : ACCENT} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
