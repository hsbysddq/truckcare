import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PengaduanForm from "@/components/PengaduanForm";
import { pengaduanPublikPage } from "@/lib/content";

export default function PengaduanPage() {
  const copy = pengaduanPublikPage;

  return (
    <>
      <Navbar forceSolid />
      <main className="bg-slate-50 pt-20">
        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cta">
            {copy.eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            {copy.description}
          </p>
          <div className="mt-10">
            <PengaduanForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}