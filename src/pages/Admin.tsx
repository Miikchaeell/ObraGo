import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Map as MapIcon, 
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// [v1.0] Panel de Administración CEO - Obra Go
// Diseñado para análisis comercial discreto y estratégico.

interface AdminStats {
  totalUsers: number;
  totalSales: number;
  heatmap: { commune: string; activity: number }[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data);
        }
      } catch {
        // Silencio en Admin
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 font-sans">
      <header className="flex items-center justify-between mb-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Volver
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">Panel CEO</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Obra Go Chile Business Hub</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f1115] border border-white/5 rounded-[32px] p-6 space-y-2"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Usuarios Totales</p>
            <p className="text-4xl font-black italic tracking-tighter">{stats?.totalUsers || 0}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0f1115] border border-white/5 rounded-[32px] p-6 space-y-2"
          >
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">PDFs Vendidos</p>
            <p className="text-4xl font-black italic tracking-tighter">{stats?.totalSales || 0}</p>
          </motion.div>
        </div>

        {/* Heatmap Heatmap por Comuna */}
        <section className="bg-[#0f1115] border border-white/5 rounded-[32px] p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <MapIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black uppercase italic tracking-tighter">Mapa de Actividad por Comuna</h2>
          </div>

          <div className="space-y-4">
            {stats && stats.heatmap && stats.heatmap.length > 0 ? stats.heatmap.map((item: { commune: string; activity: number }, idx: number) => (
              <div key={item.commune} className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={idx === 0 ? "text-primary" : "text-slate-400"}>{item.commune}</span>
                  <span className="text-white">{item.activity} Scans</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.activity / (stats?.heatmap?.[0]?.activity || 1)) * 100}%` }}
                    className={`h-full ${idx === 0 ? "bg-primary" : "bg-slate-700"}`}
                  />
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-600 font-bold uppercase text-[10px]">Sin actividad de mercado registrada</p>
            )}
          </div>
        </section>

        {/* Business Intelligence */}
        <div className="grid grid-cols-1 gap-4">
           <div className="bg-primary border border-primary text-black rounded-[32px] p-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Resumen de Ventas</h3>
                <p className="text-[10px] font-black uppercase opacity-60">Proyección Mensual (Sandbox)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black italic tracking-tighter">${((stats?.totalSales || 0) * 2990).toLocaleString('es-CL')}</p>
                <p className="text-[10px] font-black uppercase opacity-40">Ingreso Bruto CLP</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
