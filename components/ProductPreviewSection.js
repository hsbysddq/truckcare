"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { productPreviewSection } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import BrowserFrame from "@/components/BrowserFrame";
import FadeIn from "@/components/FadeIn";

// Kartu tab ala workspace Elvin: lima kartu sebaris, kartu aktif menyala
// dengan progress bar autoplay, preview besar berganti di bawahnya.
export default function ProductPreviewSection() {
  const { eyebrow, headline, description, autoplayIntervalMs, items } =
    productPreviewSection;
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabRefs = useRef([]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handleChange = (event) => setReducedMotion(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!autoplayEnabled || reducedMotion || paused) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, autoplayIntervalMs);
    return () => clearInterval(timer);
  }, [autoplayEnabled, reducedMotion, paused, items.length, autoplayIntervalMs]);

  function selectTab(index) {
    setActiveIndex(index);
    setAutoplayEnabled(false);
  }

  function handleKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight") nextIndex = (activeIndex + 1) % items.length;
    if (event.key === "ArrowLeft")
      nextIndex = (activeIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    selectTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  const activeItem = items[activeIndex];
  const showProgress = autoplayEnabled && !reducedMotion;

  return (
    <section id="fitur" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cta sm:text-sm">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            {description}
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div
            role="tablist"
            aria-orientation="horizontal"
            aria-label={eyebrow}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0"
          >
            {items.map((item, index) => {
              const Icon = iconMap[item.icon];
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  id={`preview-tab-${item.key}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="preview-tabpanel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(index)}
                  className={`relative flex min-w-[240px] snap-start flex-col rounded-2xl border p-5 pb-8 text-left transition-all duration-300 motion-reduce:transform-none lg:min-w-0 ${
                    isActive
                      ? "border-cta/60 bg-white shadow-xl shadow-cta/10"
                      : "border-slate-200 bg-slate-50/70 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-cta/10 text-cta"
                        : "bg-white text-slate-400 ring-1 ring-slate-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span
                    className={`mt-4 text-sm font-bold ${
                      isActive ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </span>
                  {isActive && showProgress && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-5 bottom-4 h-1 overflow-hidden rounded-full bg-slate-100"
                    >
                      <span
                        key={activeIndex}
                        className="block h-full rounded-full bg-cta"
                        style={{
                          animation: `preview-progress ${autoplayIntervalMs}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div
            id="preview-tabpanel"
            role="tabpanel"
            aria-labelledby={`preview-tab-${activeItem.key}`}
            tabIndex={0}
            className="mt-8"
          >
            <BrowserFrame>
              <div className="relative aspect-[16/9] w-full bg-white">
                {items.map((item, index) => (
                  <div
                    key={item.key}
                    aria-hidden={index !== activeIndex}
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
                      index === activeIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-top"
                    />
                  </div>
                ))}
              </div>
            </BrowserFrame>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
