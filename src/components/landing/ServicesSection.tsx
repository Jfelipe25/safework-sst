const services = [
  {
    icon: "🔍",
    name: "Diagnóstico SST Gratuito",
    desc: "Evaluación inicial de tu sistema de gestión basado en la Resolución 0312. Conoce tu nivel de cumplimiento en minutos.",
  },
  {
    icon: "📋",
    name: "Plan Básico SG-SST",
    desc: "Documentación esencial: política, reglamento, matriz de riesgos, plan de emergencias y comité COPASST.",
  },
  {
    icon: "🚀",
    name: "Implementación Completa",
    desc: "Acompañamiento full en la implementación del SG-SST, capacitaciones, seguimiento y auditorías internas.",
  },
  {
    icon: "⚠️",
    name: "Investigación de Accidentes",
    desc: "Metodología GTC-45 para investigación de accidentes e incidentes de trabajo con reportes ante ARL y Mintrabajo.",
  },
  {
    icon: "📊",
    name: "Auditorías y Seguimiento",
    desc: "Auditorías periódicas del SG-SST, revisión por la alta dirección e indicadores de gestión mensuales.",
  },
  {
    icon: "🎓",
    name: "Capacitaciones",
    desc: "Programas de formación en SST para trabajadores y líderes, primeros auxilios, manejo de riesgo y más.",
  },
];

const digitalService = {
  icon: "💻",
  name: "Sistema Digital de Gestión",
  desc: "Desarrollo de herramientas digitales para la recolección de datos en tiempo real, seguimiento de KPIs y toma de decisiones eficientes, totalmente personalizado para cada empresa.",
  benefits: [
    "Datos en tiempo real",
    "KPIs personalizados",
    "Digitalización de formatos",
    "Centralización de información",
    "100% adaptado a tu empresa",
  ],
};

const ServicesSection = () => {
  return (
    <section id="services-section" className="py-24 px-6 lg:px-10 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-xs font-semibold tracking-[2px] uppercase text-primary mb-3">
          Lo que ofrecemos
        </p>
        <h2 className="font-heading text-3xl lg:text-[2.4rem] text-navy font-bold mb-3">
          Servicios de consultoría SST
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[560px] mb-12">
          Soluciones integrales para el cumplimiento del SG-SST, desde el diagnóstico inicial hasta la implementación completa y el seguimiento continuo.
        </p>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="bg-white rounded-2xl p-8 border-[1.5px] border-border relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elegant-lg hover:border-primary/25 group"
            >
              {/* Bottom bar on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-corp scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              <div className="w-[46px] h-[46px] rounded-xl bg-blue-pale flex items-center justify-center text-xl mb-4">
                {svc.icon}
              </div>
              <h3 className="font-heading text-lg font-semibold text-navy mb-2">{svc.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>

        {/* Full-width digital service card */}
        <div className="rounded-2xl p-8 border-2 border-primary/25 bg-gradient-to-br from-blue-pale to-white">
          <div className="flex gap-6 flex-wrap items-start">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: "var(--gradient-cta)" }}>
                {digitalService.icon}
              </div>
            </div>
            <div className="flex-1 min-w-[240px]">
              <h3 className="font-heading text-lg font-semibold text-navy mb-2">{digitalService.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {digitalService.desc} Todo formato que desee gestionar se puede digitalizar para aumentar eficiencia, productividad y centralización de datos, lo que conlleva en una <strong className="text-navy">mejor toma de decisiones basada en sus datos reales</strong>.
              </p>
            </div>
            <div className="min-w-[190px] pt-1">
              <p className="text-xs font-bold text-corp uppercase tracking-wider mb-2">Beneficios clave</p>
              {digitalService.benefits.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground py-0.5">
                  <span className="text-success font-bold">✓</span> {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
