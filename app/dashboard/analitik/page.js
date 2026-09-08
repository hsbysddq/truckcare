import AnalitikDashboard from "@/components/dashboard/analitik/AnalitikDashboard";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard/analitik") };

// Data diambil client-side dari /api/analytics (hitungan di lib/analytics.js)
// supaya filter rentang/armada bisa diubah tanpa muat ulang halaman.
export default function AnalitikDashboardPage() {
  return <AnalitikDashboard />;
}
