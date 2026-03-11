import { useState } from "react";
import { AdminData } from "@/pages/Admin";
import { RISK_LEVELS } from "@/data/constants";

const AdminClientes = ({ data }: { data: AdminData }) => {
  const { clients, diagnostics } = data;
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterRiesgo, setFilterRiesgo] = useState("");
  const [filterCiudad, setFilterCiudad] = useState("");
  const [detailClient, setDetailClient] = useState<any>(null);

  const sectors = [...new Set(clients.map((c) => c.sector).filter(Boolean))].sort();
  const ciudades = [...new Set(clients.map((c) => c.ciudad).filter(Boolean))].sort();

  const filtered = clients.filter((c) => {
    const hay = [c.nombre, c.empresa, c.nit, c.ciudad, c.telefono].join(" ").toLowerCase();
    if (search && !hay.includes(search.toLowerCase())) return false;
    if (filterSector && c.sector !== filterSector) return false;
    if (filterRiesgo && c.riesgo !== filterRiesgo) return false;
    if (filterCiudad && c.ciudad !== filterCiudad) return false;
    return true;
  });

  const downloadCSV = () => {
    const headers = ["Nombre", "Empresa", "Sector", "Ciudad", "Riesgo", "Trabajadores", "Teléfono", "NIT"];
    const rows = filtered.map((c) => [c.nombre, c.empresa, c.sector || "", c.ciudad || "", c.riesgo || "", c.trabajadores || "", c.telefono || "", c.nit || ""]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "clientes.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const darkInput = "w-full px-3 py-2 border-[1.5px] border-white/10 rounded-lg bg-white/[0.06] text-white font-body text-sm outline-none focus:border-primary";

  const clientDiags = detailClient ? diagnostics.filter(d => d.user_id === detailClient.user_id).sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
        <h1 className="font-heading text-2xl text-white">Base de clientes</h1>
        <button onClick={downloadCSV} className="bg-primary/20 text-blue-light border border-primary/30 rounded-lg px-3 py-1.5 text-xs font-body cursor-pointer whitespace-nowrap">
          ⬇ Descargar CSV
        </button>
      </div>
      <p className="text-sm text-white/40 mb-4">Busca y filtra por cualquier campo</p>

      <div className="flex gap-3 flex-wrap items-center bg-white/[0.04] rounded-xl p-3 mb-4 border border-white/[0.07]">
        <div className="relative flex-[2] min-w-[200px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none text-sm">🔍</span>
          <input className={`${darkInput} pl-8`} placeholder="Nombre, empresa, correo, NIT..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${darkInput} flex-1 min-w-[120px]`} value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
          <option value="">Todos los sectores</option>
          {sectors.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={`${darkInput} flex-1 min-w-[120px]`} value={filterRiesgo} onChange={(e) => setFilterRiesgo(e.target.value)}>
          <option value="">Todos los riesgos</option>
          {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select className={`${darkInput} flex-1 min-w-[120px]`} value={filterCiudad} onChange={(e) => setFilterCiudad(e.target.value)}>
          <option value="">Todas las ciudades</option>
          {ciudades.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span className="text-xs text-white/30 whitespace-nowrap">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="bg-white/[0.06]">
              {["Nombre", "Empresa", "Sector", "Ciudad", "Riesgo", "Detalle"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-white/[0.04] hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-white/90">{c.nombre}</div>
                  <div className="text-xs text-white/40">{c.telefono || "—"}</div>
                </td>
                <td className="px-4 py-3 text-sm text-white/70">{c.empresa || "—"}</td>
                <td className="px-4 py-3 text-sm text-white/70">{c.sector || "—"}</td>
                <td className="px-4 py-3 text-sm text-white/70">{c.ciudad || "—"}</td>
                <td className="px-4 py-3 text-sm text-white/70">{c.riesgo || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => setDetailClient(c)} className="bg-primary/15 text-blue-light border border-primary/30 rounded-md px-2.5 py-1 text-xs cursor-pointer hover:bg-primary/25">
                    👁 Ver
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Detail modal */}
      {detailClient && (
        <div className="fixed inset-0 bg-black/75 z-[1001] flex items-center justify-center p-4" onClick={() => setDetailClient(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[540px] max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-navy to-corp rounded-t-2xl px-7 py-5 relative">
              <button onClick={() => setDetailClient(null)} className="absolute top-4 right-4 bg-white/15 border-none text-white rounded-full w-7 h-7 cursor-pointer text-sm flex items-center justify-center">✕</button>
              <div className="text-base font-bold text-white">{detailClient.nombre}</div>
              <div className="text-sm text-white/60">{detailClient.empresa}</div>
            </div>
            <div className="p-7">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información de contacto</div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  ["📧 Correo", detailClient.email || "—"],
                  ["📞 Teléfono", detailClient.telefono || "—"],
                  ["📍 Ciudad", detailClient.ciudad || "—"],
                  ["💼 Cargo", detailClient.cargo || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-sm text-navy mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información de la empresa</div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  ["NIT", detailClient.nit || "—"],
                  ["Sector", detailClient.sector || "—"],
                  ["Riesgo", detailClient.riesgo || "—"],
                  ["ARL", detailClient.arl || "—"],
                  ["Trabajadores", detailClient.trabajadores || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-sm text-navy mt-0.5">{String(value)}</div>
                  </div>
                ))}
              </div>
              {clientDiags.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Diagnósticos</div>
                  <div className="flex flex-col gap-2">
                    {clientDiags.map(d => {
                      const lvlCls = d.level === "high" ? "bg-green-100 text-green-700" : d.level === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
                      return (
                        <div key={d.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-xs text-gray-500">{d.fecha}</span>
                          <span className="text-sm font-bold text-primary">{d.score}%</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${lvlCls}`}>
                            {d.level === "high" ? "Alto" : d.level === "medium" ? "Medio" : "Bajo"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
                <button onClick={() => setDetailClient(null)} className="bg-gray-100 text-gray-600 border-none rounded-lg px-4 py-1.5 text-sm cursor-pointer">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientes;
