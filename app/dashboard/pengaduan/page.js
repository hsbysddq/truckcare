import PengaduanPage from "@/components/dashboard/PengaduanPage";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard/pengaduan") };

export default function Page() {
  return <PengaduanPage />;
}
