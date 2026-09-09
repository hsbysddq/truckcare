"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { dashboardNav, dashboardSidebar } from "@/lib/content";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { iconMap } from "@/components/icon-map";
import Logo from "@/components/Logo";

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
  user,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sempit = collapsed;
  const namaTampil = user?.name ?? "-";

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-none flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:static lg:translate-x-0 ${
          sempit ? "w-20" : "w-60"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-20 flex-none items-center ${
            sempit ? "justify-center px-0" : "justify-between gap-1 px-4"
          }`}
        >
          {!sempit && (
            <Logo href="/dashboard" size="sidebar" />
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={sempit ? "Perluas menu" : "Ciutkan menu"}
            title={sempit ? "Perluas menu" : "Ciutkan menu"}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:flex"
          >
            {sempit ? (
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {dashboardNav.map((item) => {
            const Icon = iconMap[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                className={`flex min-h-11 items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
                  sempit ? "justify-center" : ""
                } ${
                  active
                    ? "bg-accent text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-accent"
                }`}
              >
                <Icon className="h-4 w-4 flex-none" strokeWidth={1.75} />
                {!sempit && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-none border-t border-slate-100 px-3 py-5">
          <div
            className={`flex items-center gap-3 ${
              sempit ? "justify-center" : "px-2"
            }`}
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-tint text-accent">
              <User className="h-4 w-4" strokeWidth={1.75} />
            </span>
            {!sempit && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {namaTampil}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={dashboardSidebar.logoutLabel}
            className={`mt-4 flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-accent ${
              sempit ? "w-full justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4 flex-none" strokeWidth={1.75} />
            {!sempit && dashboardSidebar.logoutLabel}
          </button>
        </div>
      </aside>
    </>
  );
}
