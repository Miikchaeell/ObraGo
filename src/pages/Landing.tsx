// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe,
  Camera,
  FileText,
  Activity,
  Maximize2,
  Lock,
  Cpu,
  BarChart3,
  Search,
  Users,
  Shield,
  Layers,
  Factory,
  HardHat,
  Construction
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// [v22.2] ObraGoPRO - Dark Industrial Luxury Interface
// Reconstrucción Total por Antigravity V3

const useCases = [
  { title: "Infraestructura Vial", desc: "Puentes de gran luz y Túneles mineros (Precisión en excavación)." },
  { title: "Salud y Energía", desc: "Hospitales de alta complejidad y Centrales hidroeléctricas." },
  { title: "Transporte masivo", desc: "Aeropuertos y Puertos (Logística de suministros masivos)." },
  { title: "Edificación Industrial", desc: "Plantas de procesos Nestlé/CMPC y Radieres R7 de alto tráfico." },
  { title: "Urbanismo", desc: "Proyectos habitacionales a gran escala y Obras Civiles urbanas." }
];

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const [isScanned, setIsScanned] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsScanned(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2F2F2] font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-10 bg-red-600 z-[9999] flex items-center justify-center text-white font-black text-xs">
        RENDER TEST ACTIVE - V22.2.1-X.1
      </div>
      
      {/* 1. Header Minimalista de Autoridad */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-10 py-8 flex justify-between items-center transition-all duration-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-sm flex items-center justify-center">
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              ObraGo<span className="text-[#D4AF37]">PRO</span>
            </h1>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hidden md:block">V22.2 Engineering Core</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-all"
          >
            Acceso Senior
          </button>
          <button 
            onClick={() => navigate('/mission-control')}
            className="px-8 py-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all rounded-sm shadow-2xl shadow-[#D4AF37]/20"
          >
            ACTIVAR CONTROL TOTAL
          </button>
        </div>
      </nav>

      {/* 2. Hero Section: Misión Crítica */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
          >
            <source src="/videos/obragopro-v22-2-X.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808]/80 to-[#080808] z-10" />
        </div>

        <motion.div 
          style={{ y: y1 }}
          className="relative z-20 text-center px-6 max-w-6xl mx-auto space-y-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-sm backdrop-blur-sm mb-4">
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.5em] text-[#D4AF37] uppercase">Sincronización Regional Activa: Maipú / San Fernando</span>
          </div>

          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-[12rem] font-black italic tracking-tighter leading-[0.75] uppercase"
            >
              CUBICA <br />
              <span className="text-[#D4AF37]">CON IA.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-slate-400 font-bold max-w-3xl mx-auto uppercase tracking-tighter leading-tight"
            >
              Auditoría técnica instantánea. Si se construye, ObraGoPRO lo optimiza. No aceptes pérdidas de margen en tu licitación.
            </motion.p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
            <Button 
              onClick={() => navigate('/mission-control')}
              className="h-20 px-16 bg-[#D4AF37] text-black text-2xl font-black uppercase italic tracking-tighter rounded-sm hover:scale-105 transition-all shadow-[0_0_50px_rgba(212,175,55,0.3)]"
            >
              ACTIVAR CONTROL TOTAL
            </Button>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-12 h-px bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secured by Google Authenticator</span>
              <div className="w-12 h-px bg-white/10" />
            </div>
          </div>
        </motion.div>
      </header>

      {/* 3. The Photo-to-Budget Hook */}
      <section className="py-40 px-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <div className="w-16 h-1 bg-[#D4AF37]" />
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Photo-to-Budget <br />
              <span className="text-white/40 italic">Extraction.</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              Sube una imagen de tu frente de trabajo. Nuestra IA extraerá cubicaciones y costos en 3.4 segundos. 
              <span className="text-[#D4AF37] block mt-4 font-black uppercase text-xs tracking-widest">Tu competencia ya está licitando con IA. No te quedes atrás.</span>
            </p>
            <Button onClick={() => navigate('/scanner')} className="h-16 px-10 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] hover:text-black transition-all">
              Probar Scanner de Ingeniería
            </Button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-[#D4AF37]/10 blur-[100px] rounded-full group-hover:bg-[#D4AF37]/20 transition-all" />
            <div className="relative bg-[#080808] border border-white/5 rounded-sm p-10 shadow-2xl overflow-hidden aspect-video flex flex-col items-center justify-center space-y-6">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37] animate-scan-slow opacity-50" />
               <Camera className="w-20 h-20 text-[#D4AF37] opacity-20" />
               <div className="text-center space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Arrastra Planos o Imágenes aquí</p>
                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Motor AEC V22.2 listo para Ingestión</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Efficiency Gap: Orden vs Caos */}
      <section className="py-40 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-6">
            <h3 className="text-4xl font-black italic tracking-tighter uppercase">The Efficiency Gap</h3>
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.5em]">La diferencia entre sobrevivir y liderar el mercado</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
            <div className="p-20 bg-[#080808] space-y-12">
              <div className="flex items-center gap-4 text-red-500/50">
                <AlertTriangle className="w-8 h-8" />
                <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">Caos Tradicional</h4>
              </div>
              <ul className="space-y-6">
                {['Planillas Excel corruptas', 'Reportes con 7 días de desfase', 'Pérdidas de margen no detectadas', 'Errores humanos en cubicación'].map(item => (
                  <li key={item} className="flex items-center gap-4 text-slate-500 text-sm font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 bg-red-500/30 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-20 bg-[#0A0A0A] space-y-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Cpu className="w-32 h-32" /></div>
              <div className="flex items-center gap-4 text-[#D4AF37]">
                <ShieldCheck className="w-8 h-8" />
                <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">Orden ObraGoPRO</h4>
              </div>
              <ul className="space-y-6">
                {['Agentes IA Antigravity 24/7', 'Reportabilidad en tiempo real', 'Control de margen blindado', 'Precisión técnica automatizada'].map(item => (
                  <li key={item} className="flex items-center gap-4 text-[#D4AF37] text-sm font-black uppercase tracking-[0.15em]">
                    <Zap className="w-4 h-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Authority Slider: Casos de Uso Crítico */}
      <section className="py-40 border-y border-white/5 overflow-hidden">
        <div className="px-10 mb-20 text-center">
          <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Disuasión por Autoridad</h3>
          <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Estandarizando la industria pesada en Chile</p>
        </div>
        
        <div className="flex gap-10 animate-infinite-scroll">
          {[...useCases, ...useCases].map((item, idx) => (
            <div key={idx} className="min-w-[400px] p-10 border border-white/5 bg-[#0a0a0a] rounded-sm space-y-4">
              <div className="flex items-center gap-3">
                <Factory className="w-5 h-5 text-[#D4AF37]" />
                <h5 className="font-black uppercase italic tracking-tighter text-lg">{item.title}</h5>
              </div>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. El Ecosistema Agéntico (Módulos) */}
      <section className="py-40 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { id: 'focus', title: 'ObraFocus', desc: 'El radar de licitaciones (Mercado Público) que nunca duerme.', icon: Search },
            { id: 'control', title: 'ObraControl', desc: 'Blindaje financiero y control de estados de pago automatizados.', icon: BarChart3 },
            { id: 'avan', title: 'ObraAvan', desc: 'Reportabilidad de terreno con validación biométrica y GPS.', icon: Activity },
            { id: 'security', title: 'ObraSegurity', desc: 'El estándar ZYGHT automatizado para prevención de riesgos.', icon: Shield },
            { id: 'study', title: 'ObraStudy & Plan', desc: 'La mente maestra. BIM & Critical Path Engine.', icon: Layers }
          ].map((mod) => (
            <div key={mod.id} className="p-12 border border-white/5 bg-[#0a0a0a] space-y-8 group hover:border-[#D4AF37]/20 transition-all">
              <div className="w-14 h-14 bg-white/5 rounded-sm flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                <mod.icon className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase">{mod.title}</h4>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">{mod.desc}</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/mission-control')} className="p-0 text-[#D4AF37] font-black uppercase text-[10px] tracking-widest hover:bg-transparent">Configurar Módulo</Button>
            </div>
          ))}
          <div className="p-12 bg-[#D4AF37] flex flex-col justify-between items-start space-y-10 shadow-2xl">
            <h4 className="text-4xl font-black text-black italic tracking-tighter uppercase leading-none">Unificar <br /> Operación.</h4>
            <Button onClick={() => navigate('/mission-control')} className="w-full h-16 bg-black text-[#D4AF37] font-black uppercase tracking-widest text-[10px]">Entrar al Ecosistema</Button>
          </div>
        </div>
      </section>

      {/* 7. Footer de Urgencia Financiera */}
      <footer className="py-40 px-10 border-t border-white/5 bg-[#050505] text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">
            Tu competencia ya está <br /> licitando con IA.
          </h2>
          <p className="text-slate-600 font-black uppercase text-xs tracking-[0.3em]">No te quedes con los residuos del mercado.</p>
        </div>
        
        <Button 
          onClick={() => navigate('/mission-control')}
          className="h-24 px-20 bg-[#D4AF37] text-black text-3xl font-black uppercase italic tracking-tighter rounded-sm shadow-2xl hover:scale-105 transition-all"
        >
          ACTIVAR CONTROL TOTAL
        </Button>

        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <img src="/logo-full.svg" className="h-8 w-auto grayscale opacity-30" alt="ObraGoPro" />
            <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.5em]">ObraGoPro Industrial Core © 2026</p>
          </div>
          <div className="flex items-center gap-8 opacity-20 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_Authenticator_logo.svg" className="w-6 h-6" alt="Authenticator" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Secured by Google Cloud</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
