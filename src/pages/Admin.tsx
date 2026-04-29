import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Map as MapIcon, 
  ArrowLeft,
  TrendingUp,
  PieChart as PieIcon,
  DollarSign,
  Activity,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// [v2.0] BI DASHBOARD CEO - OBRA GO ELITE
// Business Intelligence avanzada para toma de decisiones estratégicas.

interface AdminStats {
  totalUsers: number;
  totalSales: number;
  totalRevenue: number;
  heatmap: { commune: string; activity: number }[];
  systems: { name: string; value: number }[];
  trends: { month: string; amount: number }[];
  recentUsers: { id: string; email: string; phone: string; status: string; created_at: string }[];
  recentProjects: { id: string; elemento: string; user_email: string; total_cost: number; date: string }[];
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

  const barData = {
    labels: stats?.trends.map(t => t.month) || [],
    datasets: [
      {
        label: 'Ingresos Mensuales (CLP)',
        data: stats?.trends.map(t => t.amount) || [],
        backgroundColor: '#D4AF37',
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels: stats?.systems.map(s => s.name) || [],
    datasets: [
      {
        data: stats?.systems.map(s => s.value) || [],
        backgroundColor: [
          '#D4AF37',
          '#C0C0C0',
          '#B87333',
          '#1e293b',
          '#334155'
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1f26',
        titleFont: { family: 'Inter', weight: 'bold' as const },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8 font-sans">
      <header className="flex items-center justify-between mb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-bold uppercase text-[10px] tracking-widest">Sistemas ObraGo</span>
        </Button>
        <div className="text-right">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">BI HUB CEO</h1>
          <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mt-2">Intelligence Dashboard V2.0</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-12 pb-24">
        {/* KPI Grid Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: "Total Usuarios", value: stats?.totalUsers || 0, color: "blue" },
            { icon: CreditCard, label: "Escaneos Realizados", value: stats?.totalSales || 0, color: "green" },
            { icon: DollarSign, label: "Revenue Estimado", value: `$${((stats?.totalRevenue || 0)).toLocaleString('es-CL')}`, color: "gold" },
            { icon: TrendingUp, label: "Crecimiento MoM", value: "+14.2%", color: "purple" }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0f1115] border border-white/5 rounded-[40px] p-8 space-y-4 hover:border-[#D4AF37]/30 transition-all shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] -mr-12 -mt-12 group-hover:bg-[#D4AF37]/10 transition-all" />
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#D4AF37] transition-all">
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">{kpi.label}</p>
                <p className="text-3xl font-black italic tracking-tighter">{kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trends */}
          <section className="bg-[#0f1115] border border-white/5 rounded-[48px] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Tendencia de Ingresos</h2>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Últimos 4 Meses</span>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              <Bar data={barData as any} options={chartOptions as any} />
            </div>
          </section>

          {/* System Distribution */}
          <section className="bg-[#0f1115] border border-white/5 rounded-[48px] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Distribución por Sistema</h2>
              </div>
            </div>
            <div className="h-[300px] flex items-center justify-center gap-8">
              <div className="w-1/2">
                <Doughnut data={doughnutData as any} options={{ ...chartOptions, cutout: '75%' } as any} />
              </div>
              <div className="w-1/2 space-y-4">
                {stats?.systems.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-black">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <section className="bg-[#0f1115] border border-white/5 rounded-[48px] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Usuarios Recientes</h2>
              </div>
            </div>
            <div className="space-y-4">
              {stats?.recentUsers.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all group">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase">{user.email}</p>
                    <p className="text-[8px] font-bold text-slate-500">{user.phone || 'Sin teléfono'} • {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${user.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {user.status}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Audits */}
          <section className="bg-[#0f1115] border border-white/5 rounded-[48px] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Últimas Auditorías</h2>
              </div>
            </div>
            <div className="space-y-4">
              {stats?.recentProjects.map((project, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase">{project.elemento}</p>
                    <p className="text-[8px] font-bold text-slate-500">{project.user_email} • ${Number(project.total_cost).toLocaleString('es-CL')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-all" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Heatmap Section */}
        <section className="bg-[#0f1115] border border-white/5 rounded-[48px] p-10 space-y-10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <MapIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black uppercase italic tracking-tighter">Actividad de Mercado por Comuna</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6">
            {stats && stats.heatmap && stats.heatmap.length > 0 ? stats.heatmap.map((item, idx) => (
              <div key={item.commune} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={idx === 0 ? "text-[#D4AF37]" : "text-slate-400"}>{item.commune}</span>
                  <span className="text-white">{item.activity} Scans</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.activity / (stats?.heatmap?.[0]?.activity || 1)) * 100}%` }}
                    className={`h-full ${idx === 0 ? "bg-[#D4AF37]" : "bg-slate-700"}`}
                  />
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-600 font-bold uppercase text-[10px] col-span-2 py-10">Sin actividad registrada</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
