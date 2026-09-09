"use client";

import { useCallback, useEffect, useState } from "react";
import { analitikPage } from "@/lib/content";
import { DEFAULT_RANGE_DAYS } from "@/lib/analytics";
import AnalitikFilters from "@/components/dashboard/analitik/AnalitikFilters";
import MetricCard from "@/components/dashboard/analitik/MetricCard";
import ChartCard from "@/components/dashboard/analitik/ChartCard";
import ExportCsvButton from "@/components/dashboard/analitik/ExportCsvButton";
import ComplaintsTrendChart from "@/components/dashboard/analitik/ComplaintsTrendChart";
import SpeedingByPlateChart from "@/components/dashboard/analitik/SpeedingByPlateChart";
import FuelListDetail from "@/components/dashboard/analitik/FuelListDetail";
import HourDistributionChart from "@/components/dashboard/analitik/HourDistributionChart";
import ViolationMapLoader from "@/components/dashboard/analitik/ViolationMapLoader";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] === undefined ? "" : String(vars[key])
  );
}

export default function AnalitikDashboard() {
  const copy = analitikPage;
  const [rangeDays, setRangeDays] = useState(DEFAULT_RANGE_DAYS);
  const [selectedPlates, setSelectedPlates] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    const params = new URLSearchParams({ range: String(rangeDays) });
    if (selectedPlates.length) params.set("plates", selectedPlates.join(","));
    if (data) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?${params}`, { cache: "no-store", signal });
      if (!res.ok) throw new Error(`analitik gagal: ${res.status}`);
      setData(await res.json());
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(copy.errorLabel);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDays, selectedPlates]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function reset() {
    setRangeDays(DEFAULT_RANGE_DAYS);
    setSelectedPlates([]);
  }

  const metricValue = (card) => {
    const m = data?.metrics?.[card.key];
    if (!m) return "-";
    return `${m.value}${card.suffix ?? ""}`;
  };
  const metricSubtext = (card) => {
    const m = data?.metrics?.[card.key];
    return card.subtext && m ? fill(card.subtext, m) : undefined;
  };
  const compareLabel = fill(copy.compareLabel, { days: rangeDays });
  const empty = Boolean(data?.summary?.empty);
  const dimmed = refreshing ? "opacity-60 transition-opacity" : "transition-opacity";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
        </div>
        <ExportCsvButton
          data={data?.dailyTrend?.data ?? []}
          filename={copy.exportFilename}
          label={copy.exportButtonLabel}
        />
      </div>

      <AnalitikFilters
        rangeDays={rangeDays}
        onRangeChange={setRangeDays}
        plates={data?.plates ?? []}
        selectedPlates={selectedPlates}
        onPlatesChange={setSelectedPlates}
        hasFilter={rangeDays !== DEFAULT_RANGE_DAYS || selectedPlates.length > 0}
        onReset={reset}
        summaryText={data?.summary?.text ?? copy.loadingLabel}
      />

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold hover:bg-red-100"
          >
            {copy.retryLabel}
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 ${dimmed}`}>
        {copy.metricCards.map((card) => (
          <MetricCard
            key={card.key}
            loading={loading}
            label={card.label}
            icon={card.icon}
            value={metricValue(card)}
            subtext={metricSubtext(card)}
            delta={data?.metrics?.[card.key]}
            goodWhen={card.goodWhen}
            compareLabel={compareLabel}
            noCompareLabel={copy.noCompareLabel}
          />
        ))}
      </div>

      <div className={`grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 ${dimmed}`}>
        <ChartCard
          title={copy.charts.dailyTrend.title}
          subtitle={copy.charts.dailyTrend.subtitle}
          insight={data?.dailyTrend?.insight}
          loading={loading}
          empty={empty || data?.dailyTrend?.empty}
        >
          {data && (
            <ComplaintsTrendChart
              data={data.dailyTrend.data}
              seriesLabels={copy.charts.dailyTrend.seriesLabels}
              seriesColors={copy.charts.dailyTrend.seriesColors}
            />
          )}
        </ChartCard>

        <ChartCard
          title={copy.charts.hourDistribution.title}
          subtitle={copy.charts.hourDistribution.subtitle}
          insight={data?.hourDistribution?.insight}
          loading={loading}
          empty={empty || data?.hourDistribution?.empty}
        >
          {data && <HourDistributionChart data={data.hourDistribution.data} />}
        </ChartCard>
      </div>

      <div className={dimmed}>
        <ChartCard
          title={copy.charts.speedingByPlate.title}
          subtitle={copy.charts.speedingByPlate.subtitle}
          insight={data?.speedingByPlate?.insight}
          loading={loading}
          empty={empty || data?.speedingByPlate?.empty}
        >
          {data && <SpeedingByPlateChart data={data.speedingByPlate.data} />}
        </ChartCard>
      </div>

      <div className={dimmed}>
        <ChartCard
          title={copy.charts.fuel.title}
          subtitle={copy.charts.fuel.subtitle}
          insight={data?.fuelByTruck?.insight}
          loading={loading}
          empty={empty || data?.fuelByTruck?.empty}
        >
          {data && <FuelListDetail trucks={data.fuelByTruck.trucks} />}
        </ChartCard>
      </div>

      <div className={dimmed}>
        <ChartCard
          title={copy.charts.violationMap.title}
          subtitle={copy.charts.violationMap.subtitle}
          insight={data?.violationLocations?.insight}
          loading={loading}
          empty={empty || data?.violationLocations?.empty}
        >
          {data && (
            <div className="relative z-0 isolate h-[380px] overflow-hidden rounded-xl">
              <ViolationMapLoader locations={data.violationLocations.data} />
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
