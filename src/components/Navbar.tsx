import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModals from "@/components/AuthModals";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, profile, signOut } = useAuth();

  const scrollToServices = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[66px] bg-white/95 backdrop-blur-md border-b border-border shadow-soft flex items-center justify-between px-6 lg:px-10">
        <Link to="/" className="font-heading text-xl font-bold text-navy tracking-tight flex items-center gap-0.5">
          Safe<span className="text-primary">Work</span>
          <span className="font-body font-light text-base ml-0.5">SST</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale hover:text-corp transition-all">Inicio</Link>
          <Link to="/sobre" className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale hover:text-corp transition-all">Sobre mí</Link>
          <button onClick={scrollToServices} className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale hover:text-corp transition-all">Servicios</button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {role === "admin" && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>Panel Admin</Button>
              )}
              {role === "client" && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Mi Dashboard</Button>
              )}
              <span className="text-sm text-muted-foreground">{profile?.nombre}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Cerrar Sesión</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setAuthMode("login")}>Iniciar Sesión</Button>
              <Button size="sm" onClick={() => setAuthMode("register")}>Diagnóstico gratuito →</Button>
            </>
          )}
        </div>

        <button className="md:hidden text-navy" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {mobileOpen && (
          <div className="absolute top-[66px] left-0 right-0 bg-white border-b border-border shadow-elegant p-4 flex flex-col gap-2 md:hidden animate-fade-in">
            <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale">Inicio</Link>
            <Link to="/sobre" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale">Sobre mí</Link>
            <div className="border-t border-border pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  {role === "admin" && <Button variant="ghost" onClick={() => { navigate("/admin"); setMobileOpen(false); }}>Panel Admin</Button>}
                  {role === "client" && <Button variant="ghost" onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>Dashboard</Button>}
                  <Button variant="ghost" onClick={() => { handleLogout(); setMobileOpen(false); }}>Cerrar Sesión</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { setAuthMode("login"); setMobileOpen(false); }}>Iniciar Sesión</Button>
                  <Button onClick={() => { setAuthMode("register"); setMobileOpen(false); }}>Diagnóstico gratuito →</Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModals mode={authMode} onClose={() => setAuthMode(null)} onSwitch={setAuthMode} />
    </>
  );
};

export default Navbar;
