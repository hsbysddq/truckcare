import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import IndustriesSection from "@/components/IndustriesSection";
import FeaturesSection from "@/components/FeaturesSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <IndustriesSection />
        <FeaturesSection />
        <ArchitectureSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
