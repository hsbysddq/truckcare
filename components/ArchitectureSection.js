import { architectureSection } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import FadeIn from "@/components/FadeIn";

export default function ArchitectureSection() {
  return (
    <section id="arsitektur" className="bg-slate-950 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <FadeIn className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5">
          <span className="text-sm font-medium uppercase tracking-wider text-white/40">
            Diagram Arsitektur Sistem
          </span>
        </FadeIn>

        <FadeIn delay={100}>
          <span className="text-sm font-semibold uppercase tracking-wider text-white/60">
            {architectureSection.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {architectureSection.headline}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/60">
            {architectureSection.description}
          </p>

          <dl className="mt-10 space-y-8">
            {architectureSection.points.map((point) => {
              const Icon = iconMap[point.icon];
              return (
                <div key={point.title} className="flex gap-4">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-white/10 text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-white">
                      {point.title}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-white/55">
                      {point.description}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </FadeIn>
      </div>
    </section>
  );
}
