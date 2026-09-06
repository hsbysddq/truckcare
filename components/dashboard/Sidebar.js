"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, User, LogOut } from "lucide-react";
import { siteConfig, dashboardNav, dashboardSidebar } from "@/lib/content";
import { getCurrentUser } from "@/lib/data";
import { iconMap } from "@/components/icon-map";

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const user = getCurrentUser();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-none flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 flex-none items-center px-6">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-2 text-lg font-semibold tracking-tight text-accent transition-opacity duration-200 hover:opacity-80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
              <Truck className="h-5 w-5" strokeWidth={2} />
            </span>
            {siteConfig.name}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {dashboardNav.map((item) => {
            const Icon = iconMap[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex min-h-11 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-accent"
                }`}
              >
                <Icon className="h-4 w-4 flex-none" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-none border-t border-slate-100 px-4 py-5">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-tint text-accent">
              <User className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
          <Link
            href="/"
            onClick={onClose}
            className="mt-4 flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-accent"
          >
            <LogOut className="h-4 w-4 flex-none" strokeWidth={1.75} />
            {dashboardSidebar.logoutLabel}
          </Link>
        </div>
      </aside>
    </>
  );
}
