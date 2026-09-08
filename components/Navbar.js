"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { navbar } from "@/lib/content";
import Logo from "@/components/Logo";

export default function Navbar({ forceSolid = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (forceSolid) return;
    const heroEl = document.querySelector("[data-hero]");

    if (!heroEl) {
      setScrolled(window.scrollY > 24);
      return undefined;
    }

    // Ambang diambil dari tinggi navbar aktual (token --navbar-height),
    // bukan angka terpisah.
    const navHeight = headerRef.current?.offsetHeight ?? 0;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: `-${navHeight}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [forceSolid]);

  const isSolid = forceSolid || scrolled;

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isSolid ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-(--navbar-height) max-w-7xl items-center px-6 lg:px-8">
        <div className="flex flex-1 justify-start">
          <Logo
            href="/"
            size="navbar"
            tone={isSolid ? "dark" : "light"}
            priority
          />
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          {navbar.centerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-base font-medium transition-colors ${
                isSolid
                  ? "text-slate-600 hover:text-accent"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-1 justify-end">
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={navbar.secondaryCta.href}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2.5 text-base font-semibold transition-colors ${
                isSolid
                  ? "border-accent/30 text-accent hover:bg-accent-tint"
                  : "border-white/50 text-white hover:bg-white/10"
              }`}
            >
              {navbar.secondaryCta.label}
            </a>
            <a
              href={navbar.primaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              {navbar.primaryCta.label}
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${
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
        <div className="border-t border-slate-100 bg-white px-6 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col gap-1">
            {navbar.centerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-accent"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3">
            <a
              href={navbar.secondaryCta.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-11 items-center justify-center rounded-full border border-accent/30 px-5 text-center text-sm font-semibold text-accent hover:bg-accent-tint"
            >
              {navbar.secondaryCta.label}
            </a>
            <a
              href={navbar.primaryCta.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-center text-sm font-semibold text-white hover:bg-accent-dark"
            >
              {navbar.primaryCta.label}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
