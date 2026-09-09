"use client";

// Grafik bukti kecepatan (recharts) di panel detail pengaduan dimuat dinamis.
import dynamic from "next/dynamic";
import ChartSkeleton from "@/components/dashboard/ChartSkeleton";

const SpeedEvidenceChart = dynamic(() => import("@/components/dashboard/SpeedEvidenceChart"), {
  ssr: false,
  loading: () => <ChartSkeleton heightClass="h-48" />,
});

export default function SpeedEvidenceChartLoader(props) {
  return <SpeedEvidenceChart {...props} />;
}
