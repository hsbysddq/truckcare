import { pengaturanPage, dashboardTitle } from "@/lib/content";
import { getUser } from "@/lib/auth";
import AccountCard from "@/components/dashboard/pengaturan/AccountCard";
import AksesBot from "@/components/dashboard/pengaturan/AksesBot";
import StatusTelegram from "@/components/dashboard/pengaturan/StatusTelegram";
import StatusOpenClaw from "@/components/dashboard/pengaturan/StatusOpenClaw";
import AgentPromptPanel from "@/components/dashboard/pengaturan/AgentPromptPanel";

export const metadata = { title: dashboardTitle("/dashboard/pengaturan") };

function SectionHeading({ title, description }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-base font-semibold tracking-tight text-slate-800">
        {title}
      </h2>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export default async function PengaturanPage() {
  const user = await getUser();
  const akun = user ? { email: user.email } : null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {pengaturanPage.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{pengaturanPage.subtitle}</p>
      </div>

      <section className="space-y-4">
        <SectionHeading
          title={pengaturanPage.sections.akun.title}
          description={pengaturanPage.sections.akun.description}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <AccountCard user={akun} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title={pengaturanPage.sections.telegram.title}
          description={pengaturanPage.sections.telegram.description}
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AksesBot />
          <StatusTelegram />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title={pengaturanPage.sections.ai.title}
          description={pengaturanPage.sections.ai.description}
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <StatusOpenClaw />
          <AgentPromptPanel />
        </div>
      </section>
    </div>
  );
}
