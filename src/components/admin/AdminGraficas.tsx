import { AdminData } from "@/pages/Admin";
import { CHECKLIST } from "@/data/checklist";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const AdminGraficas = ({ data }: { data: AdminData }) => {
  const { diagnostics, clients } = data;

  // Level distribution
  const levelData = [
    { name: "Alto ≥80%", value: diagnostics.filter(d => d.level === "high").length, color: "#059669" },
    { name: "Medio 50-79%", value: diagnostics.filter(d => d.level === "medium").length, color: "#D97706" },
    { name: "Bajo <50%", value: diagnostics.filter(d => d.level === "low").length, color: "#DC2626" },
  ].filter(d => d.value > 0);

  // Category averages for radar
  const catAvgs = CHECKLIST.map((cat) => {
    const vals = diagnostics.map((d) => ((d.cat_scores as any)?.[cat.id] || 0));
    return {
      category: cat.title.split(".")[1]?.trim().substring(0, 14) || cat.id,
      value: vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0,
    };
  });

  // Diagnostics by sector
  const sectorMap: Record<string, number> = {};
  diagnostics.forEach((d) => {
    const c = clients.find(cl => cl.user_id === d.user_id);
    const sector = c?.sector || "Sin sector";
    sectorMap[sector] = (sectorMap[sector] || 0) + 1;
  });
  const sectorData = Object.entries(sectorMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Scores by company
  const companyMap: Record<string, { total: number; count: number }> = {};
  diagnostics.forEach((d) => {
    const c = clients.find(cl => cl.user_id === d.user_id);
    const empresa = c?.empresa || "—";
    if (!companyMap[empresa]) companyMap[empresa] = { total: 0, count: 0 };
    companyMap[empresa].total += d.score;
    companyMap[empresa].count += 1;
  });
  const companyData = Object.entries(companyMap)
    .map(([name, { total, count }]) => ({ name: name.substring(0, 16), score: Math.round(total / count) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const chartCard = (title: string, content: React.ReactNode) => (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {content}
    </div>
  );

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-1">Análisis estadístico</h1>
      <p className="text-sm text-white/40 mb-6">Compilación de datos de todas las empresas diagnosticadas</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {chartCard("Distribución de niveles de cumplimiento",
          levelData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={levelData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" strokeWidth={0}>
                    {levelData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2">
                {levelData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-white/60">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-xs text-white/30 text-center py-16">Sin datos</p>
        )}

        {chartCard("Promedio por categoría SST",
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={catAvgs}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.55)" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "rgba(255,255,255,0.4)" }} />
              <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {chartCard("Diagnósticos por sector económico",
          sectorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sectorData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} width={90} />
                <Tooltip contentStyle={{ background: "#0A2540", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "white" }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-white/30 text-center py-16">Sin datos</p>
        )}

        {chartCard("Puntajes por empresa",
          companyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={companyData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.45)" }} angle={-30} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                <Tooltip contentStyle={{ background: "#0A2540", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "white" }} />
                <Bar dataKey="score" fill="#60A5FA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-white/30 text-center py-16">Sin datos</p>
        )}
      </div>
    </div>
  );
};

export default AdminGraficas;
