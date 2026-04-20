import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// [v1.0] Landing Page Tesla Dark - Obra Go Chile
// Diseñada para máxima conversión en mercado frío.

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-primary selection:text-black">
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

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-black border border-primary/40 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <img src="/obrago-gold-logo.jpg" className="w-full h-full object-cover" alt="O" />
            </div>
            <span className="text-xl font-black tracking-[0.3em] text-primary uppercase italic">Obra Go</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase"
          >
            Escanea tu Obra. <br />
            <span className="text-primary italic">IA de Precisión.</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 font-bold max-w-2xl mx-auto"
          >
            La primera inteligencia artificial en Chile que cubica materiales y calcula presupuestos reales desde una simple fotografía. 
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
              className="w-full md:w-auto h-20 px-12 rounded-[32px] bg-primary hover:bg-white text-black text-xl font-black uppercase shadow-2xl shadow-primary/30 gap-4 group transition-all"
            >
              Probar Scanner Ahora
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              1er Cálculo Gratis • Sin Registro
            </p>
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
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black uppercase">Cálculo con IA</h3>
          <p className="text-slate-400 font-bold leading-relaxed">Detección automática de radieres, muros y excavaciones. Precisión técnica nacional al instante.</p>
        </div>

        <div className="space-y-4 group">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black uppercase">Desglose de IVA</h3>
          <p className="text-slate-400 font-bold leading-relaxed">Calculamos el IVA (19%) y leyes sociales vigentes en Chile para presupuestos serios y legales.</p>
        </div>

        <div className="space-y-4 group">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black uppercase">Envío WhatsApp</h3>
          <p className="text-slate-400 font-bold leading-relaxed">Exporta tu Presupuesto Maestro y envíalo directamente al WhatsApp de tu cliente o proveedor.</p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white/5 py-24 px-6 text-center border-y border-white/5">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center gap-2 text-primary mb-4">
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cobertura Nacional 100% Chile</span>
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Desde Arica a Punta Arenas</h2>
          <p className="text-slate-400 font-bold">Obra Go incluye todas las regiones y comunas del territorio nacional con precios de mercado actualizados mensualmente.</p>
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
