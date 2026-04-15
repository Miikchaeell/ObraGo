import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setIsLoading(true);
    setError("");

    localStorage.removeItem("token");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setIsRegistered(true);
      } else {
        const data = await res.json();
        setError(data.error || "Error al registrarse");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="flex flex-col items-center gap-6">
            <div className="w-28 h-28 bg-black rounded-[2rem] flex items-center justify-center p-1 border border-primary/20 shadow-[0_20px_50px_-15px_rgba(225,255,0,0.3)] overflow-hidden group">
              <img src="/obrago-gold-logo.jpg" className="w-full h-full object-cover rounded-[1.5rem] transition-transform duration-700 group-hover:scale-110" alt="ObraGo" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">OBRA<span className="text-primary">GO</span></h1>
          </div>
          <div className="flex justify-center pt-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">Cuenta en Revisión</h1>
          <p className="text-gray-400 text-lg">
            ¡Registro recibido! Tu solicitud de acceso está siendo procesada por el equipo de ObraGo.
          </p>
          <div className="bg-white/5 p-6 rounded-2xl text-sm border border-white/10 text-gray-300">
            Recibirás una notificación por email cuando tu acceso a la beta privada sea aprobado.
          </div>
          <a 
            href="/login" 
            className="inline-block w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-bold transition-all shadow-xl no-underline"
          >
            Volver al Inicio de Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-display">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center p-1 border border-primary/20 shadow-xl overflow-hidden group">
              <img src="/obrago-gold-logo.jpg" className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-110" alt="ObraGo" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">OBRA<span className="text-primary">GO</span></h1>
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Crea tu cuenta corporativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="sr-only">Email corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirmar Contraseña"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm font-medium">{error}</p>}

          <Button 
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 transition-all font-display"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Crear Cuenta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground pt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">
            Inicia sesión aquí
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
