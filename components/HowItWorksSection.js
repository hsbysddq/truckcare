import Image from "next/image";
import { howItWorksSection } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="bg-slate-950 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <FadeIn className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Image
            src={howItWorksSection.diagramImage}
            alt={howItWorksSection.diagramAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-4 sm:p-6"
          />
        </FadeIn>

        <FadeIn delay={100}>
          <span className="text-sm font-semibold uppercase tracking-wider text-white/60">
            {howItWorksSection.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {howItWorksSection.headline}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/60">
            {howItWorksSection.description}
          </p>

          <ol className="mt-10">
            {howItWorksSection.steps.map((step, index) => {
              const isLast = index === howItWorksSection.steps.length - 1;
              return (
                <FadeIn
                  as="li"
                  key={step.number}
                  delay={index * 90}
                  className={`relative flex gap-5 ${isLast ? "" : "pb-9"}`}
                >
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[21px] top-11 w-px bg-white/15"
                    />
                  )}
                  <span className="relative flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/10 text-base font-bold text-white ring-1 ring-white/15">
                    {step.number}
                  </span>
                  <div className="pt-2">
                    <h3 className="text-base font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </ol>
        </FadeIn>
      </div>
    </section>
  );
}
