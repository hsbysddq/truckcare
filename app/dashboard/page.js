import OverviewPage from "@/components/dashboard/OverviewPage";
import { loadTrucksWithDrivers } from "@/lib/driver-data";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard") };
export const dynamic = "force-dynamic";

// Daftar armada dari getActiveTrucks() (server), sama dengan halaman Armada.
export default async function Page() {
  const trucks = await loadTrucksWithDrivers();
  return <OverviewPage initialTrucks={trucks} />;
}
