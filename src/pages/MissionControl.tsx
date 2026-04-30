// @ts-nocheck
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  ShieldCheck, 
  Search, 
  FileText, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Package, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Map,
  Lock,
  ChevronRight,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// [v22.1] ObraGoPro Mission Control - Unified Ecosystem
// Lead UI/UX Industrial Design

const sectors = [
  { icon: "⛰️", name: "Minería", desc: "Control de estándares críticos, gestión de subcontratistas y seguridad en faena de alta montaña." },
  { icon: "🏗️", name: "Edificación", desc: "Trazabilidad de terminaciones, logística de grúas y estados de pago inmobiliarios." },
  { icon: "🛤️", name: "Vialidad", desc: "Monitoreo de avance físico en carreteras, puentes y túneles en tiempo real." },
  { icon: "⚓", name: "Puertos", desc: "Gestión de obras marítimas, dragado y control de suministros en terminales portuarios." },
  { icon: "⚡", name: "Energía", desc: "Planificación de parques eólicos, solares y tendidos de alta tensión." },
  { icon: "💧", name: "Hidráulica", desc: "Supervisión de plantas de tratamiento, embalses y redes de distribución." },
  { icon: "🏭", name: "Plantas", desc: "Montaje mecánico de precisión y control documental de paradas de planta." },
  { icon: "🏥", name: "Infra. Pública", desc: "Gestión de contratos complejos y cumplimiento de normativas gubernamentales." },
  { icon: "🚜", name: "Agroindustria", desc: "Construcción de centros de distribución y cámaras de frío con control de stock." }
];

const modules = [
  { 
    id: "obrafocus", 
    name: "ObraFocus", 
    icon: Search, 
    color: "blue",
    desc: "Caza de licitaciones con filtros estratégicos regionales.",
    active: true
  },
  { 
    id: "obrastudy", 
    name: "ObraStudy", 
    icon: FileText, 
    color: "orange",
    desc: "Análisis de pliegos técnicos y cubicación automatizada.",
    active: true
  },
  { 
    id: "obraplan", 
    name: "ObraPlan", 
    icon: Calendar, 
    color: "green",
    desc: "Motor de planificación dinámica (Carta Gantt Inteligente).",
    active: false
  },
  { 
    id: "obracontrol", 
    name: "ObraControl", 
    icon: Users, 
    color: "purple",
    desc: "Acreditación, asistencia QR y control de acceso documental.",
    active: false
  },
  { 
    id: "obrasegurity", 
    name: "ObraSegurity", 
    icon: ShieldCheck, 
    color: "red",
    desc: "Seguridad industrial, prevención de riesgos y reportes legales.",
    active: false
  },
  { 
    id: "obrastock", 
    name: "ObraStock", 
    icon: Package, 
    color: "yellow",
    desc: "Bodega inteligente, trazabilidad de insumos y alertas de quiebre.",
    active: false
  },
  { 
    id: "obraavan", 
    name: "ObraAvan", 
    icon: BarChart3, 
    color: "cyan",
    desc: "Visualización de avance real y cierre financiero.",
    active: false
  }
];

export default function MissionControl() {
  const navigate = useNavigate();
  const [hoveredSector, setHoveredSector] = useState(null);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-[#FF7A00] selection:text-black overflow-x-hidden">
      
      {/* 1. Header Tactical */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 flex justify-between items-center bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF7A00] rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              ObraGo<span className="text-[#FF7A00]">PRO</span>
            </h1>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Sistemas Nominal</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-slate-500">
            <Lock className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Protección por Google Authenticator</span>
          </div>
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group cursor-pointer hover:border-[#FF7A00]/50 transition-all">
            <Users className="w-5 h-5 group-hover:text-[#FF7A00]" />
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-24">
        
        {/* 2. Floating Industry Grid */}
        <section className="relative py-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              The Chilean <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Industry Grid.</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">Verticales Especializadas de Alto Impacto</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-9 gap-4 md:gap-8">
            {sectors.map((sector, idx) => (
              <div key={sector.name} className="relative flex flex-col items-center">
                <motion.div
                  onHoverStart={() => setHoveredSector(sector.name)}
                  onHoverEnd={() => setHoveredSector(null)}
                  whileHover={{ scale: 1.2, y: -10 }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-2xl backdrop-blur-md cursor-help relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  {sector.icon}
                </motion.div>
                
                <AnimatePresence>
                  {hoveredSector === sector.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-24 z-50 w-64 p-4 bg-[#12141c] border border-[#FF7A00]/30 rounded-2xl shadow-2xl backdrop-blur-2xl text-left space-y-2"
                    >
                      <h4 className="text-[#FF7A00] font-black uppercase text-[10px] tracking-widest">{sector.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">{sector.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <span className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-600">{sector.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 7-Module Ecosystem */}
        <section className="space-y-12">
          <div className="flex items-end justify-between border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase">Ecosistema Unificado</h3>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">7 Módulos de Control Operativo</p>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="w-2 h-2 bg-[#FF7A00] rounded-full" />
              <div className="w-2 h-2 bg-white/10 rounded-full" />
              <div className="w-2 h-2 bg-white/10 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod) => (
              <motion.div
                key={mod.id}
                whileHover={{ y: -5 }}
                className={`group relative p-8 rounded-[40px] border transition-all duration-500 flex flex-col justify-between h-[340px] overflow-hidden ${
                  mod.active 
                    ? "bg-[#12141c] border-white/10 hover:border-[#FF7A00]/30" 
                    : "bg-[#0A0A0B] border-white/5 opacity-60 grayscale"
                }`}
              >
                {!mod.active && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Próximamente</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    mod.active ? "bg-[#FF7A00]/10 text-[#FF7A00]" : "bg-white/5 text-slate-600"
                  }`}>
                    <mod.icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black tracking-tight">{mod.name}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-snug">{mod.desc}</p>
                  </div>
                </div>

                <Button
                  disabled={!mod.active}
                  onClick={() => mod.id === 'obrastudy' ? navigate('/scanner') : null}
                  className={`w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-6 ${
                    mod.active 
                      ? "bg-white/5 hover:bg-[#FF7A00] text-white hover:text-black border border-white/10" 
                      : "bg-transparent border border-white/5 text-slate-700"
                  }`}
                >
                  {mod.active ? "Acceder Módulo" : "Solicitar Demo"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. Core Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          <div className="p-10 bg-gradient-to-br from-slate-900 to-[#0A0A0B] border border-white/5 rounded-[48px] space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Zap className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <Activity className="w-5 h-5 text-red-500" />
              </div>
              <h5 className="text-lg font-black uppercase italic tracking-tighter">Semáforo Financiero</h5>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Control de margen crítico en tiempo real. Algoritmo de contraste Presupuesto vs. Real.
            </p>
            <div className="flex gap-2">
              <div className="w-full h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-red-500" />
              </div>
            </div>
          </div>

          <div className="p-10 bg-gradient-to-br from-slate-900 to-[#0A0A0B] border border-white/5 rounded-[48px] space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Target className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E0FF]/20 rounded-xl flex items-center justify-center border border-[#00E0FF]/30">
                <Zap className="w-5 h-5 text-[#00E0FF]" />
              </div>
              <h5 className="text-lg font-black uppercase italic tracking-tighter">IA Predictiva</h5>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Python-Powered Engine. Algoritmos avanzados que anticipan retrasos críticos y quiebres de stock.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-[#00E0FF] uppercase tracking-widest animate-pulse">Analizando Tendencias...</span>
            </div>
          </div>

          <div className="p-10 bg-gradient-to-br from-slate-900 to-[#0A0A0B] border border-white/5 rounded-[48px] space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Map className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <h5 className="text-lg font-black uppercase italic tracking-tighter">Muro de la Verdad</h5>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Feed visual inalterable con geolocalización GPS y firmas digitales. Trazabilidad 100% legal.
            </p>
            <div className="flex items-center -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0A0A0B] bg-slate-800" />
              ))}
              <span className="text-[8px] font-bold text-slate-500 ml-4">+124 Entradas Hoy</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer System */}
      <footer className="py-12 px-8 border-t border-white/5 bg-[#0A0A0B] flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em]">
            ObraGoPro Intel Core © 2026 • Chile Regional Master
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FF7A00] rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Servidor: Santiago-East-1</span>
          </div>
          <div className="flex items-center gap-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_Authenticator_logo.svg" className="w-4 h-4" alt="Authenticator" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Secured by Google</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
