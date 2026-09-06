import { caraKerjaSection } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

export default function CaraKerjaSection() {
  return (
    <section id="cara-kerja" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            {caraKerjaSection.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {caraKerjaSection.headline}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            {caraKerjaSection.description}
          </p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {caraKerjaSection.steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 100} className="relative">
              <span className="text-5xl font-bold tracking-tight text-accent-tint">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-500">
                {step.description}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
