import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Login() {
  const { signInWithGoogle, login, verifyMfa } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError("Fallo al entrar con Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await login(phone, password);
      if (result?.mfaRequired) {
        setTempToken(result.tempToken || "");
        setMfaStep(true);
      }
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await verifyMfa(tempToken, mfaCode);
    } catch (err: any) {
      setError(err.message || "Código inválido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] bg-grid-white/[0.02] flex items-center justify-center p-6 font-display">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header de Marca */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center shadow-2xl p-0.5 overflow-hidden border border-primary/20 mb-6 group">
            <img 
              src="/obrago-gold-logo.jpg" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="ObraGo Gold" 
            />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
            OBRA<span className="text-primary">GO</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.4em]">Proptech Intelligence</span>
          </div>
        </div>

        {/* Card de Auth */}
        <div className="bg-[#1c1f26]/80 backdrop-blur-xl border border-white/5 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -mr-16 -mt-16" />
          
          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                {mfaStep ? "Verificar" : "Acceso"}
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                  {mfaStep ? "Identidad por Email" : "Login por SMS"}
                </span>
              </div>
            </div>

            {!mfaStep ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="tel" 
                      placeholder="+56 9 1234 5678" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="Contraseña" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase text-xs shadow-lg shadow-primary/20"
                >
                  {isLoading ? "Cargando..." : "Entrar con Email"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMfaVerify} className="space-y-6">
                <div className="space-y-2 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ingresa el código de 6 dígitos enviado a tu dispositivo</p>
                  <input 
                    type="text" 
                    placeholder="000000" 
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    required
                    className="w-full h-16 bg-white/5 border border-primary/30 rounded-2xl text-center text-2xl font-black tracking-[0.5em] text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}

                <div className="space-y-3">
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase text-xs shadow-lg shadow-primary/20"
                  >
                    {isLoading ? "Validando..." : "Verificar Acceso"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setMfaStep(false)}
                    className="w-full text-[10px] text-slate-500 font-bold uppercase hover:text-white"
                  >
                    Volver al inicio
                  </Button>
                </div>
              </form>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-[#1c1f26] px-4 text-slate-500">O continúa con</span></div>
            </div>

            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 text-black font-black text-xs gap-3 shadow-xl transition-transform active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              GOOGLE
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            © 2026 Obra Go • San Fernando, Chile
          </p>
        </footer>
      </motion.div>
    </div>
  );
}

