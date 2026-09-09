import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RibbonLoop from "@/components/RibbonLoop";
import ProductPreviewSection from "@/components/ProductPreviewSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhySection from "@/components/WhySection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <RibbonLoop />
        <ProductPreviewSection />
        <HowItWorksSection />
        <WhySection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
