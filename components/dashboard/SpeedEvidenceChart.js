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
  ReferenceDot,
} from "recharts";

export default function SpeedEvidenceChart({
  speedSeries,
  speedLimit,
  incidentLabel,
}) {
  const incidentIndex = Math.floor(speedSeries.length / 2);
  const incidentPoint = speedSeries[incidentIndex];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={speedSeries}
          margin={{ top: 24, right: 16, bottom: 0, left: -16 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="waktu"
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
              value: "km/jam",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
              fontSize: 11,
            }}
          />
          <Tooltip
            formatter={(value) => [`${value} km/jam`, "Kecepatan"]}
            labelFormatter={(label) => `Waktu: ${label}`}
            contentStyle={{
              borderRadius: 12,
              borderColor: "#e2e8f0",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={speedLimit}
            stroke="#dc2626"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: `Batas ${speedLimit} km/jam`,
              position: "insideTopRight",
              fill: "#dc2626",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="speedKph"
            stroke="#0b2c5e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#0b2c5e" }}
            activeDot={{ r: 5 }}
          />
          <ReferenceDot
            x={incidentPoint.waktu}
            y={incidentPoint.speedKph}
            r={6}
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth={2}
            label={{
              value: incidentLabel,
              position: "top",
              fill: "#dc2626",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
