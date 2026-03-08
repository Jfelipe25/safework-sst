import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CHECKLIST, getCatTotalPts, CYCLE_LABELS } from "@/data/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Diagnostico = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const totalItems = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / totalItems) * 100);

  const toggleItem = (id: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let earned = 0;
    const catScores: Record<string, number> = {};

    CHECKLIST.forEach((cat) => {
      let catEarned = 0;
      const catTotal = getCatTotalPts(cat.id);
      cat.items.forEach((item) => {
        if (answers[item.id]) {
          catEarned += item.pts;
          earned += item.pts;
        }
      });
      catScores[cat.id] = Math.round((catEarned / catTotal) * 100);
    });

    const score = Math.round(earned);
    const level = score >= 80 ? "high" : score >= 50 ? "medium" : "low";

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

    // Update trazabilidad status
    await supabase.from("trazabilidad").upsert({
      client_id: user!.id,
      status_id: "con-diag",
    }, { onConflict: "client_id" });

    toast.success("✅ Diagnóstico completado");
    navigate(`/dashboard/resultado/${data.id}`);
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
            <span className="font-heading text-xl font-bold text-corp whitespace-nowrap">{pct}%</span>
          </div>

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
                    {cat.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex gap-3 p-3 rounded-lg mb-1 border-[1.5px] transition-all cursor-pointer items-start ${
                          answers[item.id] ? "bg-success/5 border-success/20" : "border-transparent hover:bg-blue-pale hover:border-primary/15"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-[17px] h-[17px] min-w-[17px] mt-0.5 accent-primary cursor-pointer"
                          checked={!!answers[item.id]}
                          onChange={() => toggleItem(item.id)}
                        />
                        <span className="text-xs font-bold text-primary/60 min-w-[42px] pt-0.5">{item.id}</span>
                        <span className="text-sm text-muted-foreground leading-relaxed flex-1">{item.text}</span>
                        <span className="text-xs font-semibold text-primary min-w-[42px] text-right pt-0.5">{item.pts} pts</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

          <Button size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : "Ver mi resultado →"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Diagnostico;
