import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CHECKLIST, getCatTotalPts, CYCLE_LABELS, itemApplies } from "@/data/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Answer = "si" | "no" | "na";

const Diagnostico = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);

  const trabajadores = profile?.trabajadores || null;
  const riesgo = profile?.riesgo || null;

  // Determine which items apply based on profile
  const applicableItems = useMemo(() => {
    const set = new Set<string>();
    CHECKLIST.forEach((cat) => {
      cat.items.forEach((item) => {
        if (itemApplies(item, trabajadores, riesgo)) {
          set.add(item.id);
        }
      });
    });
    return set;
  }, [trabajadores, riesgo]);

  const totalItems = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / totalItems) * 100);

  const setAnswer = (id: string, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (answered < totalItems) {
      toast.error(`Faltan ${totalItems - answered} preguntas por responder`);
      return;
    }

    setSubmitting(true);
    let earned = 0;
    let totalApplicable = 0;
    const catScores: Record<string, number> = {};

    CHECKLIST.forEach((cat) => {
      let catEarned = 0;
      let catTotal = 0;
      cat.items.forEach((item) => {
        if (answers[item.id] === "na") return; // skip NA items
        catTotal += item.pts;
        totalApplicable += item.pts;
        if (answers[item.id] === "si") {
          catEarned += item.pts;
          earned += item.pts;
        }
      });
      catScores[cat.id] = catTotal > 0 ? Math.round((catEarned / catTotal) * 100) : 100;
    });

    const score = totalApplicable > 0 ? Math.round((earned / totalApplicable) * 100) : 0;
    const level = score >= 86 ? "high" : score >= 60 ? "medium" : "low";

    const { data, error } = await supabase.from("diagnostics").insert({
      user_id: user!.id,
      score,
      level,
      cat_scores: catScores,
      answers,
    }).select().single();

    if (error) {
      toast.error("Error al guardar el diagnóstico");
      setSubmitting(false);
      return;
    }

    await supabase.from("trazabilidad").upsert({
      client_id: user!.id,
      status_id: "con-diag",
    }, { onConflict: "client_id" });

    toast.success("✅ Diagnóstico completado");
    navigate(`/dashboard/resultado/${data.id}`);
  };

  const workerLabel = (min: number) => {
    if (min <= 1) return "Todas";
    if (min <= 11) return "≥11 trab.";
    return "≥50 trab.";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[66px] max-w-[880px] mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>← Volver</Button>
          <h1 className="font-heading text-xl text-navy">Diagnóstico SG-SST</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 border-[1.5px] border-border shadow-elegant">
          {/* Progress */}
          <div className="bg-blue-pale rounded-xl p-4 mb-6 flex items-center gap-6 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <p className="text-xs font-semibold text-corp mb-1">Progreso del diagnóstico</p>
              <div className="h-[7px] bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "var(--gradient-blue-bar)" }} />
              </div>
            </div>
            <span className="font-heading text-xl font-bold text-corp whitespace-nowrap">{answered}/{totalItems} — {pct}%</span>
          </div>

          {/* Profile info banner */}
          {profile && (
            <div className="bg-secondary/50 rounded-lg p-3 mb-6 text-xs text-muted-foreground flex items-center gap-4 flex-wrap">
              <span>👷 <strong className="text-foreground">{profile.trabajadores || "?"}</strong> trabajadores</span>
              <span>⚠️ Riesgo: <strong className="text-foreground">{profile.riesgo || "No definido"}</strong></span>
              <span className="text-[0.7rem] opacity-70">Las preguntas que no aplican a tu empresa se marcan con una etiqueta</span>
            </div>
          )}

          {/* Categories grouped by PHVA cycle */}
          {Object.keys(CYCLE_LABELS).map((cycle) => {
            const cats = CHECKLIST.filter((c) => c.cycle === cycle);
            if (cats.length === 0) return null;
            return (
              <div key={cycle} className="mb-10">
                <h2 className="font-heading text-lg text-corp mb-4 pb-2 border-b-2 border-primary/20">
                  {cycle} — {CYCLE_LABELS[cycle]}
                </h2>
                {cats.map((cat) => (
                  <div key={cat.id} className="mb-8">
                    <h3 className="font-heading text-base text-navy mb-3 pb-2 border-b border-border flex items-center gap-2">
                      {cat.icon} {cat.title}
                      <span className="ml-auto text-xs font-body font-semibold" style={{ color: cat.color }}>
                        {getCatTotalPts(cat.id)} pts
                      </span>
                    </h3>
                    {cat.items.map((item) => {
                      const val = answers[item.id];
                      const applies = applicableItems.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg mb-1.5 border-[1.5px] transition-all ${
                            val === "na"
                              ? "bg-muted/30 border-muted/40 opacity-60"
                              : val === "si"
                              ? "bg-success/5 border-success/20"
                              : val === "no"
                              ? "bg-destructive/5 border-destructive/20"
                              : "border-transparent hover:bg-blue-pale"
                          }`}
                        >
                          <div className="flex gap-3 items-start">
                            <span className="text-xs font-bold text-primary/60 min-w-[42px] pt-0.5">{item.id}</span>
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
                              <div className="flex gap-1.5 mt-1 flex-wrap">
                                <span className={`inline-block text-[0.65rem] px-1.5 py-0.5 rounded font-semibold ${
                                  applies ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
                                }`}>
                                  {workerLabel(item.minWorkers)}
                                </span>
                                <span className="inline-block text-[0.65rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                  Riesgo {item.riskLevels.join(", ")}
                                </span>
                                {!applies && (
                                  <span className="inline-block text-[0.65rem] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">
                                    Puede no aplicar a tu empresa
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-primary min-w-[42px] text-right pt-0.5">{item.pts} pts</span>
                          </div>
                          <div className="flex gap-2 ml-[54px] mt-2">
                            <button
                              type="button"
                              onClick={() => setAnswer(item.id, "si")}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                val === "si"
                                  ? "bg-success text-white border-success"
                                  : "bg-transparent text-muted-foreground border-border hover:border-success/50 hover:text-success"
                              }`}
                            >
                              ✓ Sí cumple
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnswer(item.id, "no")}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                val === "no"
                                  ? "bg-destructive text-white border-destructive"
                                  : "bg-transparent text-muted-foreground border-border hover:border-destructive/50 hover:text-destructive"
                              }`}
                            >
                              ✗ No cumple
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnswer(item.id, "na")}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                val === "na"
                                  ? "bg-muted-foreground text-white border-muted-foreground"
                                  : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground/50"
                              }`}
                            >
                              ⊘ No aplica
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}

          <Button size="lg" className="w-full" onClick={handleSubmit} disabled={submitting || answered < totalItems}>
            {submitting ? "Guardando..." : answered < totalItems ? `Responde todas las preguntas (${totalItems - answered} restantes)` : "Ver mi resultado →"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Diagnostico;
