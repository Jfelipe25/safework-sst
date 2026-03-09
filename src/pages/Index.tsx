import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ServicesSection from "@/components/landing/ServicesSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[66px]">
        <HeroSection />
        <ServicesSection />
        <CTASection />
      </main>
      {/* Footer */}
      <footer className="bg-navy text-white/40 text-center py-8 text-sm font-body">
        © {new Date().getFullYear()} JPR - SST · Julieth Pérez Rodríguez · Consultoría en Seguridad y Salud en el Trabajo · Colombia
      </footer>
    </div>
  );
};

export default Index;
