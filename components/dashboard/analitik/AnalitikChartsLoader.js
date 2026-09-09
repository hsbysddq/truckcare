"use client";

// Grafik recharts halaman Analitik dimuat dinamis (ssr: false) dengan
// skeleton, supaya kerangka halaman dan kartu metrik tampil tanpa menunggu
// bundle recharts.
import dynamic from "next/dynamic";
import ChartSkeleton from "@/components/dashboard/ChartSkeleton";

const muat = (importer, heightClass) =>
  dynamic(importer, { ssr: false, loading: () => <ChartSkeleton heightClass={heightClass} /> });

export const ComplaintsTrendChart = muat(
  () => import("@/components/dashboard/analitik/ComplaintsTrendChart"),
  "h-72"
);
export const HourDistributionChart = muat(
  () => import("@/components/dashboard/analitik/HourDistributionChart"),
  "h-72"
);
export const SpeedingByPlateChart = muat(
  () => import("@/components/dashboard/analitik/SpeedingByPlateChart"),
  "h-72"
);
export const FuelListDetail = muat(
  () => import("@/components/dashboard/analitik/FuelListDetail"),
  "h-72"
);
