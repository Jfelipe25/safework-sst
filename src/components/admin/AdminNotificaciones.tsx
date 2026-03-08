import { useState } from "react";
import { AdminData } from "@/pages/Admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEMPLATES: Record<string, { asunto: string; mensaje: string }> = {
  recordatorio: {
    asunto: "Recordatorio: Complete su diagnóstico SST",
    mensaje: "Estimado/a {nombre},\n\nLe recordamos que puede realizar o actualizar su diagnóstico de Seguridad y Salud en el Trabajo en nuestra plataforma.\n\nMantener su SG-SST actualizado es fundamental para el cumplimiento legal y la protección de sus trabajadores.\n\nQuedamos atentos.\nSafeWork SST",
  },
  propuesta: {
    asunto: "Propuesta de servicio SST personalizada",
    mensaje: "Estimado/a {nombre},\n\nBasándonos en los resultados de su diagnóstico, hemos preparado una propuesta de servicio personalizada para {empresa}.\n\nNuestra propuesta incluye:\n• Implementación del SG-SST\n• Capacitaciones para su equipo\n• Acompañamiento y seguimiento continuo\n\n¿Le gustaría agendar una reunión para revisarla juntos?\n\nSafeWork SST",
  },
  seguimiento: {
    asunto: "Seguimiento de implementación SG-SST",
    mensaje: "Estimado/a {nombre},\n\nQueremos hacer seguimiento al proceso de implementación del SG-SST en {empresa}.\n\n¿Cómo van los avances? ¿Hay algún punto en el que podamos apoyarles?\n\nEstamos a su disposición.\nSafeWork SST",
  },
  capacitacion: {
    asunto: "Invitación a capacitación SST",
    mensaje: "Estimado/a {nombre},\n\nLe invitamos a participar en nuestra próxima capacitación en Seguridad y Salud en el Trabajo.\n\nTemas:\n• Identificación de peligros y valoración de riesgos\n• Plan de emergencias\n• Uso correcto de EPP\n\nFecha y hora por confirmar.\n\nSafeWork SST",
  },
  personalizado: { asunto: "", mensaje: "" },
};

const AdminNotificaciones = ({ data, onRefresh }: { data: AdminData; onRefresh: () => void }) => {
  const { solicitudes, clients } = data;
  const [selectedClient, setSelectedClient] = useState("");
  const [tipo, setTipo] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  const loadTemplate = (tipoKey: string) => {
    setTipo(tipoKey);
    const tpl = TEMPLATES[tipoKey];
    if (!tpl) return;
    const client = clients.find(c => c.user_id === selectedClient);
    const nombre = client?.nombre || "{nombre}";
    const empresa = client?.empresa || "{empresa}";
    setAsunto(tpl.asunto.replace("{nombre}", nombre).replace("{empresa}", empresa));
    setMensaje(tpl.mensaje.replace(/{nombre}/g, nombre).replace(/{empresa}/g, empresa));
  };

  const sendNotification = () => {
    if (!selectedClient || !asunto.trim() || !mensaje.trim()) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    const client = clients.find(c => c.user_id === selectedClient);
    toast.success(`Notificación enviada a ${client?.nombre || "cliente"}`);
    setSelectedClient("");
    setTipo("");
    setAsunto("");
    setMensaje("");
  };

  const unreadCount = solicitudes.filter((s) => !s.leida).length;
  const darkInput = "w-full px-3 py-2 border-[1.5px] border-white/10 rounded-lg bg-white/[0.06] text-white font-body text-sm outline-none focus:border-primary";
  const darkLabel = "block text-xs font-semibold text-white/50 mb-1";

  return (
    <div>
      <h1 className="font-heading text-2xl text-white mb-1">Enviar notificaciones</h1>
      <p className="text-sm text-white/40 mb-6">Envía mensajes personalizados a clientes por correo electrónico</p>

      {/* Notification form */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6 mb-8">
        <div className="mb-4">
          <label className={darkLabel}>Destinatario *</label>
          <select className={darkInput} value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
            <option value="">— Selecciona un cliente —</option>
            {clients.map(c => <option key={c.user_id} value={c.user_id}>{c.nombre} — {c.empresa}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className={darkLabel}>Tipo de notificación</label>
          <select className={darkInput} value={tipo} onChange={e => loadTemplate(e.target.value)}>
            <option value="">— Tipo —</option>
            <option value="recordatorio">📅 Recordatorio de diagnóstico</option>
            <option value="propuesta">📋 Propuesta de servicio</option>
            <option value="seguimiento">🔄 Seguimiento de implementación</option>
            <option value="capacitacion">🎓 Invitación a capacitación</option>
            <option value="personalizado">✏️ Mensaje personalizado</option>
          </select>
        </div>
        <div className="mb-4">
          <label className={darkLabel}>Asunto del correo *</label>
          <input className={darkInput} placeholder="Asunto del mensaje" value={asunto} onChange={e => setAsunto(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className={darkLabel}>Mensaje *</label>
          <textarea className={`${darkInput} h-32 resize-y`} placeholder="Redacta tu mensaje aquí..." value={mensaje} onChange={e => setMensaje(e.target.value)} />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={sendNotification} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-body cursor-pointer border-none">
            📨 Enviar por correo
          </button>
        </div>
      </div>

      {/* Solicitudes */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          📩 Solicitudes de contacto
          {unreadCount > 0 && <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full ml-2">{unreadCount} nueva{unreadCount > 1 ? "s" : ""}</span>}
        </h3>
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
              <div className="bg-white/[0.05] rounded-lg p-3 text-sm text-white/75 leading-relaxed mb-2 whitespace-pre-line">
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
