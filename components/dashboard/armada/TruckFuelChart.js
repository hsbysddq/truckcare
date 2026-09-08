"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import { truckDetailPage } from "@/lib/content";

export default function TruckFuelChart({ data }) {
  const copy = truckDetailPage.fuelChart;
  const anomalies = data.filter((point) => point.anomaly);

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
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value) => [`${value}${copy.unit}`, copy.seriesLabel]}
            labelFormatter={(label) => `${copy.timeLabel} ${label}`}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="fuelPct"
            stroke="#059669"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#059669" }}
            activeDot={{ r: 5 }}
          />
          {anomalies.map((point) => (
            <ReferenceDot
              key={point.label}
              x={point.label}
              y={point.fuelPct}
              r={7}
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth={2}
              label={{
                value: copy.anomalyLabel,
                position: "top",
                fill: "#dc2626",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
