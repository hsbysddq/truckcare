import DashboardShell from "@/components/dashboard/DashboardShell";
import { ChatProvider } from "@/context/ChatContext";
import { getUserDariSesi } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  // Dari cookie (tanpa roundtrip auth): proxy.js sudah memverifikasi sesi.
  const user = await getUserDariSesi();
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
