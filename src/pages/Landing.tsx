// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Camera,
  Activity,
  Lock,
  Cpu,
  BarChart3,
  Search,
  Users,
  Shield,
  Layers,
  Factory
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// [v22.2.1-STABLE] ObraGoPRO - Dark Industrial Luxury
// Bulletproof Version for Production Emergency

const useCases = [
  { title: "Infraestructura Vial", desc: "Puentes de gran luz y Túneles mineros." },
  { title: "Salud y Energía", desc: "Hospitales de alta complejidad y Centrales hidroeléctricas." },
  { title: "Transporte masivo", desc: "Aeropuertos y Puertos." },
  { title: "Edificación Industrial", desc: "Plantas de procesos y Radieres de alto tráfico." },
  { title: "Urbanismo", desc: "Proyectos habitacionales a gran escala." }
];

export default function Landing() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return <div className="min-h-screen bg-[#080808]" />;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2F2F2] font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* Recovery Debug Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#D4AF37] z-[9999]" />

      <nav className="fixed top-0 left-0 right-0 z-[100] px-10 py-8 flex justify-between items-center bg-[#080808]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-sm flex items-center justify-center">
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              ObraGo<span className="text-[#D4AF37]">PRO</span>
            </h1>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hidden md:block ml-4">V22.2.1 STABLE CORE</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-all">Acceso Senior</button>
          <button onClick={() => navigate('/mission-control')} className="px-8 py-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest rounded-sm">ACTIVAR CONTROL TOTAL</button>
        </div>
      </nav>

      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#080808]" />
        </div>

        <div className="relative z-20 text-center px-6 max-w-6xl mx-auto space-y-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-sm">
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.5em] text-[#D4AF37] uppercase">Sincronización Regional: Santiago / San Fernando</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-none uppercase">
              CUBICA <br />
              <span className="text-[#D4AF37]">CON IA.</span>
            </h1>
            <p className="text-lg text-slate-400 font-bold max-w-3xl mx-auto uppercase tracking-tighter">
              Auditoría técnica instantánea. Si se construye, ObraGoPRO lo optimiza.
            </p>
          </div>

          <Button onClick={() => navigate('/mission-control')} className="h-20 px-16 bg-[#D4AF37] text-black text-2xl font-black uppercase italic tracking-tighter rounded-sm shadow-[0_0_50px_rgba(212,175,55,0.3)]">
            ACTIVAR CONTROL TOTAL
          </Button>
        </div>
      </header>

      {/* Authority Infinite Slider */}
      <section className="py-20 border-y border-white/5 overflow-hidden bg-[#050505]">
        <div className="flex gap-10 animate-infinite-scroll">
          {[...useCases, ...useCases].map((item, idx) => (
            <div key={idx} className="min-w-[400px] p-8 border border-white/5 bg-[#080808] rounded-sm space-y-2">
              <h5 className="font-black uppercase italic tracking-tighter text-lg">{item.title}</h5>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-40 px-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <div className="w-16 h-1 bg-[#D4AF37]" />
            <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Photo-to-Budget <br /><span className="text-white/40">Extraction.</span></h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">Sube una imagen de tu frente de trabajo. Nuestra IA extraerá cubicaciones y costos en 3.4 segundos.</p>
            <Button onClick={() => navigate('/scanner')} className="h-16 px-10 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] hover:text-black transition-all">Probar Scanner</Button>
          </div>
          <div className="relative bg-[#080808] border border-white/5 rounded-sm p-20 flex flex-col items-center justify-center space-y-6">
             <Camera className="w-20 h-20 text-[#D4AF37] opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Vision AI AEC Engine V22.2</p>
          </div>
        </div>
      </section>

      {/* Module Ecosystem */}
      <section className="py-40 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { id: 'focus', title: 'ObraFocus', desc: 'Radar de licitaciones Mercado Público 24/7.', icon: Search },
            { id: 'control', title: 'ObraControl', desc: 'Control de estados de pago y margen.', icon: BarChart3 },
            { id: 'avan', title: 'ObraAvan', desc: 'Reportabilidad GPS y validación biométrica.', icon: Activity },
            { id: 'security', title: 'ObraSegurity', desc: 'Estándar ZYGHT automatizado.', icon: Shield },
            { id: 'study', title: 'ObraStudy', desc: 'BIM & Critical Path Mastermind.', icon: Layers },
            { id: 'plan', title: 'ObraPlan', desc: 'Planificación estratégica de recursos.', icon: Factory }
          ].map((mod) => (
            <div key={mod.id} className="p-10 border border-white/5 bg-[#0a0a0a] space-y-6 group hover:border-[#D4AF37]/20 transition-all">
              <div className="text-[#D4AF37]"><mod.icon className="w-8 h-8" /></div>
              <h4 className="text-xl font-black italic tracking-tighter uppercase">{mod.title}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-20 px-10 border-t border-white/5 bg-[#050505] text-center space-y-8">
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight">Tu competencia ya está <br /> licitando con IA.</h2>
        <Button onClick={() => navigate('/mission-control')} className="h-20 px-16 bg-[#D4AF37] text-black text-xl font-black uppercase italic tracking-tighter rounded-sm">ACTIVAR CONTROL TOTAL</Button>
        <p className="text-[9px] font-black uppercase text-slate-700 tracking-[0.5em] pt-10">ObraGoPro Industrial Core © 2026</p>
      </footer>
    </div>
  );
}
