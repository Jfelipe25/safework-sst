import { useState } from "react";
import { AdminData } from "@/pages/Admin";
import { CHECKLIST } from "@/data/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TOTAL_PTS = CHECKLIST.reduce((s, cat) => s + cat.items.reduce((ss, it) => ss + it.pts, 0), 0);

const AdminDiagnosticos = ({ data, onRefresh }: { data: AdminData; onRefresh: () => void }) => {
  const { diagnostics, clients } = data;
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterScore, setFilterScore] = useState("");
  const [detailDiag, setDetailDiag] = useState<any>(null);
  const [detailClient, setDetailClient] = useState<any>(null);

  const filtered = diagnostics.filter((d) => {
    const c = clients.find((cl) => cl.user_id === d.user_id);
    const hay = [c?.nombre, c?.empresa, c?.ciudad].join(" ").toLowerCase();
    if (search && !hay.includes(search.toLowerCase())) return false;
    if (filterLevel && d.level !== filterLevel) return false;
    if (filterScore) {
      if (filterScore === "0-49" && d.score >= 50) return false;
      else if (filterScore !== "0-49" && d.score < parseInt(filterScore)) return false;
    }
    return true;
  });

  const deleteDiag = async (id: string) => {
    if (!confirm("¿Eliminar este diagnóstico?")) return;
    await supabase.from("diagnostics").delete().eq("id", id);
    toast.success("Diagnóstico eliminado");
    onRefresh();
  };

  const openDetail = (d: any) => {
    const c = clients.find((cl) => cl.user_id === d.user_id);
    setDetailDiag(d);
    setDetailClient(c || null);
  };

  const downloadCSV = () => {
    const headers = ["Fecha", "Cliente", "Empresa", "Ciudad", "Puntaje", "Nivel"];
    const rows = filtered.map((d) => {
      const c = clients.find((cl) => cl.user_id === d.user_id);
      const lvl = d.level === "high" ? "Alto" : d.level === "medium" ? "Medio" : "Bajo";
      return [d.fecha, c?.nombre || "—", c?.empresa || "—", c?.ciudad || "—", d.score, lvl];
    });
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "diagnosticos.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDiagHTML = () => {
    if (!detailDiag || !detailClient) return;
    const d = detailDiag;
    const u = detailClient;
    const catScores = (d.cat_scores as any) || {};
    const answers = (d.answers as any) || {};
    const color = d.level === "high" ? "#059669" : d.level === "medium" ? "#D97706" : "#DC2626";
    const lvlTxt = d.level === "high" ? "Alto" : d.level === "medium" ? "Medio" : "Bajo";

    const catRows = CHECKLIST.map(cat => {
      const s = catScores[cat.id] || 0;
      const c = s >= 80 ? "#059669" : s >= 50 ? "#D97706" : "#DC2626";
      const ptsTotal = cat.items.reduce((a, i) => a + i.pts, 0);
      const ptsEarned = cat.items.filter(it => answers[it.id]).reduce((a, it) => a + it.pts, 0);
      const rows = cat.items.map(item => {
        const ok = answers[item.id];
        return `<tr style="border-bottom:1px solid #f3f4f6">
          <td style="padding:5px 8px;font-size:10.5px;color:#374151">${item.text}</td>
          <td style="padding:5px 8px;font-size:11px;text-align:center;color:${ok ? '#059669' : '#DC2626'};font-weight:700">${ok ? '✓' : '✗'}</td>
          <td style="padding:5px 8px;font-size:10px;text-align:center;color:#6b7280">${item.pts} pts</td>
        </tr>`;
      }).join('');
      return `<div style="margin-bottom:14px;break-inside:avoid">
        <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:7px 12px;border-radius:5px;border-left:4px solid ${c};margin-bottom:4px">
          <span style="font-size:12px;font-weight:700;color:#0A2540">${cat.icon} ${cat.title}</span>
          <div><span style="font-size:12px;font-weight:700;color:${c}">${s}%</span>
          <span style="font-size:9px;color:#9ca3af;margin-left:8px">${ptsEarned.toFixed(1)}/${ptsTotal} pts</span></div>
        </div>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Diagnóstico SST — ${u?.empresa || ''}</title>
    <style>body{font-family:Arial,sans-serif;margin:0;color:#0A2540}@page{size:A4;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
    </head><body>
    <div style="background:linear-gradient(135deg,#0A2540,#1E3A8A);color:white;padding:26px 36px">
      <h1 style="margin:0;font-size:19px">${u?.empresa || ''} — Diagnóstico SG-SST</h1>
      <p style="margin:5px 0 0;opacity:0.75;font-size:11px">${u?.nombre || ''} · ${d.fecha} · SafeWork SST</p>
    </div>
    <div style="padding:24px 36px">
      <div style="text-align:center;margin-bottom:18px">
        <div style="display:inline-block;width:90px;height:90px;border-radius:50%;border:6px solid ${color};padding-top:13px">
          <div style="font-size:28px;font-weight:700;color:${color}">${d.score}</div>
          <div style="font-size:9px;color:#6b7280">/ 100 pts</div>
          <div style="font-size:9px;font-weight:700;color:${color}">Nivel ${lvlTxt}</div>
        </div>
      </div>
      <h3 style="font-size:13px;font-weight:700;border-bottom:2px solid #1E3A8A;padding-bottom:5px;margin-bottom:12px">Detalle por categoría</h3>
      ${catRows}
      <div style="margin-top:20px;padding:11px 14px;background:#eff6ff;border-radius:6px;border-left:4px solid #3B82F6;font-size:10px;color:#1E3A8A">
        Informe generado por <strong>SafeWork SST Consultoría</strong> · ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const winUrl = URL.createObjectURL(blob);
    const win = window.open(winUrl, '_blank', 'width=1000,height=780');
    if (win) { win.onload = () => setTimeout(() => win.print(), 400); }
    else { toast.error('Permite ventanas emergentes para descargar el PDF'); }
  };

  const darkInput = "w-full px-3 py-2 border-[1.5px] border-white/10 rounded-lg bg-white/[0.06] text-white font-body text-sm outline-none focus:border-primary";

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
        <h1 className="font-heading text-2xl text-white">Diagnósticos realizados</h1>
        <button onClick={downloadCSV} className="bg-primary/20 text-blue-light border border-primary/30 rounded-lg px-3 py-1.5 text-xs font-body cursor-pointer whitespace-nowrap">
          ⬇ Descargar CSV
        </button>
      </div>
      <p className="text-sm text-white/40 mb-4">Filtra, consulta el detalle completo y descarga</p>

      <div className="flex gap-3 flex-wrap items-center bg-white/[0.04] rounded-xl p-3 mb-4 border border-white/[0.07]">
        <div className="relative flex-[2] min-w-[200px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none text-sm">🔍</span>
          <input className={`${darkInput} pl-8`} placeholder="Buscar cliente, empresa, ciudad..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${darkInput} flex-1 min-w-[130px]`} value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
          <option value="">Todos los niveles</option>
          <option value="high">🟢 Alto</option>
          <option value="medium">🟡 Medio</option>
          <option value="low">🔴 Bajo</option>
        </select>
        <select className={`${darkInput} flex-1 min-w-[140px]`} value={filterScore} onChange={(e) => setFilterScore(e.target.value)}>
          <option value="">Cualquier puntaje</option>
          <option value="80">≥ 80%</option>
          <option value="60">≥ 60%</option>
          <option value="50">≥ 50%</option>
          <option value="0-49">0 – 49%</option>
        </select>
        <span className="text-xs text-white/30 whitespace-nowrap">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.06]">
              {["#", "Fecha", "Cliente", "Empresa", "Ciudad", "Puntaje", "Nivel", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const c = clients.find((cl) => cl.user_id === d.user_id);
              const lvlCls = d.level === "high" ? "bg-success/10 text-success" : d.level === "medium" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger";
              const lvlTxt = d.level === "high" ? "Alto" : d.level === "medium" ? "Medio" : "Bajo";
              return (
                <tr key={d.id} className="border-t border-white/[0.04] hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-sm text-white/30">{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{d.fecha}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{c?.nombre || "—"}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{c?.empresa || "—"}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{c?.ciudad || "—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-light">{d.score}%</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${lvlCls}`}>{lvlTxt}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openDetail(d)} className="bg-primary/20 text-blue-light border-none rounded-md px-2.5 py-1 text-xs cursor-pointer hover:bg-primary/30 whitespace-nowrap">🔍 Ver</button>
                    <button onClick={() => deleteDiag(d.id)} className="bg-danger/15 text-danger/80 border-none rounded-md px-2.5 py-1 text-xs cursor-pointer hover:bg-danger/25">🗑</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30 text-sm">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailDiag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetailDiag(null)}>
          <div className="bg-navy border border-white/10 rounded-2xl w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDetailDiag(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white/60 text-sm flex items-center justify-center cursor-pointer border-none hover:bg-white/20">✕</button>

            {/* Header */}
            <h2 className="font-heading text-xl text-white mb-0.5">{detailClient?.empresa || "Diagnóstico"}</h2>
            <p className="text-xs text-white/45 mb-4">
              {detailClient?.nombre} · {detailDiag.fecha} · Nivel {detailDiag.level === "high" ? "Alto" : detailDiag.level === "medium" ? "Medio" : "Bajo"} · {detailDiag.score} / 100 pts
            </p>

            {/* Score ring */}
            <div className="flex justify-center mb-5">
              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                style={{ border: `5px solid ${detailDiag.level === "high" ? "#059669" : detailDiag.level === "medium" ? "#D97706" : "#DC2626"}` }}
              >
                <span className="text-3xl font-bold" style={{ color: detailDiag.level === "high" ? "#059669" : detailDiag.level === "medium" ? "#D97706" : "#DC2626" }}>
                  {detailDiag.score}
                </span>
                <span className="text-[0.6rem] text-white/50">/ 100 pts</span>
              </div>
            </div>

            {/* Meta info */}
            <div className="text-xs text-white/45 text-center mb-5">
              Empresa: <strong className="text-white">{detailClient?.empresa || "—"}</strong> · Sector: <strong className="text-white">{detailClient?.sector || "—"}</strong> · Trabajadores: <strong className="text-white">{detailClient?.trabajadores || "—"}</strong>
              <br />
              Riesgo: <strong className="text-white">{detailClient?.riesgo || "—"}</strong> · ARL: <strong className="text-white">{detailClient?.arl || "—"}</strong> · Ciudad: <strong className="text-white">{detailClient?.ciudad || "—"}</strong>
            </div>

            {/* Category breakdown */}
            <div className="space-y-3 mb-5">
              {CHECKLIST.map(cat => {
                const catScores = (detailDiag.cat_scores as any) || {};
                const answers = (detailDiag.answers as any) || {};
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

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button onClick={downloadDiagHTML} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-body cursor-pointer border-none">
                📄 Descargar informe
              </button>
              <button onClick={() => setDetailDiag(null)} className="bg-white/10 text-white/70 rounded-lg px-4 py-2 text-sm font-body cursor-pointer border-none">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiagnosticos;
