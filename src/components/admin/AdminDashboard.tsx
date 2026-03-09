import { AdminData } from "@/pages/Admin";
import { CHECKLIST, CAT_COLORS } from "@/data/checklist";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = ({ data }: { data: AdminData }) => {
  const { clients, diagnostics } = data;
  const high = diagnostics.filter((d) => d.level === "high").length;
  const medLow = diagnostics.filter((d) => d.level !== "high").length;
  const avg = diagnostics.length ? Math.round(diagnostics.reduce((s, d) => s + d.score, 0) / diagnostics.length) : 0;

  // Sector breakdown
  const sectorMap: Record<string, number> = {};
  clients.forEach((c) => { if (c.sector) sectorMap[c.sector] = (sectorMap[c.sector] || 0) + 1; });
  const sectors = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]);

  // Category averages for radar
  const catAvgs = CHECKLIST.map((cat) => {
    const vals = diagnostics.map((d) => ((d.cat_scores as any)?.[cat.id] || 0));
    return {
      category: cat.title.split(".")[1]?.trim().substring(0, 14),
      value: vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0,
    };
  });

  // Level distribution for donut
  const levelData = [
    { name: "Alto ≥80%", value: high, color: "#059669" },
    { name: "Medio 50-79%", value: diagnostics.filter(d => d.level === "medium").length, color: "#D97706" },
    { name: "Bajo <50%", value: diagnostics.filter(d => d.level === "low").length, color: "#DC2626" },
  ].filter(d => d.value > 0);

  const kpiCard = (value: string | number, label: string, color?: string) => (
    <div className="bg-white/[0.06] border border-white/[0.09] rounded-xl p-5">
      <div className="font-heading text-3xl font-bold" style={{ color: color || "#60A5FA" }}>{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-1">Dashboard</h1>
      <p className="text-sm text-white/40 mb-6">Resumen general de actividad y clientes</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCard(clients.length, "Clientes registrados")}
        {kpiCard(diagnostics.length, "Diagnósticos realizados")}
        {kpiCard(high, "Nivel alto ≥80 pts", "#34D399")}
        {kpiCard(medLow, "Nivel medio / bajo", "#FBBF24")}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Avg score */}
        <div className="bg-white/[0.06] border border-white/[0.09] rounded-xl p-5 flex items-center gap-6">
          <div className="text-center shrink-0">
            <div className="font-heading text-4xl font-bold text-blue-light">{avg || "—"}</div>
            <div className="text-xs text-white/40 mt-1">pts promedio</div>
          </div>
          <div className="flex-1">
            <div className="h-[7px] bg-white/[0.08] rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avg}%`, background: "linear-gradient(90deg, #3B82F6, #60A5FA)" }} />
            </div>
            <p className="text-xs text-white/35">{diagnostics.length ? `Basado en ${diagnostics.length} diagnóstico${diagnostics.length > 1 ? "s" : ""}` : "Sin diagnósticos aún"}</p>
          </div>
        </div>

        {/* Sector breakdown */}
        <div className="bg-white/[0.06] border border-white/[0.09] rounded-xl p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Clientes por sector</p>
          <div className="flex flex-col gap-2">
            {sectors.length === 0 ? (
              <p className="text-xs text-white/25 italic">Sin datos</p>
            ) : sectors.slice(0, 5).map(([sector, count]) => (
              <div key={sector}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-white/70">{sector}</span>
                  <span className="font-bold text-blue-light">{count}</span>
                </div>
                <div className="h-[5px] bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(count / (sectors[0]?.[1] || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Distribución de niveles</h3>
          {levelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={levelData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {levelData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-white/30 text-center py-16">Sin datos</p>}
          <div className="flex gap-4 justify-center mt-2">
            {levelData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-white/60">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Promedio por categoría</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={catAvgs}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.55)" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "rgba(255,255,255,0.4)" }} />
              <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <h3 className="text-sm font-semibold text-white mb-3">Actividad reciente</h3>
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.06]">
              {["Cliente", "Empresa", "Fecha", "Puntaje", "Nivel"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diagnostics.slice(0, 10).map((d) => {
              const client = clients.find((c) => c.user_id === d.user_id);
              const lvlCls = d.level === "high" ? "bg-success/10 text-success" : d.level === "medium" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger";
              const lvlTxt = d.level === "high" ? "Alto" : d.level === "medium" ? "Medio" : "Bajo";
              return (
                <tr key={d.id} className="border-t border-white/[0.04] hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-sm text-white/70">{client?.nombre || "—"}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{client?.empresa || "—"}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{d.fecha}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-light">{d.score} pts</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${lvlCls}`}>{lvlTxt}</span></td>
                </tr>
              );
            })}
            {diagnostics.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">Sin diagnósticos aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
