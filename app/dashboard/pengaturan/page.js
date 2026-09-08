import { pengaturanPage, dashboardTitle } from "@/lib/content";
import AksesBot from "@/components/dashboard/pengaturan/AksesBot";
import StatusTelegram from "@/components/dashboard/pengaturan/StatusTelegram";
import StatusOpenClaw from "@/components/dashboard/pengaturan/StatusOpenClaw";

export const metadata = { title: dashboardTitle("/dashboard/pengaturan") };

export default function PengaturanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {pengaturanPage.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {pengaturanPage.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AksesBot />
        <div className="space-y-6">
          <StatusTelegram />
          <StatusOpenClaw />
        </div>
      </div>
    </div>
  );
}
