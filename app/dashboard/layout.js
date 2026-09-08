import DashboardShell from "@/components/dashboard/DashboardShell";
import { ChatProvider } from "@/context/ChatContext";

export default function DashboardLayout({ children }) {
  return (
    <ChatProvider>
      <DashboardShell>{children}</DashboardShell>
    </ChatProvider>
  );
}
