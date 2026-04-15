import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
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
          
          <div className="relative z-10 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white mb-2">Bienvenido</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Protocolo Nivel 1</span>
              </div>
            </div>

            <div className="space-y-6">
              <Button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-18 rounded-[24px] bg-white hover:bg-slate-100 text-black font-black text-lg gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full"
                  />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                    ENTRAR CON GOOGLE
                  </>
                )}
              </Button>

              <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-3">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <LogIn className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wide">Acceso Seguro</p>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                      Tu identidad está protegida por los protocolos de encriptación de Obra Go y Google Cloud.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
