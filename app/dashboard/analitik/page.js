import AnalitikDashboard from "@/components/dashboard/analitik/AnalitikDashboard";

// Data diambil client-side dari /api/analytics (hitungan di lib/analytics.js)
// supaya filter rentang/armada bisa diubah tanpa muat ulang halaman.
export default function AnalitikDashboardPage() {
  return <AnalitikDashboard />;
}
