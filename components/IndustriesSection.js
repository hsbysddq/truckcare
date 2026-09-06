import { industriesSection } from "@/lib/content";
import { iconMap } from "@/components/icon-map";
import FadeIn from "@/components/FadeIn";

export default function IndustriesSection() {
  return (
    <section id="industri" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            {industriesSection.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {industriesSection.headline}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            {industriesSection.description}
          </p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industriesSection.items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <FadeIn
                key={item.name}
                delay={index * 100}
                className="rounded-2xl border border-slate-200 bg-white p-8 transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-tint text-accent">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
