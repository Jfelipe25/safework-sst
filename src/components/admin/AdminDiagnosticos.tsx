import { useState } from "react";
import { AdminData } from "@/pages/Admin";
import { CHECKLIST } from "@/data/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DiagDetailModal from "./DiagDetailModal";
import { downloadDiagHTML } from "./diagPdfGenerator";

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
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
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
      </div>

      {detailDiag && (
        <DiagDetailModal
          diag={detailDiag}
          client={detailClient}
          onClose={() => setDetailDiag(null)}
          onDownload={() => downloadDiagHTML(detailDiag, detailClient)}
        />
      )}
    </div>
  );
};

export default AdminDiagnosticos;
