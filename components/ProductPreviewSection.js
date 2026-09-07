"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { productPreviewSection } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import BrowserFrame from "@/components/BrowserFrame";

export default function ProductPreviewSection() {
  const { eyebrow, headline, description, autoplayIntervalMs, items } =
    productPreviewSection;
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
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
    if (!autoplayEnabled || reducedMotion) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, autoplayIntervalMs);
    return () => clearInterval(timer);
  }, [autoplayEnabled, reducedMotion, items.length, autoplayIntervalMs]);

  function selectTab(index) {
    setActiveIndex(index);
    setAutoplayEnabled(false);
  }

  function handleKeyDown(event) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = activeIndex;
    if (event.key === "ArrowDown") nextIndex = (activeIndex + 1) % items.length;
    if (event.key === "ArrowUp")
      nextIndex = (activeIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    selectTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  const activeItem = items[activeIndex];

  return (
    <section id="fitur" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cta sm:text-sm">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            {description}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label={eyebrow}
            onKeyDown={handleKeyDown}
            className="flex flex-col gap-2"
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
                  className={`flex min-h-11 w-full items-start gap-4 rounded-xl border-l-4 px-4 py-4 text-left transition-colors duration-200 ${
                    isActive
                      ? "border-cta bg-white shadow-sm shadow-slate-900/5"
                      : "border-transparent bg-transparent hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 flex-none ${
                      isActive ? "text-cta" : "text-slate-400"
                    }`}
                    strokeWidth={1.75}
                  />
                  <span className="flex flex-col">
                    <span
                      className={`text-base font-bold ${
                        isActive ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`mt-1 text-sm leading-relaxed ${
                        isActive ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="preview-tabpanel"
            role="tabpanel"
            aria-labelledby={`preview-tab-${activeItem.key}`}
            tabIndex={0}
            className="flex items-center"
          >
            <div className="w-full">
              <BrowserFrame>
                <div className="relative aspect-[16/10] w-full bg-white">
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
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-top"
                      />
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
