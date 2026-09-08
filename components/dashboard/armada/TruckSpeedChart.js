"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { truckDetailPage } from "@/lib/content";

export default function TruckSpeedChart({ data, limitKph }) {
  const copy = truckDetailPage.speedChart;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            domain={[0, (max) => Math.max(100, Math.ceil(max / 10) * 10)]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value) => [`${value} ${copy.unit}`, copy.seriesLabel]}
            labelFormatter={(label) => `${copy.timeLabel} ${label}`}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
          />
          <ReferenceLine
            y={limitKph}
            stroke="#dc2626"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: `${copy.limitLabel} ${limitKph} ${copy.unit}`,
              position: "insideTopRight",
              fill: "#dc2626",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="speedKph"
            stroke="#1b4f9c"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#1b4f9c" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
