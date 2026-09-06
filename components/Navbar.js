"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Menu, X } from "lucide-react";
import { navbar, siteConfig } from "@/lib/content";

export default function Navbar({ forceSolid = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (forceSolid) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [forceSolid]);

  const isSolid = forceSolid || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center px-6 lg:px-8">
        <div className="flex flex-1 justify-start">
          <Link
            href="/"
            className={`flex cursor-pointer items-center gap-2 text-lg font-semibold tracking-tight transition-opacity duration-200 hover:opacity-80 ${
              isSolid ? "text-accent" : "text-white"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isSolid ? "bg-accent text-white" : "bg-white/15 text-white"
              }`}
            >
              <Truck className="h-5 w-5" strokeWidth={2} />
            </span>
            {siteConfig.name}
          </Link>
        </div>

        <div className="flex flex-1 justify-end">
          <div className="hidden items-center gap-3 md:flex">
            {navbar.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors ${
                  isSolid
                    ? "border-accent/30 text-accent hover:bg-accent-tint"
                    : "border-white/50 text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href={navbar.cta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              {navbar.cta.label}
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden ${
              isSolid ? "text-accent" : "text-white"
            }`}
            aria-label="Buka menu navigasi"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            {navbar.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-full border border-accent/30 px-5 text-center text-sm font-semibold text-accent hover:bg-accent-tint"
              >
                {link.label}
              </a>
            ))}
            <a
              href={navbar.cta.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-center text-sm font-semibold text-white hover:bg-accent-dark"
            >
              {navbar.cta.label}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
