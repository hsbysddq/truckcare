import { UserRound } from "lucide-react";
import { pengaturanPage } from "@/lib/content";

// Kartu ringkas sesi yang sedang login (server component, tanpa aksi).
// Logout tersedia lewat tombol keluar di sidebar.
export default function AccountCard({ user }) {
  const copy = pengaturanPage.accountCard;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint text-accent">
          <UserRound className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
          <p className="truncate text-sm text-slate-500">{user?.email ?? "-"}</p>
        </div>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{copy.emailLabel}</dt>
          <dd className="font-medium text-slate-900">{user?.email ?? "-"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{copy.roleLabel}</dt>
          <dd className="font-medium text-slate-900">{copy.roleValue}</dd>
        </div>
      </dl>
    </div>
  );
}
