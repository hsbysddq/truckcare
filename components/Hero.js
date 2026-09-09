"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { hero, heroSlides } from "@/lib/content";
import { iconMap } from "@/components/icon-map";

const SLIDE_DURATION_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // 0 saat hero penuh terlihat, 1 saat hero habis tergulir: konten
  // diangkat pelan dan memudar (parallax), latar tetap di tempat.
  const [parallax, setParallax] = useState(0);
  const sectionRef = useRef(null);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handleChange = (event) => setReducedMotion(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Di luar viewport tidak perlu hitung ulang: nilai mentok 0/1,
      // dan setState dengan nilai sama tidak me-render ulang.
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      const total = el.offsetHeight || 1;
      setParallax(Math.min(Math.max(-rect.top, 0), total) / total);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (paused || reducedMotion) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, activeIndex]);

  function goToSlide(index) {
    setActiveIndex(index);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % heroSlides.length);
  }

  function goToPrev() {
    setActiveIndex(
      (current) => (current - 1 + heroSlides.length) % heroSlides.length
    );
  }

  function handleTouchStart(event) {
    touchStartXRef.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartXRef.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (deltaX > SWIPE_THRESHOLD_PX) {
      goToPrev();
    } else if (deltaX < -SWIPE_THRESHOLD_PX) {
      goToNext();
    }
  }

  const activeSlide = heroSlides[activeIndex];

  function entryStyle(delayMs) {
    if (reducedMotion) return undefined;
    return {
      animation: `hero-content-in 0.6s ease-out both`,
      animationDelay: `${delayMs}ms`,
    };
  }

  return (
    <section
      id="hero"
      data-hero
      ref={sectionRef}
      className="group relative flex min-h-[90vh] w-full flex-col overflow-hidden bg-slate-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {heroSlides.map((slide, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={slide.key}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              key={isActive ? `zoom-${activeIndex}` : "static"}
              className="absolute inset-0 overflow-hidden"
              style={
                isActive && !reducedMotion
                  ? {
                      animation: `hero-zoom ${SLIDE_DURATION_MS}ms linear forwards`,
                      animationPlayState: paused ? "paused" : "running",
                    }
                  : undefined
              }
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-slate-950/45" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 90% 65% at 50% 100%, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.4) 45%, rgba(2,6,23,0.15) 100%)",
              }}
            />
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-slate-950/70 to-transparent" />
          </div>
        );
      })}

      {/* Padding atas = tinggi navbar (token) + ruang napas; dipakai padding,
          bukan margin, supaya titik tengah vertikal ikut bergeser. */}
      {/* Pembungkus konten digeser + dipudarkan mengikuti scroll (parallax);
          animasi masuk tiap slide tetap di elemen dalam supaya tidak bentrok. */}
      <div
        className="relative z-10 flex flex-1 items-center px-6 pb-24 pt-[calc(var(--navbar-height)+1rem)] sm:px-10 sm:pb-20 lg:px-16"
        style={
          reducedMotion || parallax === 0
            ? undefined
            : {
                transform: `translateY(${parallax * -120}px)`,
                opacity: Math.max(0, 1 - parallax * 1.5),
              }
        }
      >
        <div className="mx-auto max-w-4xl text-center">
          <span
            key={`label-${activeIndex}`}
            style={entryStyle(0)}
            className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta sm:text-sm"
          >
            {activeSlide.label}
          </span>

          <h1
            key={`headline-${activeIndex}`}
            style={{
              fontSize: "clamp(2.25rem, 1.2rem + 4vw, 4.5rem)",
              ...entryStyle(100),
            }}
            className="mt-4 font-bold leading-[1.1] text-white"
          >
            {activeSlide.headline}
          </h1>

          <p
            key={`subheadline-${activeIndex}`}
            style={entryStyle(200)}
            className="mt-4 text-base font-normal leading-snug text-white/75 sm:text-lg lg:text-xl"
          >
            {activeSlide.subheadline}
          </p>

          <div
            key={`benefits-${activeIndex}`}
            style={entryStyle(300)}
            className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:mt-10 sm:flex sm:max-w-none sm:items-start sm:justify-center sm:gap-0 sm:pt-8"
          >
            {activeSlide.benefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div
                  key={benefit.text}
                  className={`flex flex-col items-center gap-2 text-center sm:flex-1 sm:max-w-[180px] sm:px-5 ${
                    index > 0 ? "sm:border-l sm:border-white/20" : "sm:pl-0"
                  }`}
                >
                  <Icon
                    className="h-6 w-6 flex-none text-white"
                    strokeWidth={1.75}
                  />
                  <p className="text-xs leading-snug text-white/85 sm:text-sm">
                    {benefit.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            key={`buttons-${activeIndex}`}
            style={entryStyle(400)}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row"
          >
            <a
              href={hero.primaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-cta px-7 text-center text-sm font-semibold text-white shadow-lg shadow-black/30 transition-colors hover:bg-cta-dark"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 px-7 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={goToPrev}
        aria-label="Slide sebelumnya"
        className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/50 group-hover:opacity-100 sm:left-4 sm:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={goToNext}
        aria-label="Slide berikutnya"
        className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/50 group-hover:opacity-100 sm:right-4 sm:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-6 z-10 sm:bottom-8 sm:left-10 lg:left-16">
        <div className="flex items-center gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Tampilkan slide ${slide.label}`}
              aria-current={index === activeIndex}
              className="flex h-11 w-8 flex-none items-center justify-center"
            >
              <span
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-7 bg-cta" : "w-1.5 bg-white/40"
                }`}
              />
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <div className="mt-1 h-0.5 w-[152px] overflow-hidden rounded-full bg-white/15">
            <div
              key={activeIndex}
              className="h-full bg-cta"
              style={{
                animation: `hero-progress ${SLIDE_DURATION_MS}ms linear forwards`,
                animationPlayState: paused ? "paused" : "running",
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
