import { Download, ChevronDown } from "lucide-react";
import { getAnalytics } from "@/lib/data";
import { analitikPage } from "@/lib/content";
import MetricCard from "@/components/dashboard/analitik/MetricCard";
import ComplaintsTrendChart from "@/components/dashboard/analitik/ComplaintsTrendChart";
import FuelConsumptionChart from "@/components/dashboard/analitik/FuelConsumptionChart";
import SpeedingByPlateChart from "@/components/dashboard/analitik/SpeedingByPlateChart";
import ViolationMapLoader from "@/components/dashboard/analitik/ViolationMapLoader";

export default function AnalitikDashboardPage() {
  const analytics = getAnalytics();
  const { metrics } = analytics;

  const metricValues = {
    complaintsProcessed: {
      value: metrics.complaintsProcessed.total,
      subtext: `${metrics.complaintsProcessed.thisWeek} minggu ini`,
    },
    autoResolvedPct: {
      value: `${metrics.autoResolvedPct}%`,
      subtext: "tanpa campur tangan manusia",
    },
    avgValidationSeconds: {
      value: `${metrics.avgValidationSeconds} detik`,
      subtext: `estimasi manual: ${metrics.manualEstimateMinutes} menit`,
    },
    speedingIncidents: {
      value: metrics.speedingIncidents.total,
      subtext: `${metrics.speedingIncidents.vehiclesInvolved} truk terlibat`,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {analitikPage.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{analitikPage.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4 flex-none" strokeWidth={1.75} />
            {analitikPage.exportButtonLabel}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {analitikPage.dateRangeLabel}
            <ChevronDown className="h-4 w-4 flex-none" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {analitikPage.metricCards.map((card) => (
          <MetricCard
            key={card.key}
            label={card.label}
            icon={card.icon}
            value={metricValues[card.key].value}
            subtext={metricValues[card.key].subtext}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {analitikPage.charts.dailyTrend.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {analitikPage.charts.dailyTrend.subtitle}
          </p>
          <div className="mt-4">
            <ComplaintsTrendChart
              data={analytics.dailyComplaintsTrend}
              seriesLabels={analitikPage.charts.dailyTrend.seriesLabels}
              seriesColors={analitikPage.charts.dailyTrend.seriesColors}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {analitikPage.charts.fuelConsumption.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {analitikPage.charts.fuelConsumption.subtitle}
          </p>
          <div className="mt-4">
            <FuelConsumptionChart
              weeks={analytics.fuelConsumptionByTruck.weeks}
              series={analytics.fuelConsumptionByTruck.series}
              anomalies={analytics.fuelConsumptionByTruck.anomalies}
              yAxisLabel={analitikPage.charts.fuelConsumption.yAxisLabel}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {analitikPage.charts.speedingByPlate.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {analitikPage.charts.speedingByPlate.subtitle}
        </p>
        <div className="mt-4">
          <SpeedingByPlateChart data={analytics.speedingByPlate} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {analitikPage.charts.violationMap.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {analitikPage.charts.violationMap.subtitle}
        </p>
        <div className="mt-4 h-[420px] overflow-hidden rounded-xl">
          <ViolationMapLoader locations={analytics.violationLocations} />
        </div>
      </div>
    </div>
  );
}
