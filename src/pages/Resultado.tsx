import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CHECKLIST, CAT_COLORS, getCatTotalPts, CYCLE_LABELS } from "@/data/checklist";
import { supabase } from "@/integrations/supabase/client";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, PieChart, Pie } from "recharts";
import { Phone, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Resultado = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [diag, setDiag] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");

  useEffect(() => {
    if (id) fetchDiag();
  }, [id]);

  const fetchDiag = async () => {
    const { data } = await supabase.from("diagnostics").select("*").eq("id", id).single();
    setDiag(data);
  };

  const openContactModal = () => {
    const levelLabel = diag?.level === "high" ? "Alto" : diag?.level === "medium" ? "Medio" : "Bajo";
    const ctx = diag
      ? `Acabo de completar mi diagnóstico SG-SST con un resultado de ${diag.score}/100 pts (Nivel ${levelLabel}). Me gustaría recibir asesoría.`
      : "Me gustaría recibir información sobre los servicios de SafeWork SST.";
    setMensaje(ctx);
    setDisponibilidad("");
    setShowModal(true);
  };

  const handleSubmitContact = async () => {
    if (!user || !mensaje.trim()) {
      toast.error("Escribe un mensaje");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("solicitudes").insert({
      client_id: user.id,
      mensaje: mensaje.trim(),
      disponibilidad: disponibilidad || "No especificada",
      score: diag?.score || 0,
      nivel: diag?.level || "low",
    });
    setSending(false);
    setShowModal(false);
    if (error) {
      toast.error("Error al enviar solicitud");
    } else {
      toast.success("✅ Solicitud enviada — te contactaremos pronto");
    }
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

  const shortNames: Record<string, string> = {
    recursos: "Recursos",
    "gestion-integral": "Gestión Integral",
    "gestion-salud": "Gestión Salud",
    "gestion-peligros": "Peligros/Riesgos",
    "gestion-amenazas": "Amenazas",
    verificacion: "Verificación",
    mejoramiento: "Mejoramiento",
  };

  const radarData = CHECKLIST.map((cat) => ({
    category: shortNames[cat.id] || cat.id,
    value: catScores[cat.id] || 0,
    fullMark: 100,
  }));

  const barData = CHECKLIST.map((cat) => ({
    name: shortNames[cat.id] || cat.id,
    value: catScores[cat.id] || 0,
    color: CAT_COLORS[cat.id],
  }));

  // Cycle (PHVA) scores
  const cycleColors: Record<string, string> = { "I. PLANEAR": "#3B82F6", "II. HACER": "#10B981", "III. VERIFICAR": "#8B5CF6", "IV. ACTUAR": "#06B6D4" };
  const cycleMap: Record<string, { total: number; earned: number }> = {};
  CHECKLIST.forEach((cat) => {
    const cycle = cat.cycle;
    if (!cycleMap[cycle]) cycleMap[cycle] = { total: 0, earned: 0 };
    const answers = (diag.answers || {}) as Record<string, any>;
    cat.items.forEach((item) => {
      cycleMap[cycle].total += item.pts;
      if (answers[item.id] === "si" || answers[item.id] === true) cycleMap[cycle].earned += item.pts;
    });
  });
  const cycleData = Object.entries(cycleMap).map(([cycle, { total, earned }]) => ({
    name: cycle.replace(/^[IVX]+\.\s*/, ""),
    value: total > 0 ? Math.round((earned / total) * 100) : 0,
    color: cycleColors[cycle] || "#888",
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
        <div className="font-semibold text-foreground mb-0.5">{label || payload[0]?.payload?.name}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="text-muted-foreground">{p.value}%</div>
        ))}
      </div>
    );
  };

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
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="60%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={5} axisLine={false} />
                  <Radar name="Cumplimiento" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-blue-pale/50 rounded-xl p-4">
              <h4 className="text-xs font-bold text-corp uppercase tracking-wider mb-3">Puntaje por categoría</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" interval={0} height={50} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cycle charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="bg-blue-pale/50 rounded-xl p-4">
              <h4 className="text-xs font-bold text-corp uppercase tracking-wider mb-3">Radar por ciclo PHVA</h4>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={cycleData} cx="50%" cy="50%" outerRadius="65%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={5} axisLine={false} />
                  <Radar name="Ciclo" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-blue-pale/50 rounded-xl p-4">
              <h4 className="text-xs font-bold text-corp uppercase tracking-wider mb-3">Puntaje por ciclo PHVA</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cycleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {cycleData.map((entry, i) => (
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

          {/* Plan recomendado */}
          <div className="bg-secondary rounded-2xl p-6 text-left mb-8">
            {level === "high" ? (
              <>
                <h3 className="font-heading text-lg font-bold text-foreground mb-4">📦 Plan Básico SST — Mantenimiento</h3>
                <ul className="space-y-2.5 mb-0">
                  {[
                    "Actualización anual de documentación SG-SST",
                    "Auditoría interna semestral",
                    "Capacitaciones trimestrales al personal",
                    "Soporte legal ante inspecciones del Ministerio",
                    "Actualización de matriz de riesgos GTC-45",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h3 className="font-heading text-lg font-bold text-foreground mb-4">🚀 Plan Integral SST — Básico + Implementación</h3>
                <ul className="space-y-2.5 mb-0">
                  {[
                    "Documentación completa del SG-SST",
                    "Implementación guiada paso a paso",
                    "Conformación y capacitación del COPASST",
                    "Elaboración de matriz de peligros y riesgos GTC-45",
                    "Plan de emergencias y simulacros",
                    "Programa de capacitación a trabajadores",
                    "Acompañamiento en mediciones higiénicas",
                    "Seguimiento mensual durante 12 meses",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={openContactModal} className="gap-2">
              <Phone className="h-4 w-4" />
              Contactar asesora
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>← Mis diagnósticos</Button>
          </div>
        </div>
      </main>

      {/* Modal Contactar Asesora */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">📞 Contactar asesora</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {profile && (
              <p className="text-sm text-muted-foreground">
                Enviaremos tu solicitud desde <strong className="text-foreground">{profile.nombre}</strong> ({profile.empresa})
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact-msg">Mensaje</Label>
              <Textarea
                id="contact-msg"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={5}
                placeholder="Describe tu necesidad..."
              />
            </div>

            <div className="space-y-2">
              <Label>Disponibilidad para contacto</Label>
              <Select value={disponibilidad} onValueChange={setDisponibilidad}>
                <SelectTrigger>
                  <SelectValue placeholder="— Selecciona —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mañanas (8am-12pm)">Mañanas (8am-12pm)</SelectItem>
                  <SelectItem value="Tardes (2pm-6pm)">Tardes (2pm-6pm)</SelectItem>
                  <SelectItem value="Cualquier horario">Cualquier horario</SelectItem>
                  <SelectItem value="Solo por correo">Solo por correo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSubmitContact} disabled={sending} className="gap-2">
                <Phone className="h-4 w-4" />
                {sending ? "Enviando…" : "Enviar solicitud"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resultado;