import { useState, useEffect } from "react";
import { AdminData } from "@/pages/Admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminTrazabilidad = ({ data, onRefresh }: { data: AdminData; onRefresh: () => void }) => {
  const { clients, diagnostics, trazStatuses } = data;
  const [trazData, setTrazData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchTraz();
  }, []);

  const fetchTraz = async () => {
    const { data: rows } = await supabase.from("trazabilidad").select("*");
    setTrazData(rows || []);
  };

  const clientRows = clients.map((c) => {
    const traz = trazData.find((t) => t.client_id === c.user_id);
    const status = trazStatuses.find((s: any) => s.id === (traz?.status_id || "sin-diag"));
    const lastDiag = diagnostics.filter((d) => d.user_id === c.user_id).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    return { client: c, traz, status, lastDiag };
  });

  const filtered = clientRows.filter((r) => {
    const hay = [r.client.nombre, r.client.empresa].join(" ").toLowerCase();
    if (search && !hay.includes(search.toLowerCase())) return false;
    if (filterStatus && (r.traz?.status_id || "sin-diag") !== filterStatus) return false;
    return true;
  });

  const updateStatus = async (clientId: string, statusId: string) => {
    await supabase.from("trazabilidad").upsert({ client_id: clientId, status_id: statusId }, { onConflict: "client_id" });
    toast.success("Estado actualizado");
    fetchTraz();
  };

  const darkInput = "w-full px-3 py-2 border-[1.5px] border-white/10 rounded-lg bg-white/[0.06] text-white font-body text-sm outline-none focus:border-primary";

  // Status chips with counts
  const statusCounts = trazStatuses.map((s: any) => ({
    ...s,
    count: clientRows.filter((r) => (r.traz?.status_id || "sin-diag") === s.id).length,
  })).filter((s: any) => s.count > 0);

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-1">📍 Trazabilidad de clientes</h1>
      <p className="text-sm text-white/40 mb-4">Gestiona el estado de seguimiento comercial</p>

      {/* Status chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {statusCounts.map((s: any) => (
          <button
            key={s.id}
            onClick={() => setFilterStatus(filterStatus === s.id ? "" : s.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: `${s.color}22`,
              border: `1px solid ${s.color}55`,
              color: s.color,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label} <strong>{s.count}</strong>
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center bg-white/[0.04] rounded-xl p-3 mb-4 border border-white/[0.07]">
        <input className={`${darkInput} flex-[2] min-w-[170px]`} placeholder="Buscar cliente o empresa..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${darkInput} flex-1 min-w-[150px]`} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {trazStatuses.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <span className="text-xs text-white/30 whitespace-nowrap">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.06]">
              {["Cliente", "Empresa", "Estado", "Último diagnóstico", "Cambiar estado"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ client: c, traz, status, lastDiag }) => (
              <tr key={c.id} className="border-t border-white/[0.04] hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-white/90">{c.nombre}</div>
                  <div className="text-xs text-white/40">{c.telefono || "—"}</div>
                </td>
                <td className="px-4 py-3 text-sm text-white/70">{c.empresa || "—"}</td>
                <td className="px-4 py-3">
                  {status && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ background: `${status.color}22`, border: `1px solid ${status.color}66`, color: status.color }}>
                      <span className="w-[7px] h-[7px] rounded-full inline-block" style={{ background: status.color }} />
                      {status.label}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lastDiag ? (
                    <div>
                      <div className="text-xs text-white/70">{lastDiag.fecha}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="text-blue-light text-sm">{lastDiag.score} pts</strong>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          lastDiag.level === "high" ? "bg-success/10 text-success" : lastDiag.level === "medium" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                        }`}>{lastDiag.level === "high" ? "Alto" : lastDiag.level === "medium" ? "Medio" : "Bajo"}</span>
                      </div>
                    </div>
                  ) : <span className="text-xs text-white/25">Sin diagnóstico</span>}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-body outline-none"
                    value={traz?.status_id || "sin-diag"}
                    onChange={(e) => updateStatus(c.user_id, e.target.value)}
                  >
                    {trazStatuses.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTrazabilidad;
