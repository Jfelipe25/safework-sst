import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import profileImage from "@/assets/profile.png";

const expertiseAreas = [
  { icon: "🛡️", title: "Seguridad y Salud en el Trabajo", desc: "Diseño e implementación del SG-SST conforme al Decreto 1072 y Resolución 0312." },
  { icon: "⚙️", title: "Gestión de Producción", desc: "Optimización de procesos productivos, indicadores de eficiencia y mejora continua." },
  { icon: "👥", title: "Recursos Humanos", desc: "Estructuración de áreas de talento humano, bienestar laboral y gestión del clima organizacional." },
  { icon: "📊", title: "Calidad y Gestión", desc: "Sistemas de gestión de calidad, indicadores de desempeño y auditorías organizacionales." },
  { icon: "📈", title: "Transformación Organizacional", desc: "Liderazgo de procesos de cambio con enfoque en sostenibilidad y rentabilidad." },
  { icon: "📋", title: "Cumplimiento Normativo", desc: "Gestión de requisitos legales laborales, normas técnicas y estándares SST vigentes." },
];

const values = ["Rigor técnico", "Compromiso real", "Enfoque preventivo", "Resultados medibles", "Acompañamiento continuo"];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[66px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-6 text-center" style={{ background: "var(--gradient-cta)" }}>
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-primary/[0.12]" />
          <p className="text-xs font-semibold tracking-[2px] uppercase text-white/60 mb-3 relative z-10"></p>
          <h1 className="font-heading text-3xl lg:text-[2.8rem] text-white font-bold mb-3 relative z-10">Julieth Perez</h1>
          <p className="text-white/65 text-base relative z-10">Ingeniera Industrial · Consultora SST · Especialista en Gestión Organizacional</p>
        </section>

        {/* Body */}
        <section className="max-w-[960px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-14 items-start">
            {/* Photo sidebar */}
            <div className="lg:sticky lg:top-24 text-center">
              <div className="w-full rounded-2xl overflow-hidden bg-blue-pale border-[3px] border-white shadow-elegant-lg aspect-[3/4] mb-5">
                <img src={profileImage} alt="Julieth Pérez Rodríguez - Consultora SafeWork SST" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-heading text-xl text-navy font-bold">Consultora SafeWork SST</h3>
              <p className="text-sm text-primary font-medium mt-1">Ingeniera Industrial · Especialista SST</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["🛡️ SST", "⚙️ Producción", "📊 Calidad", "👥 RRHH"].map((pill) => (
                  <span key={pill} className="px-3 py-1 rounded-full bg-blue-pale text-corp text-xs font-semibold border border-primary/20">
                    {pill}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <Button className="w-full">Diagnóstico gratuito →</Button>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="font-heading text-2xl text-navy font-bold mb-4">Mi trayectoria profesional</h2>
              <p className="text-[0.95rem] text-muted-foreground leading-relaxed mb-4">
                Soy Ingeniera Industrial con amplia trayectoria en la dirección de áreas estratégicas como producción, recursos humanos, calidad, seguridad y salud en el trabajo, y gestión administrativa.
              </p>
              <p className="text-[0.95rem] text-muted-foreground leading-relaxed mb-4">
                A lo largo de mi carrera he liderado procesos de <strong className="text-navy">transformación organizacional</strong>, estructuración de indicadores de gestión, fortalecimiento del cumplimiento normativo y optimización de recursos, logrando mejoras sostenibles en productividad, eficiencia y rentabilidad.
              </p>
              <p className="text-[0.95rem] text-muted-foreground leading-relaxed mb-8">
                Mi enfoque integra el cumplimiento legal con la construcción de culturas organizacionales sólidas, donde la seguridad no es solo una obligación normativa, sino un valor compartido por toda la organización.
              </p>

              <div className="h-px bg-border my-8" />

              <h2 className="font-heading text-2xl text-navy font-bold mb-4">Áreas de experticia</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {expertiseAreas.map((area) => (
                  <div key={area.title} className="bg-white rounded-xl p-5 border-[1.5px] border-border flex gap-3.5 items-start">
                    <div className="w-[38px] h-[38px] rounded-lg bg-blue-pale flex items-center justify-center text-lg shrink-0">
                      {area.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-navy mb-1">{area.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{area.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border my-8" />

              <h2 className="font-heading text-2xl text-navy font-bold mb-4">Mi enfoque de trabajo</h2>
              <p className="text-[0.95rem] text-muted-foreground leading-relaxed mb-4">
                Creo firmemente que la seguridad y la productividad no son conceptos opuestos, sino complementarios. Un entorno laboral seguro, con procesos bien estructurados y personas capacitadas, es la base para que cualquier organización alcance sus metas de manera sostenible.
              </p>
              <p className="text-[0.95rem] text-muted-foreground leading-relaxed mb-6">
                Trabajo de la mano con cada empresa, entendiendo su contexto particular, sus riesgos específicos y sus objetivos de negocio, para diseñar soluciones que realmente funcionen en el día a día.
              </p>

              <div className="flex gap-3 flex-wrap mt-6">
                {values.map((v) => (
                  <span
                    key={v}
                    className="px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-[0_4px_12px_rgba(59,130,246,0.25)]"
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy text-white/40 text-center py-8 text-sm font-body">
        © {new Date().getFullYear()} SafeWork SST · Consultoría en Seguridad y Salud en el Trabajo · Colombia
      </footer>
    </div>
  );
};

export default About;
