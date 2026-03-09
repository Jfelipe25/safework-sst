import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModals from "@/components/AuthModals";

const CTASection = () => {
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  return (
    <>
      <section className="px-6 lg:px-10 pb-24 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div
            className="rounded-2xl p-8 lg:p-12 flex items-center justify-between gap-8 flex-wrap"
            style={{ background: "var(--gradient-cta)" }}
          >
            <div>
              <h2 className="font-heading text-2xl lg:text-[1.7rem] text-white mb-2">
                ¿Listo para proteger a tu equipo?
              </h2>
              <p className="text-white/65 text-base">
                Realiza el diagnóstico gratuito y conoce el estado actual de tu empresa.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-corp font-semibold whitespace-nowrap hover:bg-white/90 hover:shadow-elegant-lg"
              onClick={() => setAuthMode("register")}
            >
              Comenzar ahora →
            </Button>
          </div>
        </div>
      </section>

      <AuthModals mode={authMode} onClose={() => setAuthMode(null)} onSwitch={setAuthMode} />
    </>
  );
};

export default CTASection;
