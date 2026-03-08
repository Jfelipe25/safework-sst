import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SECTORS, ARLS, RISK_LEVELS } from "@/data/constants";
import { X } from "lucide-react";

interface AuthModalsProps {
  mode: "login" | "register" | null;
  onClose: () => void;
  onSwitch: (mode: "login" | "register") => void;
}

const AuthModals = ({ mode, onClose, onSwitch }: AuthModalsProps) => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [reg, setReg] = useState({
    nombre: "", telefono: "", correo: "", ciudad: "", empresa: "", nit: "",
    cargo: "", sector: "", arl: "", riesgo: "", trabajadores: "", password: "",
  });

  if (!mode) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) setError(error.message);
    else onClose();
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!reg.nombre || !reg.correo || !reg.empresa || !reg.password) {
      setError("Completa los campos obligatorios");
      setLoading(false);
      return;
    }
    if (reg.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }
    const { error } = await signUp(reg.correo, reg.password, {
      nombre: reg.nombre,
      empresa: reg.empresa,
      nit: reg.nit || null,
      ciudad: reg.ciudad || null,
      cargo: reg.cargo || null,
      sector: reg.sector || null,
      arl: reg.arl || null,
      riesgo: reg.riesgo || null,
      trabajadores: reg.trabajadores ? parseInt(reg.trabajadores) : null,
      telefono: reg.telefono || null,
    });
    if (error) setError(error.message);
    else onClose();
    setLoading(false);
  };

  const inputClass = "w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg font-body text-sm text-navy bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all";
  const labelClass = "text-xs font-semibold text-muted-foreground tracking-wide block mb-1";

  return (
    <div className="fixed inset-0 z-[200] bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-full max-h-[90vh] overflow-y-auto relative shadow-elegant-lg" style={{ maxWidth: mode === "register" ? 500 : 400 }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors">
          <X size={16} />
        </button>

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <h2 className="font-heading text-2xl font-bold text-navy mb-1">Bienvenido de nuevo</h2>
            <p className="text-sm text-muted-foreground mb-6">Accede a tu cuenta para continuar</p>
            <div className="mb-4">
              <label className={labelClass}>Correo electrónico</label>
              <input type="email" className={inputClass} placeholder="correo@empresa.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Contraseña</label>
              <input type="password" className={inputClass} placeholder="Tu contraseña" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-danger mb-3">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</Button>
            <p className="text-center mt-4 text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <button type="button" className="text-primary font-semibold hover:underline" onClick={() => onSwitch("register")}>Regístrate gratis</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2 className="font-heading text-2xl font-bold text-navy mb-1">Crear cuenta</h2>
            <p className="text-sm text-muted-foreground mb-6">Completa tus datos para iniciar el diagnóstico SST</p>

            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Nombre completo *</label><input className={inputClass} value={reg.nombre} onChange={(e) => setReg({ ...reg, nombre: e.target.value })} required /></div>
              <div><label className={labelClass}>Teléfono</label><input className={inputClass} value={reg.telefono} onChange={(e) => setReg({ ...reg, telefono: e.target.value })} placeholder="+57 300..." /></div>
              <div><label className={labelClass}>Correo electrónico *</label><input type="email" className={inputClass} value={reg.correo} onChange={(e) => setReg({ ...reg, correo: e.target.value })} required /></div>
              <div><label className={labelClass}>Ciudad</label><input className={inputClass} value={reg.ciudad} onChange={(e) => setReg({ ...reg, ciudad: e.target.value })} /></div>
              <div><label className={labelClass}>Empresa *</label><input className={inputClass} value={reg.empresa} onChange={(e) => setReg({ ...reg, empresa: e.target.value })} required /></div>
              <div><label className={labelClass}>NIT / Cédula</label><input className={inputClass} value={reg.nit} onChange={(e) => setReg({ ...reg, nit: e.target.value })} /></div>
              <div><label className={labelClass}>Cargo</label><input className={inputClass} value={reg.cargo} onChange={(e) => setReg({ ...reg, cargo: e.target.value })} /></div>
              <div>
                <label className={labelClass}>Sector económico</label>
                <select className={inputClass} value={reg.sector} onChange={(e) => setReg({ ...reg, sector: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {SECTORS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>ARL</label>
                <select className={inputClass} value={reg.arl} onChange={(e) => setReg({ ...reg, arl: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {ARLS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nivel de riesgo</label>
                <select className={inputClass} value={reg.riesgo} onChange={(e) => setReg({ ...reg, riesgo: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>N° de trabajadores</label><input type="number" className={inputClass} value={reg.trabajadores} onChange={(e) => setReg({ ...reg, trabajadores: e.target.value })} min="1" /></div>
              <div><label className={labelClass}>Contraseña *</label><input type="password" className={inputClass} value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} placeholder="Mínimo 6 caracteres" required /></div>
            </div>
            {error && <p className="text-sm text-danger mt-3">{error}</p>}
            <Button type="submit" className="w-full mt-4" disabled={loading}>{loading ? "Creando cuenta..." : "Crear cuenta y continuar →"}</Button>
            <p className="text-center mt-4 text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <button type="button" className="text-primary font-semibold hover:underline" onClick={() => onSwitch("login")}>Inicia sesión</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModals;
