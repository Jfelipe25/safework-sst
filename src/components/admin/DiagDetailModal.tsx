import { useMemo } from "react";
import { CHECKLIST } from "@/data/checklist";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const TOTAL_PTS = CHECKLIST.reduce((s, cat) => s + cat.items.reduce((ss, it) => ss + it.pts, 0), 0);
const CAT_HEX = ['#60A5FA','#34D399','#FBBF24','#F87171','#A78BFA','#14B8A6'];
interface Props {
  diag: any;
  client: any;
  onClose: () => void;
  onDownload: () => void;
}

const DiagDetailModal = ({ diag, client, onClose, onDownload }: Props) => {
  const catScores = (diag.cat_scores as any) || {};
  const answers = (diag.answers as any) || {};
  const color = diag.level === "high" ? "#059669" : diag.level === "medium" ? "#D97706" : "#DC2626";
  const lvlTxt = diag.level === "high" ? "Alto" : diag.level === "medium" ? "Medio" : "Bajo";

  const radarData = useMemo(() =>
    CHECKLIST.map((cat, i) => ({
      subject: cat.title.split('.')[1]?.trim().substring(0, 14) || cat.title,
      value: catScores[cat.id] || 0,
      fullMark: 100,
    })), [catScores]);

  const barData = useMemo(() =>
    CHECKLIST.map((cat, i) => ({
      name: cat.title.split('.')[1]?.trim().substring(0, 12) || cat.id,
      value: catScores[cat.id] || 0,
      fill: CAT_HEX[i],
    })), [catScores]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="bg-[#0f2d4a] border border-white/10 rounded-2xl w-[800px] max-w-full p-6 relative my-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
          <div>
            <h2 className="font-heading text-xl text-white mb-0.5">{client?.empresa || "Diagnóstico"}</h2>
            <p className="text-[0.82rem] text-white/40">
              {client?.nombre} · {diag.fecha} · Nivel {lvlTxt} · {diag.score} / 100 pts
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={onDownload} className="bg-success/20 text-emerald-400 border border-success/30 rounded-lg px-3 py-1.5 text-[0.82rem] cursor-pointer whitespace-nowrap">
              📄 Descargar PDF
            </button>
            <button onClick={onClose} className="bg-white/[0.08] border-none rounded-lg px-3 py-1.5 text-white/60 text-[0.9rem] cursor-pointer">✕</button>
          </div>
        </div>

        {/* Score + Meta */}
        <div className="flex items-center gap-5 mb-5 flex-wrap bg-white/[0.04] rounded-xl p-5">
          <div
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center flex-shrink-0 font-heading"
            style={{ border: `6px solid ${color}` }}
          >
            <span className="text-[1.8rem] font-bold leading-none" style={{ color }}>{diag.score}</span>
            <span className="text-[0.55rem] text-white/50 mt-0.5">/ 100 pts</span>
            <span className="text-[0.65rem] font-bold mt-0.5" style={{ color }}>{lvlTxt}</span>
          </div>
          <div className="text-sm text-white/50 leading-loose flex-1">
            Empresa: <strong className="text-white">{client?.empresa || "—"}</strong> &nbsp;·&nbsp;
            Sector: <strong className="text-white">{client?.sector || "—"}</strong> &nbsp;·&nbsp;
            Trabajadores: <strong className="text-white">{client?.trabajadores || "—"}</strong><br />
            Riesgo: <strong className="text-white">{client?.riesgo || "—"}</strong> &nbsp;·&nbsp;
            ARL: <strong className="text-white">{client?.arl || "—"}</strong> &nbsp;·&nbsp;
            Ciudad: <strong className="text-white">{client?.ciudad || "—"}</strong>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/[0.04] rounded-xl p-5">
            <div className="text-[0.75rem] font-bold text-white/40 uppercase tracking-wide mb-3">Radar de cumplimiento</div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%">
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickCount={5} />
                  <Radar name="Cumplimiento" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} dot={{ r: 5, fill: '#3B82F6', stroke: '#0f2d4a', strokeWidth: 2 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-5">
            <div className="text-[0.75rem] font-bold text-white/40 uppercase tracking-wide mb-3">Puntaje por categoría</div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} tickFormatter={v => `${v}%`} />
                  <Tooltip cursor={false} contentStyle={{ background: '#0A2540', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 12 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Color legend */}
        <div className="bg-white/[0.04] rounded-xl p-4 mb-5 border border-white/[0.07]">
          <div className="text-[0.72rem] font-bold text-white/35 uppercase tracking-wide mb-2.5">Referencia de categorías</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {CHECKLIST.map((cat, i) => {
              const s = catScores[cat.id] || 0;
              const vc = s >= 80 ? '#34D399' : s >= 50 ? '#FBBF24' : '#F87171';
              const ptsTotal = cat.items.reduce((a, it) => a + it.pts, 0);
              const ptsEarned = cat.items.filter(it => answers[it.id]).reduce((a, it) => a + it.pts, 0);
              return (
                <div key={cat.id} className="flex items-center gap-2 py-1.5 px-2 bg-white/[0.03] rounded-lg">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: CAT_HEX[i], boxShadow: `0 0 5px ${CAT_HEX[i]}80` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.74rem] text-white/75 font-semibold truncate">{cat.title.split('.')[1]?.trim()}</div>
                    <div className="text-[0.68rem] text-white/35">{ptsEarned.toFixed(1)}/{ptsTotal} pts</div>
                  </div>
                  <strong className="text-[0.82rem] flex-shrink-0" style={{ color: vc }}>{s}%</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category detail */}
        <div className="text-[0.75rem] font-bold text-white/35 uppercase tracking-wider mb-3">Detalle por categoría — ítems marcados y fallos</div>
        <div className="space-y-3">
          {CHECKLIST.map(cat => {
            const s = catScores[cat.id] || 0;
            const c = s >= 80 ? "#059669" : s >= 50 ? "#D97706" : "#DC2626";
            const ptsTotal = cat.items.reduce((a, i) => a + i.pts, 0);
            const ptsEarned = cat.items.filter(it => answers[it.id]).reduce((a, it) => a + it.pts, 0);
            const weight = Math.round(ptsTotal / TOTAL_PTS * 100);
            return (
              <div key={cat.id} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                  <span className="text-sm font-semibold text-white/90">{cat.icon} {cat.title}</span>
                  <div className="flex gap-3 items-center">
                    <span className="text-[0.7rem] text-white/40">{cat.items.filter(it => answers[it.id]).length}/{cat.items.length} ítems</span>
                    <span className="text-[0.75rem] text-white/45">{ptsEarned.toFixed(1)}/{ptsTotal} pts</span>
                    <span className="text-[0.7rem] text-white/35">Peso: {weight}%</span>
                    <strong className="text-base" style={{ color: c }}>{s}%</strong>
                  </div>
                </div>
                <div className="h-[7px] bg-white/[0.07] rounded overflow-hidden mb-2">
                  <div className="h-full rounded" style={{ width: `${s}%`, background: c }} />
                </div>
                {cat.items.map(item => {
                  const ok = answers[item.id];
                  return (
                    <div key={item.id} className="flex gap-2 py-1 border-b border-white/[0.04] items-start">
                      <span className="flex-shrink-0 text-sm mt-0.5">{ok ? "✅" : "❌"}</span>
                      <span className={`text-[0.81rem] flex-1 leading-relaxed ${ok ? "text-white/80" : "text-white/40"}`}>{item.text}</span>
                      <span className={`flex-shrink-0 text-[0.72rem] font-bold whitespace-nowrap ${ok ? "text-emerald-400" : "text-red-400"}`}>{item.pts} pts</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiagDetailModal;
