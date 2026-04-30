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
  Plus
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
            <img src="/logo-dark.svg" className="h-full object-contain" alt="ObraGoPRO" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-full border border-white/10 hover:border-white/30 text-[10px] font-black uppercase tracking-widest text-white transition-all bg-white/5 backdrop-blur-md"
          >
            Login
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

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl mb-4"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">Cerebro Nexus V22.0 Live</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase"
            >
              Cubicación <br />
              <span className="text-primary">Instantánea.</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-tight"
            >
              Deja de perder licitaciones por falta de tiempo. Sube tu PDF y deja que el <span className="text-white border-b-2 border-primary/50">Motor de Auditoría Técnica</span> haga el trabajo por ti.
            </motion.p>
          </div>

          {/* 3. Formulario de Entrada Rápida */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="bg-[#12141c]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-2 shadow-2xl overflow-hidden">
              <div className="flex p-2 gap-2 mb-2">
                <button 
                  onClick={() => setActiveTab('pdf')}
                  className={`flex-1 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'pdf' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <FileText className="w-4 h-4" /> Subir PDF
                </button>
                <button 
                  onClick={() => setActiveTab('link')}
                  className={`flex-1 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'link' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <Link2 className="w-4 h-4" /> Link Licitación
                </button>
              </div>
              <div className="p-4 space-y-4">
                {activeTab === 'pdf' ? (
                  <div className="h-32 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center group cursor-pointer hover:border-primary/50 transition-all" onClick={() => navigate('/scanner')}>
                    <Plus className="w-8 h-8 text-slate-600 group-hover:text-primary mb-2 transition-all" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Arrastra tus planos o presupuesto aquí</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Pega el link de Mercado Público o portal aquí..." 
                      className="flex-1 bg-black/50 border border-white/5 rounded-2xl px-6 text-sm font-medium focus:border-primary/50 transition-all outline-none"
                    />
                    <Button onClick={() => navigate('/scanner')} className="h-14 px-8 rounded-2xl bg-primary text-black font-black uppercase italic tracking-tighter">Analizar</Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4. Prueba Social & Autoridad (Franja Industrial) */}
        <div className="absolute bottom-0 left-0 right-0 py-12 bg-white/5 border-t border-white/5 backdrop-blur-md overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Optimizado para zonas industriales:</span>
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
            </div>
          </div>
        </div>
      </header>

      {/* Benefits Section (Minimal) */}
      <section className="py-40 px-6 max-w-6xl mx-auto text-center space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto">
              <Clock className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Velocidad AEC</h3>
            <p className="text-slate-500 font-bold leading-relaxed">De 4 horas a 4 segundos. El Motor de Auditoría Técnica procesa APUs y normativas chilenas en tiempo récord.</p>
          </div>
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Norma NCh 170</h3>
            <p className="text-slate-500 font-bold leading-relaxed">Cálculos respaldados por normativa vigente, asegurando márgenes de utilidad reales y sin errores de cubicación.</p>
          </div>
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto">
              <Zap className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Impacto Visual</h3>
            <p className="text-slate-500 font-bold leading-relaxed">Reportes Élite PDF que imponen respeto ante mandantes y subcontratistas. Tu marca, elevada al máximo nivel.</p>
          </div>
        </div>
      </section>

      {/* 5. Cierre con Escasez */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto bg-primary rounded-[64px] p-20 text-center space-y-10 relative z-10 overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.3)]">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <h2 className="text-5xl md:text-7xl font-black text-black italic tracking-tighter uppercase leading-[0.85] relative z-20">
            Protege tu <br /> Rentabilidad Hoy.
          </h2>
          <div className="space-y-4 relative z-20">
            <p className="text-black/80 font-black text-2xl uppercase tracking-tighter italic">Reportes Élite desde $9.990 CLP</p>
            <p className="text-black/60 font-bold text-sm max-w-xl mx-auto uppercase tracking-widest">Cupos de Auditoría Técnica Limitados por Región.</p>
          </div>
          <Button 
            onClick={() => navigate('/scanner')} 
            className="h-20 px-16 rounded-full bg-black text-primary hover:bg-slate-900 transition-all text-2xl font-black uppercase italic tracking-tighter relative z-20 shadow-2xl"
          >
            Probar Scanner Ahora
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
