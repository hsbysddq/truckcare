import DashboardShell from "@/components/dashboard/DashboardShell";
import { ChatProvider } from "@/context/ChatContext";
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

  return (
    <ChatProvider>
      <DashboardShell user={tampilanUser}>{children}</DashboardShell>
    </ChatProvider>
  );
}
