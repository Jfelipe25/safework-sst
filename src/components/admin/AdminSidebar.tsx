import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  active: string;
  onNavigate: (panel: string) => void;
  onLogout: () => void;
  unreadCount?: number;
}

const items = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "diagnosticos", icon: "📋", label: "Diagnósticos" },
  { id: "graficas", icon: "📈", label: "Gráficas" },
  { id: "clientes", icon: "👥", label: "Clientes" },
  { id: "notificaciones", icon: "📨", label: "Notificaciones" },
  { id: "trazabilidad", icon: "📍", label: "Trazabilidad" },
];

const AdminSidebar = ({ active, onNavigate, onLogout, unreadCount = 0 }: Props) => {
  const { signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setDrawerOpen(false);
  };

  const NavItems = () => (
    <>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleNavigate(item.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left font-body ${
            active === item.id ? "text-white bg-primary" : "text-white/50 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <span>{item.icon}</span> {item.label}
          {item.id === "notificaciones" && unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={async () => { await signOut(); onLogout(); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all w-full text-left font-body"
      >
        <span>🚪</span> Salir
      </button>
    </>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <div className="w-[228px] min-w-[228px] bg-white/[0.04] border-r border-white/[0.07] p-4 flex-col gap-1 hidden lg:flex">
        <div className="font-heading text-lg font-bold text-white mb-6 px-2">
          <span className="text-blue-light">JPR</span> - SST <span className="font-body text-sm font-light">Admin</span>
        </div>
        <NavItems />
      </div>

      {/* Topbar móvil */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy border-b border-white/[0.07] flex items-center justify-between px-4 h-14">
        <div className="font-heading text-base font-bold text-white">
          <span className="text-blue-light">JPR</span> - SST <span className="font-body text-xs font-light">Admin</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-white p-2 rounded-lg hover:bg-white/[0.08] transition-all relative"
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#0f1729] border-r border-white/[0.09] p-4 flex flex-col gap-1 transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="font-heading text-lg font-bold text-white">
            <span className="text-blue-light">JPR</span> - SST <span className="font-body text-sm font-light">Admin</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-all"
            aria-label="Cerrar menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <NavItems />
      </div>
    </>
  );
};

export default AdminSidebar;
