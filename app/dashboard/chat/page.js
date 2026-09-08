import ChatPage from "@/components/dashboard/ChatPage";
import { dashboardTitle } from "@/lib/content";

export const metadata = { title: dashboardTitle("/dashboard/chat") };

export default function Page() {
  return <ChatPage />;
}
