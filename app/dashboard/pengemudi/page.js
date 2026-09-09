import { pengemudiPage, dashboardTitle } from "@/lib/content";
import { loadDriverOverview } from "@/lib/driver-data";
import DriverList from "@/components/dashboard/pengemudi/DriverList";

export const metadata = { title: dashboardTitle("/dashboard/pengemudi") };
export const dynamic = "force-dynamic";

// Server: status dan angka dihitung di lib/driver-status.js dari jadwal,
// telemetri, dan pengaduan. Tidak ada kolom status di tabel drivers.
export default async function PengemudiPage() {
  const { rows, summary } = await loadDriverOverview();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{pengemudiPage.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{pengemudiPage.subtitle}</p>
      </div>
      <DriverList rows={rows} summary={summary} />
    </div>
  );
}
