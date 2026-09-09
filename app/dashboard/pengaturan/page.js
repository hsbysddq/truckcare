import { pengaturanPage, dashboardTitle } from "@/lib/content";
import { getUser } from "@/lib/auth";
import PengaturanTabs from "@/components/dashboard/pengaturan/PengaturanTabs";
import AccountCard from "@/components/dashboard/pengaturan/AccountCard";
import AksesBot from "@/components/dashboard/pengaturan/AksesBot";
import StatusTelegram from "@/components/dashboard/pengaturan/StatusTelegram";
import StatusOpenClaw from "@/components/dashboard/pengaturan/StatusOpenClaw";
import AgentPromptPanel from "@/components/dashboard/pengaturan/AgentPromptPanel";

export const metadata = { title: dashboardTitle("/dashboard/pengaturan") };

export default async function PengaturanPage() {
  const user = await getUser();
  const akun = user ? { email: user.email } : null;
  const s = pengaturanPage.sections;

  const tabs = [
    { key: "akun", label: s.akun.title },
    { key: "telegram", label: s.telegram.title },
    { key: "ai", label: s.ai.title },
  ];
  const sections = {
    akun: <AccountCard user={akun} />,
    telegram: (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AksesBot />
        <StatusTelegram />
      </div>
    ),
    ai: (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StatusOpenClaw />
        <AgentPromptPanel />
      </div>
    ),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {pengaturanPage.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{pengaturanPage.subtitle}</p>
      </div>

      <PengaturanTabs tabs={tabs} sections={sections} />
    </div>
  );
}
