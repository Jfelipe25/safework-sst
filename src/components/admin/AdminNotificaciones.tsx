import { AdminData } from "@/pages/Admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminNotificaciones = ({ data, onRefresh }: { data: AdminData; onRefresh: () => void }) => {
  const { solicitudes, clients } = data;

  const markRead = async (id: string) => {
    await supabase.from("solicitudes").update({ leida: true }).eq("id", id);
    onRefresh();
  };

  const markAllRead = async () => {
    const unread = solicitudes.filter((s) => !s.leida);
    for (const s of unread) {
      await supabase.from("solicitudes").update({ leida: true }).eq("id", s.id);
    }
    toast.success("Todas marcadas como leídas");
    onRefresh();
  };

  const unreadCount = solicitudes.filter((s) => !s.leida).length;

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-1">📨 Notificaciones</h1>
      <p className="text-sm text-white/40 mb-6">Solicitudes de contacto de clientes</p>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">📩 Solicitudes de contacto {unreadCount > 0 && <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full ml-2">{unreadCount} nueva{unreadCount > 1 ? "s" : ""}</span>}</h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="bg-blue-light/15 text-blue-light border border-blue-light/30 rounded-lg px-3 py-1 text-xs font-body cursor-pointer">
            ✓ Marcar todas leídas
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {solicitudes.length === 0 ? (
          <p className="text-sm text-white/30 italic py-8 text-center">Sin solicitudes aún</p>
        ) : solicitudes.map((s) => {
          const client = clients.find((c) => c.user_id === s.client_id);
          return (
            <div key={s.id} className={`rounded-xl p-5 relative border ${s.leida ? "bg-white/[0.03] border-white/[0.07]" : "bg-blue-light/[0.08] border-blue-light/30"}`}>
              {!s.leida && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />}
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <div className="font-bold text-white text-sm">{client?.nombre || "—"}</div>
                  <div className="text-xs text-white/45 mt-0.5">{client?.empresa} · {client?.telefono || "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {s.score != null && (
                    <span className="text-xs font-bold" style={{ color: s.nivel === "high" ? "#34D399" : s.nivel === "medium" ? "#FBBF24" : "#F87171" }}>
                      {s.score} pts ({s.nivel === "high" ? "Alto" : s.nivel === "medium" ? "Medio" : "Bajo"})
                    </span>
                  )}
                  <button onClick={() => markRead(s.id)} className="bg-white/[0.07] text-white/50 border-none rounded-md px-2 py-0.5 text-xs cursor-pointer">
                    {s.leida ? "✓ Leída" : "Marcar leída"}
                  </button>
                </div>
              </div>
              <div className="bg-white/[0.05] rounded-lg p-3 text-sm text-white/75 leading-relaxed mb-2">
                "{s.mensaje}"
              </div>
              <div className="flex gap-4 text-xs text-white/35">
                <span>🕐 {new Date(s.created_at).toLocaleDateString("es-CO")}</span>
                {s.disponibilidad && <span>📅 Disponibilidad: <strong className="text-white/55">{s.disponibilidad}</strong></span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminNotificaciones;
