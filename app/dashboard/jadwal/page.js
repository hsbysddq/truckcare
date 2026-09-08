import JadwalDashboard from "@/components/dashboard/jadwal/JadwalDashboard";

// Data lewat /api/schedules (Supabase atau contoh in-memory) dan
// /api/schedules/findings (lib/schedule-analysis.js).
export default function JadwalPage() {
  return <JadwalDashboard />;
}
