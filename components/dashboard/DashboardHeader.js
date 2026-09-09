"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { dashboardNav } from "@/lib/content";

export default function DashboardHeader({ onOpenSidebar }) {
  const pathname = usePathname();
  const current = dashboardNav.find(
    (item) =>
      item.href === pathname ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
  );
  const title = current?.label ?? "Dashboard";

  return (
    <header className="relative z-sticky flex h-16 flex-none items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:h-20 lg:px-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka menu navigasi"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 hover:text-accent lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h1>
      </div>
      <button
        type="button"
        aria-label="Notifikasi"
        className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 hover:text-accent"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </header>
  );
}
