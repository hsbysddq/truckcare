import { whySection } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import FadeIn from "@/components/FadeIn";

export default function WhySection() {
  return (
    <section id="mengapa" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {whySection.headline}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            {whySection.description}
          </p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
          {whySection.cards.map((card, index) => {
            const Icon = iconMap[card.icon];
            return (
              <FadeIn
                key={card.title}
                delay={index * 100}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8"
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-accent-tint text-accent">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 min-h-14 text-lg font-semibold leading-7 text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-500">
                  {card.description}
                </p>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
