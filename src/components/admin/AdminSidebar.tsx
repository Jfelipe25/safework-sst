import { useAuth } from "@/contexts/AuthContext";

interface Props {
  active: string;
  onNavigate: (panel: string) => void;
  onLogout: () => void;
}

const items = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "diagnosticos", icon: "📋", label: "Diagnósticos" },
  { id: "clientes", icon: "👥", label: "Clientes" },
  { id: "trazabilidad", icon: "📍", label: "Trazabilidad" },
  { id: "notificaciones", icon: "📨", label: "Notificaciones" },
];

const AdminSidebar = ({ active, onNavigate, onLogout }: Props) => {
  const { signOut } = useAuth();

  return (
    <div className="w-[228px] min-w-[228px] bg-white/[0.04] border-r border-white/[0.07] p-4 flex flex-col gap-1 hidden lg:flex">
      <div className="font-heading text-lg font-bold text-white mb-6 px-2">
        Safe<span className="text-blue-light">Work</span> <span className="font-body text-sm font-light">Admin</span>
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left font-body ${
            active === item.id ? "text-white bg-primary" : "text-white/50 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <span>{item.icon}</span> {item.label}
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={async () => { await signOut(); onLogout(); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all w-full text-left font-body"
      >
        <span>🚪</span> Salir
      </button>
    </div>
  );
};

export default AdminSidebar;
