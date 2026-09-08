import { getTrucks } from "@/lib/data";
import { getTrucksShape } from "@/lib/supabase";
import { armadaPage, dashboardTitle } from "@/lib/content";
import ArmadaCard from "@/components/dashboard/ArmadaCard";

export const metadata = { title: dashboardTitle("/dashboard/armada") };

// Server: baca Supabase langsung, gagal (env kosong / offline) pakai dummy.
async function muatTruk() {
  try {
    return await getTrucksShape();
  } catch {
    return getTrucks();
  }
}

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
