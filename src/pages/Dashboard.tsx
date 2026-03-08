import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchDiagnostics();
  }, [user]);

  const fetchDiagnostics = async () => {
    const { data } = await supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", user!.id)
      .order("fecha", { ascending: false });
    setDiagnostics(data || []);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const levelBadge = (level: string) => {
    const cls = level === "high" ? "bg-success/10 text-success" : level === "medium" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger";
    const txt = level === "high" ? "🟢 Alto" : level === "medium" ? "🟡 Medio" : "🔴 Bajo";
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{txt}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[66px] max-w-[880px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl text-navy font-bold">
              Hola, <span className="text-primary">{profile?.nombre}</span> 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{profile?.empresa}</p>
          </div>
        </div>

        {/* Diagnostic intro card */}
        <div className="rounded-2xl p-8 text-white mb-8 relative overflow-hidden" style={{ background: "var(--gradient-cta)" }}>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-7xl opacity-10">🛡️</div>
          <h2 className="font-heading text-xl mb-2">Diagnóstico de Seguridad y Salud en el Trabajo</h2>
          <p className="text-white/75 text-sm leading-relaxed max-w-[500px] mb-4">
            Evalúa el nivel de cumplimiento de tu empresa con el SG-SST según el Decreto 1072 de 2015 y la Resolución 0312 de 2019.
          </p>
          <div className="flex gap-8 text-sm">
            <div className="text-white/65"><strong className="block text-white text-base">60</strong>Preguntas</div>
            <div className="text-white/65"><strong className="block text-white text-base">6</strong>Categorías SST</div>
            <div className="text-white/65"><strong className="block text-white text-base">~10 min</strong>Duración</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-navy">Mis diagnósticos</h3>
          <Button onClick={() => navigate("/dashboard/diagnostico")}>+ Nuevo diagnóstico</Button>
        </div>

        {diagnostics.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border-[1.5px] border-border">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-heading text-lg text-navy mb-2">Aún no tienes diagnósticos</h3>
            <p className="text-sm text-muted-foreground">Haz clic en "Nuevo diagnóstico" para comenzar tu evaluación SST</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {diagnostics.map((d) => (
              <div key={d.id} className="bg-white rounded-xl p-4 border-[1.5px] border-border shadow-soft flex items-center gap-4 flex-wrap hover:shadow-elegant transition-shadow">
                <span className="text-sm text-muted-foreground min-w-[80px]">{d.fecha}</span>
                <span className="text-sm font-medium flex-1 text-navy">{profile?.empresa}</span>
                <span className="font-heading text-xl font-bold text-primary">{d.score} pts</span>
                {levelBadge(d.level)}
                <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/resultado/${d.id}`)}>Ver resultado</Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
