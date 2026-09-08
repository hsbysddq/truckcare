import DashboardShell from "@/components/dashboard/DashboardShell";
import { getUser } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const user = await getUser();
  const tampilanUser = user
    ? {
        name: user.email.split("@")[0],
        email: user.email,
        role: "Operator Armada",
      }
    : null;

  return <DashboardShell user={tampilanUser}>{children}</DashboardShell>;
}
