"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bot, Megaphone } from "lucide-react";
import { howItWorksSection } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

// Panggung pin: section dibuat tinggi dan gelap, kolom kiri (judul +
// diagram) menempel setinggi viewport sementara step teks berjalan di
// kanan. Metafora perjalanan: rumah sebagai titik awal, truk berjalan
// di garis melewati titik-titik step sampai akhir. Step yang sudah
// melewati tengah layar menyala, sisanya meredup. Setelah step terakhir
// lewat, scroll kembali normal. Mobile tetap susun vertikal biasa.
export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  // Tulang garis: diukur dari tengah lingkaran pertama ke terakhir,
  // terisi kontinu mengikuti posisi scroll (bukan melompat per step).
  const [spine, setSpine] = useState({ top: 0, height: 0, fill: 0 });
  const stepRefs = useRef([]);
  const listRef = useRef(null);

  // Posisi scroll dibaca langsung (bukan observer) supaya tidak ada
  // flicker saat batas antar step yang tinggi melewati pita viewport.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const middle = window.innerHeight * 0.5;
      const nodes = stepRefs.current.filter(Boolean);
      const ol = listRef.current;
      if (nodes.length === 0 || !ol) return;
      let aktif = 0;
      nodes.forEach((node, index) => {
        if (node.getBoundingClientRect().top <= middle) aktif = index;
      });
      setActiveStep(aktif);
      // Titik tengah tiap lingkaran relatif terhadap daftar.
      const olTop = ol.getBoundingClientRect().top;
      const centers = nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top + rect.height / 2 - olTop;
      });
      const top = centers[0] ?? 0;
      const bottom = centers[centers.length - 1] ?? 0;
      const height = Math.max(0, bottom - top);
      const fill = Math.min(Math.max(middle - olTop - top, 0), height);
      setSpine((prev) =>
        prev.top === top && prev.height === height && prev.fill === fill
          ? prev
          : { top, height, fill }
      );
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
  }, []);

  const steps = howItWorksSection.steps;

  return (
    <section id="cara-kerja" className="relative bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:items-start lg:px-8 lg:py-0">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-wider text-white/60">
              {howItWorksSection.eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {howItWorksSection.headline}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              {howItWorksSection.description}
            </p>
          </FadeIn>
          <FadeIn
            delay={100}
            className="relative mt-8 aspect-[2/1] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <Image
              src={howItWorksSection.diagramImage}
              alt={howItWorksSection.diagramAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-4 sm:p-6"
            />
          </FadeIn>
        </div>

        <ol ref={listRef} className="relative">
          {/* Tulang garis utuh dari titik pertama ke terakhir. */}
          <span
            aria-hidden="true"
            className="absolute left-[21px] w-px bg-white/15"
            style={{ top: spine.top, height: spine.height }}
          />
          <span
            aria-hidden="true"
            className="absolute left-[21px] w-px bg-cta"
            style={{ top: spine.top, height: spine.fill }}
          />
          {/* Laporan warga: titik awal perjalanan. */}
          <span
            aria-hidden="true"
            className="absolute left-[21px] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950"
            style={{ top: spine.top, transform: "translate(-50%, -50%)" }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20">
              <Megaphone className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </span>
          {/* AI Agent: berjalan di garis mengikuti scroll, sembunyi di titik awal. */}
          <span
            aria-hidden="true"
            className={`absolute left-[21px] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cta text-white shadow-lg shadow-cta/40 ring-2 ring-white/30 transition-opacity duration-300 ${
              spine.fill <= 4 ? "opacity-0" : "opacity-100"
            }`}
            style={{ top: spine.top + spine.fill, transform: "translate(-50%, -50%)" }}
          >
            <Bot className="h-4 w-4" strokeWidth={2} />
          </span>
          {steps.map((step, index) => {
            const aktif = index === activeStep;
            return (
              <li
                key={step.number}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                className="relative flex items-center gap-5 pb-10 lg:min-h-[75vh] lg:pb-0"
              >
                {/* Titik step: menyala oranye setelah dilewati. */}
                <span className="flex w-11 flex-none self-stretch items-center justify-center">
                  <span
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 rounded-full transition-colors duration-500 ${
                      index <= activeStep
                        ? "bg-cta"
                        : "bg-white/25 ring-1 ring-white/20"
                    }`}
                  />
                </span>
                <div>
                  <h3
                    className={`text-base font-semibold transition-colors duration-500 ${
                      aktif ? "text-white" : "text-white/45"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`mt-1.5 max-w-md text-sm leading-relaxed transition-colors duration-500 ${
                      aktif ? "text-white/70" : "text-white/30"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
