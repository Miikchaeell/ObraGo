// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Search, 
  BarChart3, 
  Activity, 
  Shield, 
  Layers, 
  Factory,
  ArrowRight,
  Zap,
  Globe,
  Database,
  Network,
  Workflow,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// [v22.3.0] ObraGoPRO - Infraestructura SaaS (n8n inspired)
// Elite UX Engineering by Antigravity

const modules = [
  { id: 'focus', title: 'ObraFocus', desc: 'Radar de licitaciones Mercado Público 24/7.', icon: Search, color: '#D4AF37' },
  { id: 'control', title: 'ObraControl', desc: 'Control de estados de pago y margen.', icon: BarChart3, color: '#F2F2F2' },
  { id: 'avan', title: 'ObraAvan', desc: 'Reportabilidad GPS y validación biométrica.', icon: Activity, color: '#D4AF37' },
  { id: 'security', title: 'ObraSegurity', desc: 'Estándar ZYGHT automatizado.', icon: Shield, color: '#F2F2F2' },
  { id: 'study', title: 'ObraStudy', desc: 'BIM & Critical Path Mastermind.', icon: Layers, color: '#D4AF37' },
  { id: 'plan', title: 'ObraPlan', desc: 'Planificación estratégica de recursos.', icon: Factory, color: '#F2F2F2' }
];

const ConnectionLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
    <motion.path
      d="M 100 100 L 300 300 L 500 100 L 700 400"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="1"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    />
    <motion.path
      d="M 900 100 L 700 500 L 300 200"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="1"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
    />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const yScale = useTransform(scrollY, [0, 500], [1, 0.8]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2F2F2] font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden relative">
      
      {/* 0. Canvas de Fondo (Infraestructura) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_70%)]" />
        <ConnectionLines />
      </div>

      {/* 1. Nav Estilo SaaS */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 md:px-12 flex justify-between items-center bg-[#080808]/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-[#D4AF37] rounded-sm flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter">
            ObraGo<span className="text-[#D4AF37]">PRO</span>
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          <a href="#bento" className="hover:text-[#D4AF37] transition-colors">Ecosistema</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Infraestructura</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Documentación</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Login</button>
          <Button onClick={() => navigate('/mission-control')} className="glow-button h-10 px-6 text-[10px] rounded-sm">
            ACTIVAR CONTROL TOTAL
          </Button>
        </div>
      </nav>

      {/* 2. Hero Section: Orquestación de Ingeniería */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
        <motion.div 
          style={{ scale: yScale, opacity }}
          className="relative z-10 text-center max-w-5xl mx-auto space-y-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">V22.3 Infraestructure Launch</span>
          </div>

          <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black italic tracking-tighter leading-[0.8] uppercase">
            ORQUESTA <br />
            <span className="text-[#D4AF37]">TU OBRA.</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto uppercase tracking-tighter leading-tight">
            "La infraestructura de tu éxito no se construye con planillas, se construye con flujos autónomos."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button onClick={() => navigate('/mission-control')} className="glow-button h-16 px-12 text-xl font-black italic rounded-sm">
              DESPLEGAR MISSION CONTROL
            </Button>
            <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              Latencia Cero en Terreno
            </div>
          </div>
        </motion.div>

        {/* Agentes Flotantes Visuales */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-24 h-24 border border-[#D4AF37]/20 rounded-full flex items-center justify-center backdrop-blur-xl"
          >
            <Network className="w-8 h-8 text-[#D4AF37]/40" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-32 h-32 border border-white/5 rounded-full flex items-center justify-center backdrop-blur-xl"
          >
            <Workflow className="w-10 h-10 text-white/5" />
          </motion.div>
        </div>
      </section>

      {/* 3. Bento Grid: Ecosistema Agéntico */}
      <section id="bento" className="py-40 px-6 md:px-10 max-w-7xl mx-auto relative z-10">
        <div className="space-y-4 mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Infraestructura de Poder</h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em]">6 Módulos. Un solo Centro de Mando.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[250px]">
          {/* ObraFocus - Grande */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-3 lg:col-span-8 border-beam p-10 bg-white/[0.02] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-[#D4AF37]/10 rounded-sm text-[#D4AF37]">
                <Search className="w-8 h-8" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Radar</div>
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black italic tracking-tighter uppercase">ObraFocus</h3>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-tight">El radar de licitaciones (Mercado Público) que nunca duerme. Identifica oportunidades antes que tu competencia.</p>
            </div>
          </motion.div>

          {/* ObraControl - Cuadrado */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-3 lg:col-span-4 border-beam p-10 bg-white/[0.02] flex flex-col justify-center items-center text-center space-y-6"
          >
            <BarChart3 className="w-16 h-16 text-white/10" />
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">ObraControl</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Blindaje financiero y estados de pago.</p>
          </motion.div>

          {/* ObraAvan - Vertical */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 lg:col-span-4 border-beam p-10 bg-[#D4AF37] text-black flex flex-col justify-between"
          >
             <Activity className="w-12 h-12" />
             <div className="space-y-2">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">ObraAvan</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Validación Biométrica y GPS en tiempo real.</p>
             </div>
          </motion.div>

          {/* ObraSegurity & Study - Horizontal */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 lg:col-span-8 border-beam p-10 bg-white/[0.02] grid grid-cols-2 gap-10"
          >
            <div className="space-y-4 border-r border-white/5 pr-10">
               <Shield className="w-8 h-8 text-[#D4AF37]" />
               <h4 className="text-xl font-black italic tracking-tighter uppercase">ObraSegurity</h4>
               <p className="text-[9px] text-slate-500 font-bold uppercase">Estándar ZYGHT automatizado.</p>
            </div>
            <div className="space-y-4">
               <Layers className="w-8 h-8 text-white/40" />
               <h4 className="text-xl font-black italic tracking-tighter uppercase">ObraStudy</h4>
               <p className="text-[9px] text-slate-500 font-bold uppercase">Mente maestra BIM & Path.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Social Proof / Authority */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5 relative z-10 overflow-hidden">
        <div className="flex gap-20 animate-infinite-scroll opacity-30 whitespace-nowrap">
           {['SANTIAGO', 'MAIPÚ', 'SAN FERNANDO', 'PUERTO MONTT', 'ANTOFAGASTA', 'VALPARAÍSO'].map(city => (
             <span key={city} className="text-4xl font-black italic tracking-tighter uppercase">{city}</span>
           ))}
           {['SANTIAGO', 'MAIPÚ', 'SAN FERNANDO', 'PUERTO MONTT', 'ANTOFAGASTA', 'VALPARAÍSO'].map(city => (
             <span key={city} className="text-4xl font-black italic tracking-tighter uppercase">{city}</span>
           ))}
        </div>
      </section>

      {/* 5. Footer: Llamado de Misión Crítica */}
      <footer className="py-40 px-6 text-center space-y-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            La infraestructura <br /> no espera.
          </h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em]">Despliega tu ventaja competitiva hoy mismo.</p>
        </div>

        <Button 
          onClick={() => navigate('/mission-control')}
          className="glow-button h-24 px-20 text-3xl font-black italic rounded-sm"
        >
          ACTIVAR CONTROL TOTAL
        </Button>

        <div className="pt-20 flex flex-col md:flex-row justify-between items-center gap-10 opacity-30">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">ObraGoPro V22.3.0</span>
          </div>
          <div className="flex gap-6">
            <div className="w-10 h-px bg-white" />
            <span className="text-[9px] font-black uppercase tracking-widest">Powered by Antigravity IA</span>
          </div>
        </div>
      </footer>

      {/* Smooth Scroll Utility Helper */}
      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
