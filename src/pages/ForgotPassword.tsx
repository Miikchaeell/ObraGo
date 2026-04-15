import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setIsSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo procesar la solicitud");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-display text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md space-y-6"
        >
          <div className="flex justify-center">
            <img src="/obra-go-branding-2026.png" className="w-48 h-auto drop-shadow-xl" alt="ObraGo" />
          </div>
          <div className="flex justify-center pt-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Correo Enviado</h1>
          <p className="text-muted-foreground">
            Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.
          </p>
          <Button asChild className="w-full h-12 rounded-xl text-lg font-bold">
            <Link to="/login">Volver al Login</Link>
          </Button>
        </motion.div>
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
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al Login
        </Link>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center p-1 border border-primary/20 shadow-2xl overflow-hidden group">
              <img 
                src="/obrago-gold-logo.jpg" 
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110" 
                alt="Obra Go" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">OBRA<span className="text-primary">GO</span></h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Recuperación de Acceso</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email corporativo"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm font-medium">{error}</p>}

          <Button 
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Enviar Instrucciones"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
