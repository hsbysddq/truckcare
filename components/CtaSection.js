import { ctaSection } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

export default function CtaSection() {
  return (
    <section id="kontak" className="bg-accent py-20 sm:py-24">
      <FadeIn as="div" className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {ctaSection.headline}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/75">
          {ctaSection.description}
        </p>
        <div className="mt-10">
          <a
            href={ctaSection.button.href}
            className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-accent shadow-lg shadow-black/10 transition-colors hover:bg-slate-100"
          >
            {ctaSection.button.label}
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
