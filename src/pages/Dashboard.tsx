// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  MapPin, 
  ChevronRight, 
  Calendar,
  LogOut,
  User as UserIcon,
  FolderOpen,
  FolderOpen,
  Loader2,
  LayoutDashboard
} from "lucide-react";
import { AdSenseSlot } from "@/components/AdSenseSlot";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { REGIONS_CHILE } from "@/data/chile";

interface WorkProject {
  id: string;
  project_name: string;
  elemento: string;
  total_cost: number;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<WorkProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [newProject, setNewProject] = useState({ nombre: "", ubicacion: "" });
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Intentar Supabase
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (supabaseError) {
      console.warn("Supabase Fetch Error, falling back to local API:", supabaseError);
      
      // 2. Fallback: API Local (Offline Mode)
      try {
          const token = localStorage.getItem("token");
          const API_URL = import.meta.env.VITE_API_URL || "";
          const res = await fetch(`${API_URL}/api/projects`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
              setProjects(data.projects || []);
          }
      } catch (apiError) {
          console.error("Local API Fetch Error:", apiError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
    const welcomeSeen = localStorage.getItem('obrago_welcome_seen');
    if (!welcomeSeen) {
      setShowWelcome(true);
    }
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectContext = {
      nombre: newProject.nombre,
      region: selectedRegion,
      comuna: selectedComuna,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem("current_obra_context", JSON.stringify(projectContext));
    navigate('/scanner');
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground font-display">
      <main className="max-w-lg mx-auto min-h-screen pb-24 shadow-2xl bg-background/80 backdrop-blur-xl border-x border-border">
        
        {/* Header */}
        <header className="p-6 space-y-6">
          <div className="flex justify-between items-center bg-card/80 backdrop-blur-xl border border-white/5 p-4 rounded-[32px] shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-2xl p-0.5 overflow-hidden border border-primary/20 group">
                <img src="/obrago-gold-logo.jpg" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Obra Go Gold" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">
                  OBRA<span className="text-primary">GO</span>
                </h1>
                <span className="text-[9px] font-bold text-primary/60 uppercase tracking-[0.3em] mt-1">Scanner Pro</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')} 
                  className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary hover:bg-primary/20 transition-all"
                  title="BI HUB CEO"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
              )}
              <button onClick={logout} aria-label="support" title="Cerrar Sesión" className="p-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground hover:text-destructive transition-all">
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <UserIcon className="text-primary w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 space-y-6">
          <Button onClick={() => setIsModalOpen(true)} aria-label="support" className="w-full h-16 rounded-3xl text-lg font-black bg-primary gap-3 text-black">
            <Plus className="w-6 h-6" /> CREAR NUEVA OBRA
          </Button>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16 bg-card/40 border border-dashed border-border rounded-[40px] space-y-4">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">No hay obras aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project) => (
                  <div key={project.id} onClick={() => navigate(`/project/${project.id}`)} className="bg-[#12141a] border border-white/5 rounded-[32px] p-5 cursor-pointer hover:border-primary/40 transition-all">
                    <h4 className="text-lg font-black tracking-tighter uppercase italic text-white">{project.project_name}</h4>
                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">${project.total_cost.toLocaleString('es-CL')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 px-2 pb-24">
            <AdSenseSlot id="dashboard-footer" className="w-full" />
          </div>
        </div>

        {/* Project Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#1c1f26] border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                <h3 className="text-2xl font-black tracking-tight text-white italic uppercase mb-8">Nueva Obra</h3>
                <form onSubmit={handleCreateProject} className="space-y-6">
                  <input required aria-label="support" placeholder="Nombre del Proyecto" value={newProject.nombre} onChange={(e) => setNewProject({...newProject, nombre: e.target.value})} className="w-full h-14 bg-[#0f1115] border border-slate-800 rounded-2xl px-5 text-white font-bold" />
                  <div className="grid grid-cols-2 gap-4">
                    <select required aria-label="support" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full h-14 bg-[#0f1115] border border-slate-800 rounded-2xl px-5 text-white font-bold appearance-none">
                      <option value="" disabled>Región</option>
                      {REGIONS_CHILE.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                    <select required aria-label="support" disabled={!selectedRegion} value={selectedComuna} onChange={(e) => setSelectedComuna(e.target.value)} className="w-full h-14 bg-[#0f1115] border border-slate-800 rounded-2xl px-5 text-white font-bold appearance-none">
                      <option value="" disabled>Comuna</option>
                      {REGIONS_CHILE.find(r => r.name === selectedRegion)?.communes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Button type="submit" aria-label="support" className="w-full h-16 rounded-2xl font-black bg-primary text-black">CONFIRMAR PROYECTO</Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
