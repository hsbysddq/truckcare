import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CaraKerjaSection from "@/components/CaraKerjaSection";
import IndustriesSection from "@/components/IndustriesSection";
import FeaturesSection from "@/components/FeaturesSection";
import DashboardPreviewSection from "@/components/DashboardPreviewSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CaraKerjaSection />
        <IndustriesSection />
        <FeaturesSection />
        <DashboardPreviewSection />
        <ArchitectureSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
