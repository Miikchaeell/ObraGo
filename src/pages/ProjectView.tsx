import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  MapPin, 
  Scan, 
  History as HistoryIcon,
  Calendar,
  Layers,
  ChevronRight,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSenseSlot } from "@/components/AdSenseSlot";
import { motion } from "framer-motion";

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<{ nombre: string; ubicacion: string } | null>(null);
  const [scans, setScans] = useState<Array<{ id: string; elemento: string; sistema: string; total_cost: number; created_at: string; image_url?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/api/work-projects/${id}`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setScans(data.scans || []);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Abriendo Obra...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
            <Scan className="w-10 h-10 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-black">Proyecto no encontrado</h2>
        <Button onClick={() => navigate("/dashboard")} variant="ghost" className="rounded-2xl font-bold uppercase text-xs">Volver al Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground font-display">
      <main className="max-w-lg mx-auto min-h-screen pb-24 shadow-2xl bg-background/80 backdrop-blur-xl border-x border-border">
        
        {/* Navbar */}
        <nav className="p-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-xl">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-sm font-black uppercase tracking-widest truncate">{project.nombre}</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {project.ubicacion}
            </p>
          </div>
          <div className="w-10 h-10" />
        </nav>

        {/* Project Header */}
        <section className="p-6 space-y-6">
            <div className="relative h-48 rounded-[40px] overflow-hidden group shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    alt="Worksite"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Estado Activo</span>
                        <h2 className="text-2xl font-black text-white tracking-tighter">{project.nombre}</h2>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-white flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span className="text-xs font-black">{scans.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button 
                    onClick={() => navigate("/scanner", { state: { projectId: id, projectName: project.nombre } })}
                    className="h-16 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs gap-3 shadow-xl shadow-primary/20"
                >
                    <Scan className="w-5 h-5" /> Escanear
                </Button>
                <Button 
                    variant="secondary"
                    className="h-16 rounded-[28px] font-black uppercase text-xs gap-3 border border-border/50"
                >
                    <ImageIcon className="w-5 h-5" /> Fotos
                </Button>
            </div>
        </section>

        {/* Scan List */}
        <section className="px-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Historial de Cubicaciones</h3>
              <HistoryIcon className="w-4 h-4 text-muted-foreground" />
            </div>

            {scans.length === 0 ? (
              <div className="text-center py-16 bg-card/40 border border-dashed border-border rounded-[40px] space-y-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto opacity-50">
                  <Scan className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black">No hay análisis aún</h4>
                  <p className="text-xs text-muted-foreground">Toma una foto de la obra para comenzar</p>
                </div>
              </div>
            ) : (
                <div className="space-y-4">
                    {scans.map((scan) => (
                        <motion.div
                            key={scan.id}
                            whileTap={{ scale: 0.98 }}
                            className="bg-card border border-border/60 rounded-[32px] p-4 hover:border-primary/40 transition-all flex gap-4 cursor-pointer group"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-secondary overflow-hidden shrink-0 border border-border/10">
                                <img 
                                    src={scan.image_url ? (scan.image_url.startsWith('http') ? scan.image_url : `${import.meta.env.VITE_API_URL}${scan.image_url}`) : '/placeholder.jpg'} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt={scan.elemento}
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-3 h-3 text-primary" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        {new Date(scan.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-sm font-black truncate">{scan.elemento}</h4>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase truncate">{scan.sistema}</p>
                                
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm font-black text-primary tabular-nums tracking-tighter">
                                        ${Number(scan.total_cost).toLocaleString('es-CL')}
                                    </span>
                                    <div className="bg-secondary p-1 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>

        {/* [v7.0] Monetization Slot */}
        <div className="px-6 py-8">
            <AdSenseSlot id="project-view-ads" className="w-full" />
        </div>
      </main>
    </div>
  );
}
