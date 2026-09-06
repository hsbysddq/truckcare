import { stats } from "@/lib/content";
import FadeIn from "@/components/FadeIn";

export default function Stats() {
  return (
    <section className="border-b border-slate-100 bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 sm:grid-cols-3 lg:px-8">
        {stats.map((stat, index) => (
          <FadeIn
            key={stat.label}
            delay={index * 100}
            className="text-center sm:text-left"
          >
            <p className="text-4xl font-bold tracking-tight text-accent sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-3 text-base text-slate-500">{stat.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
