import { loadTrucksWithDrivers } from "@/lib/driver-data";
import { dashboardTitle } from "@/lib/content";
import ArmadaList from "@/components/dashboard/ArmadaList";

export const metadata = { title: dashboardTitle("/dashboard/armada") };

// Server: truk aktif + pengemudi yang sedang membawa (lib/driver-data.js),
// loader yang sama dengan Overview/Jadwal/Pengaduan.

// Judul kartu = plat nomor + jenis armada; filter status & jenis ada di
// ArmadaList (client). Tidak ada lagi penomoran "Truk NN".
// CATATAN MERGE: halaman ini HARUS merender <ArmadaList/>; JSX lama dengan
// trucks.map + <ArmadaCard name=...> sudah tidak valid (ArmadaCard tanpa
// prop name, tidak diimpor di sini).
export default async function ArmadaPage() {
  const trucks = await loadTrucksWithDrivers();
  return <ArmadaList trucks={trucks} />;
}
