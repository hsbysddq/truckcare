import { Check } from "lucide-react";
import { ctaSection } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

// Kartu final berpendar: gradien biru ke oranye (warna logo) mengambang
// di atas latar gelap, ditutup deretan bukti mini sebagai kesan terakhir.
export default function CtaSection() {
  return (
    <section id="kontak" className="bg-slate-950 px-4 pb-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <FadeIn
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-20 text-center shadow-2xl shadow-cta/20 sm:py-24"
        style={{
          background:
            "linear-gradient(140deg, #143b75 0%, #1b4f9c 45%, #d95f10 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 h-64 w-[42rem] max-w-none -translate-x-1/2 rounded-full bg-white/15 blur-3xl"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {ctaSection.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            {ctaSection.description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={ctaSection.primaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-cta px-7 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-cta-dark"
            >
              {ctaSection.primaryCta.label}
            </a>
            <a
              href={ctaSection.secondaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 px-7 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {ctaSection.secondaryCta.label}
            </a>
          </div>
          <ul className="mt-10 flex flex-col items-center justify-center gap-3 text-sm font-medium text-white/80 sm:flex-row sm:gap-8">
            {ctaSection.proof.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 flex-none text-white" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>
    </section>
  );
}
