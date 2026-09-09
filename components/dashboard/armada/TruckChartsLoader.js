"use client";

// Grafik kecepatan & solar detail armada (recharts) dimuat dinamis dari
// halaman server app/dashboard/armada/[id]; skeleton tampil lebih dulu.
import dynamic from "next/dynamic";
import ChartSkeleton from "@/components/dashboard/ChartSkeleton";

const TruckSpeedChart = dynamic(() => import("@/components/dashboard/armada/TruckSpeedChart"), {
  ssr: false,
  loading: () => <ChartSkeleton heightClass="h-64" />,
});
const TruckFuelChart = dynamic(() => import("@/components/dashboard/armada/TruckFuelChart"), {
  ssr: false,
  loading: () => <ChartSkeleton heightClass="h-64" />,
});

export function TruckSpeedChartLoader(props) {
  return <TruckSpeedChart {...props} />;
}
export function TruckFuelChartLoader(props) {
  return <TruckFuelChart {...props} />;
}
