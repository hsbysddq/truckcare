import { ctaSection } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

export default function CtaSection() {
  return (
    <section id="kontak" className="bg-accent py-20 sm:py-24">
      <FadeIn as="div" className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {ctaSection.headline}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
          {ctaSection.description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={ctaSection.primaryCta.href}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-cta px-7 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-cta-dark"
          >
            {ctaSection.primaryCta.label}
          </a>
          <a
            href={ctaSection.secondaryCta.href}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {ctaSection.secondaryCta.label}
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
