import { getTrucks } from "@/lib/data";
import { getTrucksShape } from "@/lib/supabase";
import { listSchedules } from "@/lib/schedule-store";
import { loadDrivers } from "@/lib/driver-data";
import { attachCurrentDrivers } from "@/lib/driver-status";
import { dashboardTitle } from "@/lib/content";
import ArmadaList from "@/components/dashboard/ArmadaList";

export const metadata = { title: dashboardTitle("/dashboard/armada") };

// Server: baca Supabase langsung, gagal (env kosong / offline) pakai dummy.
async function muatTruk() {
  let trucks;
  try {
    trucks = await getTrucksShape();
  } catch {
    trucks = getTrucks();
  }
  // Pengemudi yang sedang membawa truk diambil dari jadwal aktif.
  try {
    const [schedules, drivers] = await Promise.all([listSchedules(), loadDrivers()]);
    return attachCurrentDrivers(trucks, schedules, new Map(drivers.map((d) => [d.id, d])));
  } catch {
    return trucks;
  }
}

export default async function ArmadaPage() {
  const trucks = await muatTruk();

  return <ArmadaList trucks={trucks} />;
}
