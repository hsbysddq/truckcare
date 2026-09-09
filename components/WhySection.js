"use client";

import { useState } from "react";
import Image from "next/image";
import { whySection } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import FadeIn from "@/components/FadeIn";

// Panel mengembang ala Elvin: sebaris panel berwarna, panel yang aktif
// (hover di desktop, ketuk di mobile) melebar menampilkan deskripsi,
// sisanya menciut tinggal ikon + judul vertikal. Mobile jadi akordeon.
// Satu keluarga gradien dari warna logo: biru mengalir ke oranye
// mengikuti urutan panel (token: accent-dark, accent, accent-light,
// cta-dark, cta, cta-light).
const PANEL_GRADIENT = [
  "linear-gradient(150deg, #143b75, #1b4f9c)",
  "linear-gradient(150deg, #1b4f9c, #29a0e0)",
  "linear-gradient(150deg, #d95f10, #f4711f)",
  "linear-gradient(150deg, #f4711f, #f9a11b)",
];

export default function WhySection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="mengapa" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-7xl text-center">
          <h2 className="whitespace-nowrap text-[clamp(2rem,9vw,6rem)] font-bold tracking-tight text-slate-900">
            {whySection.headline}
          </h2>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mt-16 flex flex-col gap-3 lg:h-[660px] lg:flex-row">
            {whySection.cards.map((card, index) => {
              const Icon = iconMap[card.icon];
              const aktif = index === activeIndex;
              return (
                <button
                  key={card.title}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  aria-expanded={aktif}
                  style={{ background: PANEL_GRADIENT[index % PANEL_GRADIENT.length] }}
                  className={`relative overflow-hidden rounded-3xl text-left text-white transition-[flex-grow] duration-500 ease-out motion-reduce:transition-none lg:flex-1 ${
                    aktif ? "lg:flex-[4]" : ""
                  }`}
                >
                  {/* Panel ciut: ikon polos di tengah. Panel aktif:
                      ikon besar + judul + deskripsi + gambar, semua tengah. */}
                  <span
                    className={`flex h-full flex-col gap-6 p-6 sm:p-8 ${
                      aktif
                        ? "items-center justify-start text-center"
                        : "justify-between lg:items-center lg:justify-center"
                    }`}
                  >
                    <span
                      className={`flex gap-4 ${
                        aktif
                          ? "flex-col items-center"
                          : "items-center lg:justify-center"
                      }`}
                    >
                      <Icon
                        className={`text-white ${aktif ? "h-12 w-12" : "h-10 w-10"}`}
                        strokeWidth={1.5}
                      />
                      <span
                        className={`font-bold leading-snug ${
                          aktif ? "max-w-xl text-xl" : "text-lg lg:hidden"
                        }`}
                      >
                        {card.title}
                      </span>
                    </span>
                    {/* Deskripsi: mengembang seperti akordeon. */}
                    <span
                      className={`grid w-full transition-all duration-500 ease-out motion-reduce:transition-none ${
                        aktif
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <span className="overflow-hidden">
                        <span
                          className={`mx-auto block max-w-xl text-base leading-relaxed text-white/85 ${
                            aktif ? "animasi-panel-masuk" : ""
                          }`}
                        >
                          {card.description}
                        </span>
                        {aktif && card.image && (
                          <span className="relative mx-auto mt-6 block aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-2xl ring-1 ring-white/30">
                            <Image
                              src={card.image}
                              alt={card.alt ?? card.title}
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-cover object-top"
                            />
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
