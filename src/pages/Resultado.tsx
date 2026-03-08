import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CHECKLIST, CAT_COLORS, getCatTotalPts } from "@/data/checklist";
import { supabase } from "@/integrations/supabase/client";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const Resultado = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [diag, setDiag] = useState<any>(null);

  useEffect(() => {
    if (id) fetchDiag();
  }, [id]);

  const fetchDiag = async () => {
    const { data } = await supabase.from("diagnostics").select("*").eq("id", id).single();
    setDiag(data);
  };

  if (!diag) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[66px] flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    </div>
  );

  const catScores = (diag.cat_scores || {}) as Record<string, number>;
  const score = diag.score;
  const level = diag.level;
  const color = level === "high" ? "#059669" : level === "medium" ? "#D97706" : "#DC2626";
  const levelTxt = level === "high" ? "🟢 Nivel Alto de Cumplimiento" : level === "medium" ? "🟡 Nivel Medio de Cumplimiento" : "🔴 Nivel Bajo de Cumplimiento";

  const radarData = CHECKLIST.map((cat) => ({
    category: cat.title.split(".")[1]?.trim().substring(0, 14) || cat.id,
    value: catScores[cat.id] || 0,
    fullMark: 100,
  }));

  const barData = CHECKLIST.map((cat) => ({
    name: cat.title.split(".")[1]?.trim().substring(0, 12) || cat.id,
    value: catScores[cat.id] || 0,
    color: CAT_COLORS[cat.id],
  }));

  const msg = level === "high"
    ? "¡Excelente resultado! Tu empresa tiene un alto nivel de cumplimiento del SG-SST."
    : level === "medium"
    ? "Tu empresa tiene aspectos importantes por mejorar en el SG-SST. Estas brechas pueden representar riesgos legales."
    : "Tu empresa presenta un nivel de cumplimiento bajo en SST, lo que representa un riesgo significativo.";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[66px] max-w-[880px] mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>← Mis diagnósticos</Button>
          <h1 className="font-heading text-xl text-navy">Resultado del diagnóstico</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 border-[1.5px] border-border shadow-elegant text-center">
          {/* Score ring */}
          <div className="w-[140px] h-[140px] rounded-full flex flex-col items-center justify-center mx-auto mb-6" style={{ border: `6px solid ${color}`, color }}>
            <span className="font-heading text-4xl font-bold leading-none">{score}</span>
            <span className="text-xs text-muted-foreground font-body">/ 100 pts</span>
          </div>
          <p className="text-base font-semibold mb-2" style={{ color }}>{levelTxt}</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[500px] mx-auto mb-8">{msg}</p>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="bg-blue-pale/50 rounded-xl p-4">
              <h4 className="text-xs font-bold text-corp uppercase tracking-wider mb-3">Radar de cumplimiento</h4>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Cumplimiento" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-blue-pale/50 rounded-xl p-4">
              <h4 className="text-xs font-bold text-corp uppercase tracking-wider mb-3">Puntaje por categoría</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category bars */}
          <div className="text-left mb-8">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Resultado por categoría</h4>
            {CHECKLIST.map((cat) => {
              const s = catScores[cat.id] || 0;
              const c = s >= 80 ? "#059669" : s >= 50 ? "#D97706" : "#DC2626";
              return (
                <div key={cat.id} className="mb-3">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-semibold text-navy">{cat.icon} {cat.title.split(".")[1]?.trim()}</span>
                    <span className="font-bold" style={{ color: c }}>{s}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s}%`, backgroundColor: c }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate("/dashboard")}>← Mis diagnósticos</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Resultado;
