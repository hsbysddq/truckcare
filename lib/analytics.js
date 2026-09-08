// Semua perhitungan halaman Analitik: filter rentang/armada, metrik dengan
// pembanding periode sebelumnya, tren harian, insiden per armada, solar per
// truk, distribusi jam, sebaran lokasi, dan kalimat temuan otomatis.
// Input: bentuk getAnalyticsSource() di lib/data.js (nanti: hasil query
// Supabase dengan bentuk yang sama). Komponen hanya menampilkan hasilnya.

import { analitikPage } from "@/lib/content";

export const RANGE_OPTIONS = analitikPage.filters.ranges.map((r) => r.days);
export const DEFAULT_RANGE_DAYS = 30;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function isoLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(iso, n) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + n);
  return isoLocal(date);
}

function formatShort(iso) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] === undefined ? "" : String(vars[key])
  );
}

// Jendela (start, end]: string ISO bisa dibandingkan leksikal.
function inWindow(iso, start, end) {
  return iso > start && iso <= end;
}

function delta(value, previous) {
  const changePct =
    previous === 0 ? null : Math.round(((value - previous) / previous) * 100);
  const direction = value > previous ? "up" : value < previous ? "down" : "flat";
  return { value, previous, changePct, direction };
}

function normalizeFilters(source, filters = {}) {
  const rangeDays = RANGE_OPTIONS.includes(Number(filters.rangeDays))
    ? Number(filters.rangeDays)
    : DEFAULT_RANGE_DAYS;
  const requested = Array.isArray(filters.plates) ? filters.plates : [];
  const selectedPlates = source.plates.filter((p) => requested.includes(p));
  return { rangeDays, selectedPlates };
}

export function buildAnalytics(source, filters = {}) {
  const copy = analitikPage;
  const { rangeDays, selectedPlates } = normalizeFilters(source, filters);
  const plateSet = new Set(selectedPlates.length ? selectedPlates : source.plates);
  const end = source.endDate;
  const start = addDays(end, -rangeDays);
  const prevStart = addDays(end, -2 * rangeDays);

  const isCurrent = (e) => inWindow(e.date, start, end) && plateSet.has(e.plateNumber);
  const isPrevious = (e) => inWindow(e.date, prevStart, start) && plateSet.has(e.plateNumber);

  const complaintsCur = source.complaintEvents.filter(isCurrent);
  const complaintsPrev = source.complaintEvents.filter(isPrevious);
  const speedCur = source.speedingEvents.filter(isCurrent);
  const speedPrev = source.speedingEvents.filter(isPrevious);

  // ---- Metrik + pembanding periode sebelumnya ----
  const autoPct = (list) =>
    list.length
      ? Math.round((list.filter((c) => c.status !== "perluDitinjau").length / list.length) * 100)
      : 0;
  const avgSeconds = (list) =>
    list.length
      ? Math.round((list.reduce((s, d) => s + d.avgSeconds, 0) / list.length) * 10) / 10
      : 0;
  const valCur = source.validationDaily.filter((d) => inWindow(d.date, start, end));
  const valPrev = source.validationDaily.filter((d) => inWindow(d.date, prevStart, start));

  const metrics = {
    complaintsProcessed: delta(complaintsCur.length, complaintsPrev.length),
    autoResolvedPct: delta(autoPct(complaintsCur), autoPct(complaintsPrev)),
    avgValidationSeconds: {
      ...delta(avgSeconds(valCur), avgSeconds(valPrev)),
      manualEstimateMinutes: source.manualEstimateMinutes,
    },
    speedingIncidents: {
      ...delta(speedCur.length, speedPrev.length),
      vehiclesInvolved: new Set(speedCur.map((e) => e.plateNumber)).size,
    },
  };

  // ---- Tren pengaduan harian (3 kategori bertumpuk) ----
  const byDay = new Map();
  for (let i = 1; i <= rangeDays; i += 1) {
    const iso = addDays(start, i);
    byDay.set(iso, { iso, date: formatShort(iso), tervalidasi: 0, ditolak: 0, perluDitinjau: 0 });
  }
  for (const c of complaintsCur) {
    const row = byDay.get(c.date);
    if (row) row[c.status] += 1;
  }
  const trendData = [...byDay.values()];
  const busiest = trendData.reduce(
    (best, row) => {
      const total = row.tervalidasi + row.ditolak + row.perluDitinjau;
      return total > best.total ? { total, date: row.date } : best;
    },
    { total: 0, date: null }
  );
  const dailyTrend = {
    data: trendData,
    empty: complaintsCur.length === 0,
    insight:
      complaintsCur.length === 0
        ? null
        : fill(copy.charts.dailyTrend.insight, {
            pct: autoPct(complaintsCur),
            date: busiest.date,
            count: busiest.total,
          }),
  };

  // ---- Insiden kecepatan per armada (urut terbanyak) ----
  const countByPlate = new Map();
  for (const e of speedCur) countByPlate.set(e.plateNumber, (countByPlate.get(e.plateNumber) ?? 0) + 1);
  const speedingRows = [...countByPlate.entries()]
    .map(([plateNumber, count]) => ({ plateNumber, count }))
    .sort((a, b) => b.count - a.count || a.plateNumber.localeCompare(b.plateNumber));
  const speedTotal = speedCur.length;
  let cumulative = 0;
  let contributors = 0;
  for (const row of speedingRows) {
    cumulative += row.count;
    contributors += 1;
    if (cumulative / speedTotal >= 0.6) break;
  }
  const speedingByPlate = {
    data: speedingRows,
    total: speedTotal,
    empty: speedTotal === 0,
    insight:
      speedTotal === 0
        ? null
        : fill(copy.charts.speedingByPlate.insight, {
            k: contributors,
            n: plateSet.size,
            pct: Math.round((cumulative / speedTotal) * 100),
          }),
  };

  // ---- Level solar harian per truk (daftar + detail) ----
  const fuelInWindow = source.fuelDaily
    .filter((t) => plateSet.has(t.plateNumber))
    .map((t) => ({
      plateNumber: t.plateNumber,
      points: t.points.filter((p) => inWindow(p.date, start, end)),
    }))
    .filter((t) => t.points.length > 0);

  // Rata-rata seluruh armada per tanggal: garis pembanding di belakang garis truk.
  const fleetSum = new Map();
  for (const t of fuelInWindow) {
    for (const p of t.points) {
      const acc = fleetSum.get(p.date) ?? { total: 0, n: 0 };
      acc.total += p.fuelPct;
      acc.n += 1;
      fleetSum.set(p.date, acc);
    }
  }
  const fleetAvg = (date) => {
    const acc = fleetSum.get(date);
    return acc ? Math.round(acc.total / acc.n) : null;
  };

  const fuelTrucks = fuelInWindow
    .map((t) => {
      const points = t.points.map((p) => ({
        date: p.date,
        label: formatShort(p.date),
        fuelPct: p.fuelPct,
        fleetAvgPct: fleetAvg(p.date),
        refill: p.refill,
        anomaly: p.anomaly,
        dropPct: p.anomaly ? Math.abs(p.deltaPct) : 0,
      }));
      const normalUse = t.points.filter((p) => !p.refill && !p.anomaly && p.deltaPct < 0);
      const avgDailyUse = normalUse.length
        ? Math.round(
            (normalUse.reduce((s, p) => s + Math.abs(p.deltaPct), 0) / normalUse.length) * 10
          ) / 10
        : 0;
      const anomalies = points
        .filter((p) => p.anomaly)
        .map((p) => ({ date: p.date, label: p.label, dropPct: p.dropPct, fuelPct: p.fuelPct }))
        .sort((a, b) => b.dropPct - a.dropPct);
      return {
        plateNumber: t.plateNumber,
        points,
        avgDailyUse,
        refillCount: points.filter((p) => p.refill).length,
        anomalyCount: anomalies.length,
        anomalies,
      };
    })
    .sort((a, b) => b.anomalyCount - a.anomalyCount || a.plateNumber.localeCompare(b.plateNumber));

  const totalAnomalies = fuelTrucks.reduce((s, t) => s + t.anomalyCount, 0);
  const worstFuel = fuelTrucks
    .filter((t) => t.anomalyCount > 0)
    .sort((a, b) => b.anomalies[0].dropPct - a.anomalies[0].dropPct)[0];
  const fuelByTruck = {
    trucks: fuelTrucks,
    empty: fuelTrucks.length === 0,
    insight:
      fuelTrucks.length === 0
        ? null
        : worstFuel
          ? fill(copy.charts.fuel.insight, {
              plate: worstFuel.plateNumber,
              drop: worstFuel.anomalies[0].dropPct,
              date: worstFuel.anomalies[0].label,
              more:
                totalAnomalies > 1
                  ? fill(copy.charts.fuel.insightMoreSuffix, { n: totalAnomalies })
                  : "",
            })
          : copy.charts.fuel.insightNone,
  };

  // ---- Distribusi jam insiden (0–23) + jendela puncak 2 jam ----
  const hourCounts = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: String(hour).padStart(2, "0"),
    count: 0,
    peak: false,
  }));
  for (const e of speedCur) hourCounts[e.hour].count += 1;
  let peakFrom = 0;
  let peakSum = -1;
  for (let h = 0; h < 23; h += 1) {
    const sum = hourCounts[h].count + hourCounts[h + 1].count;
    if (sum > peakSum) {
      peakSum = sum;
      peakFrom = h;
    }
  }
  if (speedTotal > 0) {
    hourCounts[peakFrom].peak = true;
    hourCounts[peakFrom + 1].peak = true;
  }
  const hourDistribution = {
    data: hourCounts,
    empty: speedTotal === 0,
    peak: speedTotal === 0 ? null : { from: peakFrom, to: peakFrom + 2 },
    insight:
      speedTotal === 0
        ? null
        : fill(copy.charts.hourDistribution.insight, {
            from: String(peakFrom).padStart(2, "0"),
            to: String(peakFrom + 2).padStart(2, "0"),
          }),
  };

  // ---- Sebaran lokasi ----
  const byLocation = new Map();
  for (const e of speedCur) {
    const key = e.location.label;
    if (!byLocation.has(key)) byLocation.set(key, { ...e.location, count: 0 });
    byLocation.get(key).count += 1;
  }
  const locations = [...byLocation.values()].sort((a, b) => b.count - a.count);
  const violationLocations = {
    data: locations,
    empty: locations.length === 0,
    insight:
      locations.length === 0
        ? null
        : fill(copy.charts.violationMap.insight, {
            label: locations[0].label,
            count: locations[0].count,
          }),
  };

  return {
    rangeDays,
    plates: source.plates,
    selectedPlates,
    summary: {
      truckCount: plateSet.size,
      rangeDays,
      text: fill(copy.filters.summary, { trucks: plateSet.size, days: rangeDays }),
      hasFilter: rangeDays !== DEFAULT_RANGE_DAYS || selectedPlates.length > 0,
      empty: complaintsCur.length === 0 && speedTotal === 0 && fuelTrucks.length === 0,
    },
    metrics,
    dailyTrend,
    speedingByPlate,
    fuelByTruck,
    hourDistribution,
    violationLocations,
  };
}
