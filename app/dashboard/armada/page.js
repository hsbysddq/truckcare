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

// Judul kartu = plat nomor + jenis armada; filter status & jenis ada di
// ArmadaList (client). Tidak ada lagi penomoran "Truk NN".
export default async function ArmadaPage() {
  const trucks = await muatTruk();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {armadaPage.title}
        </h1>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
          {trucks.length} {armadaPage.countBadgeSuffix}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trucks.map((truck, index) => (
          <ArmadaCard
            key={truck.id}
            truck={truck}
            name={truck.nama ?? `Truk ${String(index + 1).padStart(2, "0")}`}
          />
        ))}
      </div>
    </div>
  );
}
