"use client";

import { useState } from "react";
import Image from "next/image";
import { dashboardPreviewSection } from "@/lib/content";
import BrowserFrame from "@/components/BrowserFrame";

export default function DashboardPreviewSection() {
  const [activeKey, setActiveKey] = useState(dashboardPreviewSection.tabs[0].key);
  const activeTab = dashboardPreviewSection.tabs.find(
    (tab) => tab.key === activeKey
  );

  return (
    <section id="dashboard-preview" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            {dashboardPreviewSection.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {dashboardPreviewSection.headline}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            {dashboardPreviewSection.description}
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {dashboardPreviewSection.tabs.map((tab) => {
            const active = tab.key === activeKey;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={`relative inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-accent text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-accent/30 hover:text-accent"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-cta" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <BrowserFrame>
            <div className="relative aspect-[16/10] w-full bg-white">
              <Image
                src={activeTab.image}
                alt={activeTab.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-top"
              />
            </div>
          </BrowserFrame>

          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {activeTab.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {activeTab.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
