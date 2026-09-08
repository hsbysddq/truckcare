"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { analitikPage } from "@/lib/content";

const ROW_HEIGHT = 40;

export default function SpeedingByPlateChart({ data }) {
  const copy = analitikPage.charts.speedingByPlate;
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? data : data.slice(0, copy.topCount);
  const hasMore = data.length > copy.topCount;
  const height = Math.max(rows.length * ROW_HEIGHT + 32, 160);

  return (
    <div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 40, bottom: 0, left: 8 }}
            barCategoryGap="35%"
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
              tick={{ fontSize: 12, fill: "#334155", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={96}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
              formatter={(value) => [`${value} ${copy.unit}`, copy.title]}
            />
            <Bar dataKey="count" fill="#1b4f9c" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline"
        >
          {showAll ? copy.showTopLabel : `${copy.showAllLabel} (${data.length})`}
        </button>
      )}
    </div>
  );
}
