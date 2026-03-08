import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="min-h-[calc(100vh-66px)] relative overflow-hidden flex items-center" style={{ background: "var(--gradient-hero)" }}>
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='40' cy='40' r='1' fill='%23ffffff' fill-opacity='1'/%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-10 py-20 w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-20 items-center">
        {/* Left Content */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/[0.12] border border-white/[0.22] text-white/90 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            🛡️ Expertos en Seguridad y Salud en el Trabajo
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.1] text-white font-bold mb-6">
            Protege a tu equipo<br />
            con gestión <em className="italic text-blue-light">SST</em><br />
            profesional
          </h1>
          <p className="text-base lg:text-lg text-white/[0.72] leading-relaxed max-w-[500px] mb-8">
            Consultoría especializada en Seguridad y Salud en el Trabajo. Acompañamos a tu empresa en el cumplimiento legal y la implementación del SG-SST conforme al Decreto 1072 y la Resolución 0312.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button variant="hero" size="lg">Diagnóstico gratuito →</Button>
            <Button variant="heroSecondary" size="lg" asChild>
              <a href="/sobre">Sobre mí</a>
            </Button>
          </div>
        </div>

        {/* Right Card */}
        <div className="hidden lg:block bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-md animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="font-heading text-lg text-white mb-1">Impacto de nuestro trabajo</h3>
          <p className="text-white/55 text-sm mb-6">Empresas protegidas con SG-SST activo</p>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { num: "+120", label: "Empresas asesoradas" },
              { num: "98%", label: "Cumplimiento legal" },
              { num: "0", label: "Sanciones en clientes" },
              { num: "8+", label: "Años de experiencia" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.08] border border-white/10 rounded-xl p-4">
                <div className="font-heading text-3xl text-blue-light font-bold">{stat.num}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
