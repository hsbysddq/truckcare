import { getActiveTrucks } from "@/lib/trucks";
import { listSchedules } from "@/lib/schedule-store";
import { loadDrivers } from "@/lib/driver-data";
import { attachCurrentDrivers } from "@/lib/driver-status";
import { dashboardTitle } from "@/lib/content";
import ArmadaList from "@/components/dashboard/ArmadaList";

export const metadata = { title: dashboardTitle("/dashboard/armada") };

// Server: baca Supabase langsung, gagal (env kosong / offline) pakai dummy.
async function muatTruk() {
  const trucks = await getActiveTrucks();
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
// CATATAN MERGE: halaman ini HARUS merender <ArmadaList/>; JSX lama dengan
// trucks.map + <ArmadaCard name=...> sudah tidak valid (ArmadaCard tanpa
// prop name, tidak diimpor di sini).
export default async function ArmadaPage() {
  const trucks = await muatTruk();
  return <ArmadaList trucks={trucks} />;
}
