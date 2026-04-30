// @ts-nocheck
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe,
  Share2,
  MessageSquare,
  FileText,
  Link2,
  Factory,
  Clock,
  Plus,
  Activity,
  FileCheck,
  TrendingUp,
  Layout,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// [v1.0] Landing Page Tesla Dark - Obra Go Chile
// Diseñada para máxima conversión en mercado frío.

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pdf');

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      {/* 1. Header Transparente */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="h-10 flex items-center justify-center">
            <img src="/logo-dark.svg" className="h-full object-contain" alt="ObraGoPro" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-full border border-white/10 hover:border-white/30 text-[10px] font-black uppercase tracking-widest text-white transition-all bg-white/5 backdrop-blur-md"
          >
            Acceso Senior
          </button>
        </div>
      </nav>

      {/* 2. Sección Hero con Video y Glassmorphism */}
      <header className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video con Glassmorphism */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          >
            <source src="/videos/Michael.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
          <div className="absolute inset-0 backdrop-blur-[2px] z-5" />
        </div>

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto space-y-12">
          {/* Glassmorphism Panel inmersivo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[60px] p-12 md:p-20 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-8"
            >
              <Cpu className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Cerebro Nexus V22.1 Activo</span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase"
              >
                CUBICA <br />
                <span className="text-primary">CON IA.</span>
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-lg md:text-xl text-slate-300 font-bold max-w-2xl mx-auto leading-tight"
              >
                Auditoría técnica instantánea para licitaciones de alto impacto. <br />
                Sincronización directa con normas NCh 170 y NCh 430.
              </motion.p>
            </div>

            {/* Entrada Rápida de Alto Impacto */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-12 flex flex-col md:flex-row gap-4 items-center bg-white/5 p-2 rounded-[32px] border border-white/10"
            >
              <div className="flex-1 w-full relative">
                <Link2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Pega aquí el enlace de Mercado Público o sube un PDF de licitación para auditoría instantánea" 
                  className="w-full bg-transparent border-none pl-14 pr-6 py-6 text-sm font-medium focus:ring-0 text-white placeholder:text-slate-500"
                />
              </div>
              <Button 
                onClick={() => navigate('/mission-control')} 
                className="w-full md:w-auto h-16 px-10 rounded-[24px] bg-primary text-black font-black uppercase italic tracking-tighter text-lg shadow-2xl hover:scale-105 transition-all"
              >
                Entrar a Mission Control
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* 4. Prueba Social & Autoridad (Franja Industrial) */}
        <div className="absolute bottom-0 left-0 right-0 py-12 bg-white/5 border-t border-white/5 backdrop-blur-md overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Optimizando presupuestos en zonas de alto tráfico industrial:</span>
            <div className="flex flex-wrap items-center justify-center gap-12">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                <span className="text-sm font-black italic tracking-tighter uppercase">MAIPÚ AEC</span>
              </div>
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                <span className="text-sm font-black italic tracking-tighter uppercase">SAN BERNARDO IND</span>
              </div>
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                <span className="text-sm font-black italic tracking-tighter uppercase">SAN FERNANDO PRO</span>
              </div>
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                <span className="text-sm font-black italic tracking-tighter uppercase">LAMPA INDUSTRIAL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Benefits Section (Minimal) */}
      <section className="py-40 px-6 max-w-6xl mx-auto text-center space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto">
              <Activity className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Análisis de Estructura</h3>
            <p className="text-slate-500 font-bold leading-relaxed">Sincronización total con APUs dinámicos. El motor identifica partidas críticas y optimiza el uso de recursos AEC.</p>
          </div>
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto">
              <FileCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Informes de Ingeniería</h3>
            <p className="text-slate-500 font-bold leading-relaxed">Generación de reportes PDF bajo estándares de auditoría MOP y SERVIU. Tu firma, respaldada por precisión absoluta.</p>
          </div>
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto">
              <TrendingUp className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Optimización de Márgenes</h3>
            <p className="text-slate-500 font-bold leading-relaxed">Detecta fugas de rentabilidad en segundos. Protege tu utilidad final con cálculos de precisión industrial.</p>
          </div>
        </div>
      </section>

      {/* 5. Cierre con Escasez */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto bg-black border border-white/5 rounded-[64px] p-20 text-center space-y-12 relative z-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.85] relative z-20">
            INVERSIÓN EN <br /> Rentabilidad Blindada.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
             <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reporte Básico</p>
                <p className="text-3xl font-black text-white">$9.990</p>
                <Button variant="ghost" onClick={() => navigate('/scanner')} className="w-full text-[10px] uppercase font-black text-primary">Elegir</Button>
             </div>
             <div className="p-6 bg-primary border border-primary rounded-[32px] space-y-4 shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-black">Auditoría Industrial</p>
                <p className="text-3xl font-black text-black">$24.990</p>
                <Button className="w-full text-[10px] uppercase font-black bg-black text-primary">Activar Pro</Button>
             </div>
             <div className="p-6 bg-white/5 border border-primary rounded-[32px] space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Reporte Élite NCh</p>
                <p className="text-3xl font-black text-white">$59.990</p>
                <Button variant="outline" onClick={() => navigate('/scanner')} className="w-full text-[10px] uppercase font-black border-primary text-primary">Elegir</Button>
             </div>
          </div>

          <Button 
            onClick={() => navigate('/mission-control')} 
            className="h-20 px-16 rounded-full bg-primary text-black hover:bg-white transition-all text-2xl font-black uppercase italic tracking-tighter relative z-20 shadow-2xl"
          >
            Acceder a Mission Control
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-white/5 bg-black">
        <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.4em]">
          ObraGoPRO Chile © 2026 • Inteligencia AEC de Vanguardia
        </p>
      </footer>
    </div>
  );
}
