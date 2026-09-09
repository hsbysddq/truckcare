import JadwalDashboard from "@/components/dashboard/jadwal/JadwalDashboard";
import { loadTrucksWithDrivers, loadDrivers } from "@/lib/driver-data";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard/jadwal") };
export const dynamic = "force-dynamic";

// Truk & pengemudi dari server (getActiveTrucks + loadDrivers); jadwal lewat
// /api/schedules (Supabase atau contoh in-memory) dan /api/schedules/findings.
export default async function JadwalPage() {
  const [trucks, drivers] = await Promise.all([loadTrucksWithDrivers(), loadDrivers()]);
  return <JadwalDashboard initialTrucks={trucks} initialDrivers={drivers} />;
}
