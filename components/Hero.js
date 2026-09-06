import Image from "next/image";
import { hero } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

export default function Hero() {
  return (
    <section className="relative flex h-[85vh] min-h-[560px] items-center overflow-hidden">
      <Image
        src={hero.image.src}
        alt={hero.image.alt}
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-slate-950/40" />

      <FadeIn className="relative mx-auto flex w-full max-w-7xl flex-col items-start px-6 lg:px-8">
        <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {hero.eyebrow}
        </span>

        <h1 className="mt-6 w-full max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          {hero.headline}
        </h1>

        <p className="mt-6 w-full max-w-xl text-lg leading-relaxed text-white/80">
          {hero.subheadline}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href={hero.primaryCta.href}
            className="rounded-full bg-cta px-7 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-cta-dark"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            {hero.secondaryCta.label}
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
