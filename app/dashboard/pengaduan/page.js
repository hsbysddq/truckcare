import PengaduanPage from "@/components/dashboard/PengaduanPage";
import { getActiveTrucks } from "@/lib/trucks";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard/pengaduan") };
export const dynamic = "force-dynamic";

// Plat armada dari getActiveTrucks() (server), sama dengan halaman Armada.
export default async function Page() {
  const trucks = await getActiveTrucks();
  return <PengaduanPage initialTrucks={trucks} />;
}
