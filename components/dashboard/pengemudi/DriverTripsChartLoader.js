"use client";

// Grafik perjalanan pengemudi (recharts) dimuat dinamis dengan skeleton.
import dynamic from "next/dynamic";
import ChartSkeleton from "@/components/dashboard/ChartSkeleton";

const DriverTripsChart = dynamic(() => import("@/components/dashboard/pengemudi/DriverTripsChart"), {
  ssr: false,
  loading: () => <ChartSkeleton heightClass="h-64" />,
});

export default function DriverTripsChartLoader(props) {
  return <DriverTripsChart {...props} />;
}
