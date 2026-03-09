import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminDiagnosticos from "@/components/admin/AdminDiagnosticos";
import AdminGraficas from "@/components/admin/AdminGraficas";
import AdminClientes from "@/components/admin/AdminClientes";
import AdminTrazabilidad from "@/components/admin/AdminTrazabilidad";
import AdminNotificaciones from "@/components/admin/AdminNotificaciones";

export interface AdminData {
  clients: any[];
  diagnostics: any[];
  solicitudes: any[];
  trazStatuses: any[];
}

const Admin = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState("dashboard");
  const [data, setData] = useState<AdminData>({ clients: [], diagnostics: [], solicitudes: [], trazStatuses: [] });

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) navigate("/");
  }, [user, role, loading]);

  useEffect(() => {
    if (user && role === "admin") fetchAll();
  }, [user, role]);

  const fetchAll = async () => {
    const [profiles, diags, sols, statuses] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("diagnostics").select("*").order("fecha", { ascending: false }),
      supabase.from("solicitudes").select("*").order("created_at", { ascending: false }),
      supabase.from("traz_statuses").select("*"),
    ]);
    setData({
      clients: profiles.data || [],
      diagnostics: diags.data || [],
      solicitudes: sols.data || [],
      trazStatuses: statuses.data || [],
    });
  };

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-light border-t-transparent rounded-full" /></div>;

  const panels: Record<string, React.ReactNode> = {
    dashboard: <AdminDashboard data={data} />,
    diagnosticos: <AdminDiagnosticos data={data} onRefresh={fetchAll} />,
    graficas: <AdminGraficas data={data} />,
    clientes: <AdminClientes data={data} />,
    trazabilidad: <AdminTrazabilidad data={data} onRefresh={fetchAll} />,
    notificaciones: <AdminNotificaciones data={data} onRefresh={fetchAll} />,
  };

  return (
    <div className="min-h-screen bg-navy flex">
      <AdminSidebar active={activePanel} onNavigate={setActivePanel} onLogout={() => { navigate("/"); }} unreadCount={data.solicitudes.filter(s => !s.leida).length} />
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto max-h-screen">
        {panels[activePanel]}
      </div>
    </div>
  );
};

export default Admin;
