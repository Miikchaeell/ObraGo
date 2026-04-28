// @ts-nocheck
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe,
  Share2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// [v1.0] Landing Page Tesla Dark - Obra Go Chile
// Diseñada para máxima conversión en mercado frío.

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-primary selection:text-black">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black border border-primary/20 rounded-lg flex items-center justify-center">
            <img src="/obrago-gold-logo.jpg" className="w-full h-full object-cover" alt="O" />
          </div>
          <span className="text-xs font-black tracking-[0.2em] uppercase">Obra Go</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            Acceso Clientes
          </button>
          <Button 
            onClick={() => navigate('/scanner')}
            className="h-10 px-6 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Empezar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-10" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 3 }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb193005f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale scale-110"
          />
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto space-y-8 mt-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <div className="px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase">V21.2 Nivel Senior AEC-Chile</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] uppercase"
          >
            Tu Ingeniero Personal. <br />
            <span className="text-primary italic">En tu Bolsillo.</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 font-bold max-w-2xl mx-auto"
          >
            Toma una foto de la obra. La IA cubica, aplica normativas NCh, factores de pérdida y calcula la <span className="text-white">Cascada Comercial (CD + GG + Utilidad + IVA)</span> en 10 segundos.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg"
              onClick={() => navigate('/scanner')}
              className="w-full md:w-auto h-20 px-12 rounded-[32px] premium-button text-black text-xl font-black uppercase shadow-2xl shadow-primary/30 gap-4 group transition-all"
            >
              Iniciar Escaneo Élite
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <div className="flex flex-col items-center md:items-start text-left">
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                 No requiere tarjeta de crédito
               </p>
               <p className="text-[9px] uppercase font-bold text-slate-600">
                 Validado bajo normas Chilenas
               </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 text-slate-600 flex flex-col items-center gap-2"
        >
          <span className="text-[8px] font-black uppercase tracking-widest">Descubre el Poder de la IA</span>
          <div className="w-px h-12 bg-gradient-to-b from-slate-600 to-transparent" />
        </motion.div>
      </header>

      {/* Benefits Section */}
      <section className="py-32 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4 group">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black uppercase">Cálculo Nivel Senior</h3>
          <p className="text-slate-400 font-bold leading-relaxed">Olvídate de cubicaciones manuales. Detectamos radieres y muros, aplicando automáticamente 5% y 15% de pérdidas según material.</p>
        </div>

        <div className="space-y-4 group">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black uppercase">Cascada Comercial</h3>
          <p className="text-slate-400 font-bold leading-relaxed">No pierdas dinero. Calculamos tu Costo Directo y sumamos Gastos Generales (12%), Utilidad (15%) e IVA (19%) matemáticamente perfecto.</p>
        </div>

        <div className="space-y-4 group">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black uppercase">Reporte Élite PDF</h3>
          <p className="text-slate-400 font-bold leading-relaxed">Genera un documento PDF impecable con APU detallado, listo para ser enviado a tu cliente por WhatsApp y cerrar el trato.</p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white/5 py-24 px-6 text-center border-y border-white/5">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-center gap-2 text-[#D4AF37] mb-4">
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Respaldo Técnico Total</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Dejar de cobrar al "ojímetro" es tu mejor inversión.</h2>
          <p className="text-slate-400 font-bold text-lg">Presentarte como un profesional serio que entrega desgloses técnicos y respaldos NCh aumenta tu tasa de cierre en un 300%. Ese es el poder de ObraGo.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-white/5 bg-black">
        <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.4em]">
          Obra Go Chile © 2026 • Ingeniería AEC de Vanguardia
        </p>
      </footer>
    </div>
  );
}
