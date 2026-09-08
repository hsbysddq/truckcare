import OverviewPage from "@/components/dashboard/OverviewPage";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard") };

export default function Page() {
  return <OverviewPage />;
}
