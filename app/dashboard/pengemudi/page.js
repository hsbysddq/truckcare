import { dashboardTitle } from "@/lib/content";
import { loadDriverOverview } from "@/lib/driver-data";
import DriverList from "@/components/dashboard/pengemudi/DriverList";

export const metadata = { title: dashboardTitle("/dashboard/pengemudi") };
export const dynamic = "force-dynamic";

// Server: status dan angka dihitung di lib/driver-status.js dari jadwal,
// telemetri, dan pengaduan. Tidak ada kolom status di tabel drivers.
export default async function PengemudiPage() {
  const { rows, summary, scheduleCount } = await loadDriverOverview();
  return <DriverList rows={rows} summary={summary} scheduleCount={scheduleCount} />;
}
