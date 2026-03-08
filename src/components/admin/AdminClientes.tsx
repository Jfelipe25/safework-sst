import { useState } from "react";
import { AdminData } from "@/pages/Admin";

const AdminClientes = ({ data }: { data: AdminData }) => {
  const { clients } = data;
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("");

  const filtered = clients.filter((c) => {
    const hay = [c.nombre, c.empresa, c.correo, c.nit, c.ciudad].join(" ").toLowerCase();
    if (search && !hay.includes(search.toLowerCase())) return false;
    if (filterSector && c.sector !== filterSector) return false;
    return true;
  });

  const darkInput = "w-full px-3 py-2 border-[1.5px] border-white/10 rounded-lg bg-white/[0.06] text-white font-body text-sm outline-none focus:border-primary";
  const sectors = [...new Set(clients.map((c) => c.sector).filter(Boolean))].sort();

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-1">Base de clientes</h1>
      <p className="text-sm text-white/40 mb-4">Busca y filtra por cualquier campo</p>

      <div className="flex gap-3 flex-wrap items-center bg-white/[0.04] rounded-xl p-3 mb-4 border border-white/[0.07]">
        <input className={`${darkInput} flex-[2] min-w-[200px]`} placeholder="Nombre, empresa, correo..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${darkInput} flex-1 min-w-[120px]`} value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
          <option value="">Todos los sectores</option>
          {sectors.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-white/30 whitespace-nowrap">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.06]">
              {["Nombre", "Empresa", "Sector", "Ciudad", "Riesgo", "Trabajadores"].map((h) => (
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
                <td className="px-4 py-3 text-sm text-white/70">{c.trabajadores || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminClientes;
