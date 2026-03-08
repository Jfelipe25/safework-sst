import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const scrollToServices = () => {
    if (location.pathname !== "/") return;
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[66px] bg-white/95 backdrop-blur-md border-b border-border shadow-soft flex items-center justify-between px-6 lg:px-10">
      {/* Logo */}
      <Link to="/" className="font-heading text-xl font-bold text-navy tracking-tight flex items-center gap-0.5">
        Safe<span className="text-primary">Work</span>
        <span className="font-body font-light text-base ml-0.5">SST</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-1">
        <Link to="/" className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale hover:text-corp transition-all">
          Inicio
        </Link>
        <Link to="/sobre" className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale hover:text-corp transition-all">
          Sobre mí
        </Link>
        <button onClick={scrollToServices} className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale hover:text-corp transition-all">
          Servicios
        </button>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-3">
        <Button variant="ghost" size="sm">Iniciar Sesión</Button>
        <Button size="sm">Diagnóstico gratuito →</Button>
      </div>

      {/* Mobile toggle */}
      <button className="md:hidden text-navy" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-[66px] left-0 right-0 bg-white border-b border-border shadow-elegant p-4 flex flex-col gap-2 md:hidden animate-fade-in">
          <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale">
            Inicio
          </Link>
          <Link to="/sobre" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale">
            Sobre mí
          </Link>
          <button onClick={scrollToServices} className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-blue-pale">
            Servicios
          </button>
          <div className="border-t border-border pt-3 flex flex-col gap-2">
            <Button variant="ghost" className="w-full">Iniciar Sesión</Button>
            <Button className="w-full">Diagnóstico gratuito →</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
