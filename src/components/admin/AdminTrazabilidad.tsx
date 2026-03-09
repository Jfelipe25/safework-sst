import { useState, useEffect } from "react";
import { AdminData } from "@/pages/Admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminTrazabilidad = ({ data, onRefresh }: { data: AdminData; onRefresh: () => void }) => {
  const { clients, diagnostics, trazStatuses } = data;
  const [trazData, setTrazData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showNewStatus, setShowNewStatus] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#60A5FA");
  const [detailClient, setDetailClient] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [detailStatus, setDetailStatus] = useState("");

  useEffect(() => { fetchTraz(); }, []);

  // Realtime subscription for trazabilidad
  useEffect(() => {
    const channel = supabase
      .channel('trazabilidad-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trazabilidad' }, () => {
        fetchTraz();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
    const existing = trazData.find(t => t.client_id === clientId);
    if (existing) {
      await supabase.from("trazabilidad").update({ status_id: statusId }).eq("client_id", clientId);
    } else {
      await supabase.from("trazabilidad").insert({ client_id: clientId, status_id: statusId });
    }
    toast.success("Estado actualizado");
    fetchTraz();
  };

  const addNewStatus = async () => {
    if (!newStatusLabel.trim()) return;
    const id = newStatusLabel.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await supabase.from("traz_statuses").insert({ id, label: newStatusLabel.trim(), color: newStatusColor, es_custom: true });
    toast.success("Estado creado");
    setShowNewStatus(false);
    setNewStatusLabel("");
    onRefresh();
  };

  const openDetail = (row: any) => {
    // Re-fetch latest traz data for this client to get fresh comments
    const latestTraz = trazData.find(t => t.client_id === row.client.user_id);
    setDetailClient({ ...row, traz: latestTraz || row.traz });
    setDetailStatus(latestTraz?.status_id || row.traz?.status_id || "sin-diag");
    setComment("");
  };

  const saveDetail = async () => {
    if (!detailClient) return;
    const clientId = detailClient.client.user_id;
    const existing = trazData.find(t => t.client_id === clientId);
    const existingComments = (existing?.comentarios || []) as any[];
    const newComments = comment.trim()
      ? [...existingComments, { text: comment.trim(), date: new Date().toISOString() }]
      : existingComments;

    if (existing) {
      const { error } = await supabase.from("trazabilidad").update({
        status_id: detailStatus,
        comentarios: newComments,
      }).eq("client_id", clientId);
      if (error) {
        toast.error("Error al guardar: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("trazabilidad").insert({
        client_id: clientId,
        status_id: detailStatus,
        comentarios: newComments,
      });
      if (error) {
        toast.error("Error al guardar: " + error.message);
        return;
      }
    }

    toast.success("Guardado");
    setDetailClient(null);
    fetchTraz();
  };

  const exportCSV = () => {
    const headers = ["Cliente", "Empresa", "Estado", "Último diagnóstico", "Puntaje"];
    const rows = filtered.map(r => [
      r.client.nombre, r.client.empresa, r.status?.label || "—",
      r.lastDiag?.fecha || "—", r.lastDiag?.score || "—",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "trazabilidad.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const darkInput = "w-full px-3 py-2 border-[1.5px] border-white/10 rounded-lg bg-white/[0.06] text-white font-body text-sm outline-none focus:border-primary";

  const statusCounts = trazStatuses.map((s: any) => ({
    ...s,
    count: clientRows.filter((r) => (r.traz?.status_id || "sin-diag") === s.id).length,
  })).filter((s: any) => s.count > 0);

  // Get fresh comments for detail modal
  const detailComments = detailClient
    ? ((trazData.find(t => t.client_id === detailClient.client.user_id)?.comentarios || []) as any[])
    : [];

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3 mb-1">
        <h1 className="font-heading text-2xl text-white">📍 Trazabilidad de clientes</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowNewStatus(true)} className="bg-blue-light/15 text-blue-light border border-blue-light/30 rounded-lg px-3 py-1.5 text-xs font-body font-semibold cursor-pointer">
            + Nuevo estado
          </button>
          <button onClick={exportCSV} className="bg-blue-light/10 text-blue-light border border-blue-light/20 rounded-lg px-3 py-1.5 text-xs font-body cursor-pointer">
            ⬇ CSV
          </button>
        </div>
      </div>
      <p className="text-sm text-white/40 mb-4">Gestiona el estado de seguimiento comercial de cada cliente</p>

      {/* Status chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {statusCounts.map((s: any) => (
          <button
            key={s.id}
            onClick={() => setFilterStatus(filterStatus === s.id ? "" : s.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer"
            style={{ background: `${s.color}22`, border: `1px solid ${s.color}55`, color: s.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label} <strong>{s.count}</strong>
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center bg-white/[0.04] rounded-xl p-3 mb-4 border border-white/[0.07]">
        <div className="relative flex-[2] min-w-[170px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none text-sm">🔍</span>
          <input className={`${darkInput} pl-8`} placeholder="Buscar cliente o empresa..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
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
              {["Cliente", "Empresa", "Estado", "Último diagnóstico", "Detalle"].map((h) => (
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
                <td className="px-4 py-3 text-center">
                  <button onClick={() => openDetail({ client: c, traz, status, lastDiag })} className="bg-primary/15 text-blue-light border border-primary/30 rounded-md px-2.5 py-1 text-xs cursor-pointer hover:bg-primary/25">
                    👁 Ver
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New status modal */}
      {showNewStatus && (
        <div className="fixed inset-0 bg-black/70 z-[1002] flex items-center justify-center p-4" onClick={() => setShowNewStatus(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-[400px] w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowNewStatus(false)} className="absolute top-4 right-4 text-gray-400 text-xl cursor-pointer bg-transparent border-none">✕</button>
            <h3 className="text-lg font-bold text-navy mb-5">Agregar estado personalizado</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del estado</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Ej: En propuesta" value={newStatusLabel} onChange={e => setNewStatusLabel(e.target.value)} />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Color</label>
              <input type="color" className="w-12 h-10 border-none cursor-pointer" value={newStatusColor} onChange={e => setNewStatusColor(e.target.value)} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNewStatus(false)} className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm cursor-pointer border-none">Cancelar</button>
              <button onClick={addNewStatus} className="bg-primary text-white rounded-lg px-4 py-2 text-sm cursor-pointer border-none">Crear estado</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailClient && (
        <div className="fixed inset-0 bg-black/75 z-[1001] flex items-center justify-center p-4" onClick={() => setDetailClient(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-navy to-corp rounded-t-2xl px-7 py-5 relative">
              <button onClick={() => setDetailClient(null)} className="absolute top-4 right-4 bg-white/15 border-none text-white rounded-full w-7 h-7 cursor-pointer text-sm flex items-center justify-center">✕</button>
              <div className="text-base font-bold text-white">{detailClient.client.nombre}</div>
              <div className="text-sm text-white/60">{detailClient.client.empresa}</div>
            </div>
            <div className="p-7">
              {/* Client info */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  ["📞 Teléfono", detailClient.client.telefono || "—"],
                  ["📍 Ciudad", detailClient.client.ciudad || "—"],
                  ["⚠️ Riesgo", detailClient.client.riesgo || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-sm text-navy mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              {/* Last diagnostic */}
              {detailClient.lastDiag && (
                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Último diagnóstico</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{detailClient.lastDiag.fecha}</span>
                    <span className="font-bold text-primary">{detailClient.lastDiag.score}%</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      detailClient.lastDiag.level === "high" ? "bg-green-100 text-green-700" : detailClient.lastDiag.level === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>{detailClient.lastDiag.level === "high" ? "Alto" : detailClient.lastDiag.level === "medium" ? "Medio" : "Bajo"}</span>
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Estado de seguimiento</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={detailStatus} onChange={e => setDetailStatus(e.target.value)}>
                  {trazStatuses.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* Add comment */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Agregar nota / comentario</label>
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y" rows={3}
                  placeholder="Próximos pasos, observaciones, fechas de reunión..."
                  value={comment} onChange={e => setComment(e.target.value)} />
              </div>

              {/* Comment history */}
              {detailComments.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Historial de notas</div>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {([...detailComments]).reverse().map((c: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">{new Date(c.date).toLocaleDateString("es-CO")}</div>
                        <div className="text-sm text-gray-700">{c.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button onClick={() => setDetailClient(null)} className="bg-gray-100 text-gray-600 rounded-lg px-4 py-1.5 text-sm cursor-pointer border-none">Cerrar</button>
                <button onClick={saveDetail} className="bg-primary text-white rounded-lg px-4 py-1.5 text-sm cursor-pointer border-none">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrazabilidad;
