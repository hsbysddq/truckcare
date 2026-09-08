import PetaPage from "@/components/dashboard/PetaPage";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard/peta") };

export default function Page() {
  return <PetaPage />;
}
