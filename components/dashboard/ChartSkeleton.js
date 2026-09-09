// Kerangka (skeleton) pengganti grafik recharts / peta saat modul beratnya
// masih diunduh (dynamic import, ssr: false). Halaman tampil lebih dulu.
export default function ChartSkeleton({ heightClass = "h-72", label = "Memuat grafik..." }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`${heightClass} w-full animate-pulse rounded-xl bg-slate-100`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
