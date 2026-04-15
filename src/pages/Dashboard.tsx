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
  Loader2,
  MessageCircle
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
      const { data, error } = await supabase
        .from('projects') // Cambiado de 'scans' a 'projects' para consistencia
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch {
      // Shipped to Production
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
    
    // Check for Welcome Modal
    const welcomeSeen = localStorage.getItem('obrago_welcome_seen');
    if (!welcomeSeen) {
      setShowWelcome(true);
    }
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // [v6.0] Instant Commercial Persistence
    const projectContext = {
      nombre: newProject.nombre,
      region: selectedRegion,
      comuna: selectedComuna,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem("current_obra_context", JSON.stringify(projectContext));
    
    // Jump to Scanner to take photo
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
              <button 
                onClick={logout}
                title="Cerrar Sesión"
                className="p-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground hover:text-destructive transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <UserIcon className="text-primary w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">Panel de Obras</h2>
            <p className="text-muted-foreground text-sm font-medium">Gestiona tus proyectos vinculados a la nube</p>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 space-y-6">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full h-16 rounded-3xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3 text-black"
          >
            <Plus className="w-6 h-6" /> 
            CREAR NUEVA OBRA
          </Button>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Presupuestos Guardados</h3>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Cloud...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16 bg-card/40 border border-dashed border-border rounded-[40px] space-y-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-white">No hay obras aún</h4>
                  <p className="text-xs text-muted-foreground">Comienza creando tu primer proyecto</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="group bg-[#12141a] border border-white/5 rounded-[32px] p-5 hover:border-primary/40 transition-all shadow-sm hover:shadow-xl cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors text-white">{project.project_name}</h4>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="font-bold text-[10px] uppercase tracking-wide text-primary/70">{project.elemento}</span>
                          <span className="text-white/20">•</span>
                          <span className="font-bold text-[10px] uppercase tracking-wide">${project.total_cost.toLocaleString('es-CL')}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 px-2 pb-24">
            <AdSenseSlot id="dashboard-footer" className="w-full" />
          </div>
        </div>

        {/* WhatsApp Support Button */}
        <div className="fixed bottom-6 right-6 z-[100]">
          <Button
            onClick={() => window.open('https://wa.me/56900000000?text=Hola%20ObraGo%20necesito%20ayuda', '_blank')}
            className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-2xl flex items-center justify-center group p-0"
            aria-label="Soporte WhatsApp"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-16 bg-black text-white text-[10px] font-black uppercase px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
            >
              Soporte Premium
            </motion.span>
          </Button>
        </div>

        {/* Create Project Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-[#1c1f26] border border-slate-800 rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-white italic uppercase">Nueva Obra</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuración Inicial</p>
                  </div>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="nombreProyecto" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nombre del Proyecto</label>
                    <input 
                      id="nombreProyecto"
                      required
                      placeholder="Ej: Edificio Central Santiago"
                      value={newProject.nombre}
                      onChange={(e) => setNewProject({...newProject, nombre: e.target.value})}
                      className="w-full h-14 bg-[#0f1115] border border-slate-800 rounded-2xl px-5 text-sm font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="region" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Región</label>
                      <select
                        id="region"
                        required
                        value={selectedRegion}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value);
                          setSelectedComuna("");
                        }}
                        className="w-full h-14 bg-[#0f1115] border border-slate-800 rounded-2xl px-5 text-sm font-bold text-white focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Seleccionar...</option>
                        {REGIONS_CHILE.map(r => (
                          <option key={r.name} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="comuna" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Comuna</label>
                      <select
                        id="comuna"
                        required
                        disabled={!selectedRegion}
                        value={selectedComuna}
                        onChange={(e) => setSelectedComuna(e.target.value)}
                        className="w-full h-14 bg-[#0f1115] border border-slate-800 rounded-2xl px-5 text-sm font-bold text-white focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Seleccionar...</option>
                        {REGIONS_CHILE.find(r => r.name === selectedRegion)?.communes.map(comuna => (
                          <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                      </select>
                    </div>
                  </div>


                  <div className="flex flex-col gap-3 pt-6 border-t border-slate-800">
                    <Button 
                      type="submit"
                      className="w-full h-16 rounded-2xl font-black uppercase text-lg bg-primary text-black shadow-[0_20px_40px_-12px_rgba(225,255,0,0.3)] hover:bg-[#d4f000] hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-yellow-600"
                    >
                      CONFIRMAR PROYECTO
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full h-10 rounded-xl font-bold uppercase text-[10px] text-slate-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Welcome Onboarding Modal */}
        <AnimatePresence>
          {showWelcome && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center shadow-2xl relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
                
                <div className="w-24 h-24 bg-black rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-2xl overflow-hidden shadow-primary/10 group">
                   <img src="/obrago-gold-logo.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Logo" />
                </div>
                
                <h3 className="text-3xl font-black tracking-tighter italic uppercase text-white mb-2">
                  ¡BIENVENIDO A<br /><span className="text-primary">OBRA GO</span>!
                </h3>
                
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-8">
                  Operación Comercial Chile v1.0
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-left mb-10">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">1</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white">CAPTURA EL TERRENO</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Sube una foto y deja que la IA analice.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">2</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white">DEFINE DIMENSIONES</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Ajusta largo, ancho y espesor con precisión.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">3</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white">EXPORTA Y SINCRONIZA</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Genera el PDF AEC o envía por WhatsApp.</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    localStorage.setItem('obrago_welcome_seen', 'true');
                    setShowWelcome(false);
                  }}
                  className="w-full h-16 rounded-[28px] bg-primary hover:bg-white text-black font-black uppercase text-sm tracking-widest shadow-2xl shadow-primary/20 transition-all border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                >
                  COMENZAR AHORA
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

