import { ribbonSection } from "@/lib/content";

// Strip wordmark berjalan di bawah hero: teknologi yang dipakai +
// kanal sosial sebagai teks (tanpa meniru logo resmi siapa pun).
export default function RibbonLoop() {
  const items = [...ribbonSection.items, ...ribbonSection.items];
  return (
    <section aria-label={ribbonSection.label} className="overflow-hidden border-b border-slate-100 bg-white py-8">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {ribbonSection.label}
      </p>
      <div className="relative mt-6">
        <div className="animasi-ribbon flex w-max items-center gap-12 pr-12">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              aria-hidden={index >= ribbonSection.items.length}
              className="whitespace-nowrap text-xl font-bold tracking-tight text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
