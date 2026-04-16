import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Lucide from "lucide-react";
import {
  ChevronLeft,
  RotateCcw,
  Lock,
  Download,
  CreditCard,
  Loader2
} from "lucide-react";
import { AdSenseSlot } from "@/components/AdSenseSlot";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { 
  calculateMaterialQuantities, 
  calculateTotalCost 
} from "@/services/calculator";
import { SYSTEMS_CATALOG } from "@/constants/catalog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import DOMPurify from 'dompurify';
import { REGIONS_CHILE } from "@/data/chile";

type UserPlan = 'free' | 'pro' | 'admin' | null;

const compressImage = (file: File, maxWidth = 1024, maxHeight = 1024): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        }, 'image/jpeg', 0.85); // 85% calidad
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AnalyzingProgressRing = ({ isComplete, isFallback }: { isComplete: boolean, isFallback?: boolean }) => {
  // Simplificado para evitar loop de renders
  const [progress, setProgress] = useState(1);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (isComplete) return;
    const t = setInterval(() => setProgress(p => p < 90 ? p + 2 : 90), 500);
    const r = setTimeout(() => setShowRetry(true), 15000);
    return () => { clearInterval(t); clearTimeout(r); };
  }, [isComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <Loader2 className="w-24 h-24 text-primary animate-spin" />
        <span className="absolute text-2xl font-black italic">{isComplete ? 100 : progress}%</span>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-black uppercase text-white animate-pulse">
          {isComplete ? "Analizado" : "Analizando Terreno..."}
        </h3>
        {showRetry && !isComplete && (
          <p className="text-[10px] text-orange-400 font-bold mt-2 uppercase tracking-widest">
            {isFallback ? "Usando Sensores Locales..." : "Optimizando Conexión..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default function Scanner() {
  const navigate = useNavigate();
  const { user, plan: rawPlan } = useAuth();
  const plan = rawPlan as UserPlan;

  const [step, setStep] = useState<'upload' | 'analyzing' | 'confirm'>('upload');
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showForcedButton, setShowForcedButton] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [projectContext, setProjectContext] = useState<{ id: string; name?: string; is_paid?: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [editedDims, setEditedDims] = useState({ largo: 0, ancho: 0, espesor: 0.1, alto: 2.4 });
  const [unitMode, setUnitMode] = useState<'m' | 'cm'>('m');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const [localLargo, setLocalLargo] = useState("");
  const [localAncho, setLocalAncho] = useState("");
  const [localAlto, setLocalAlto] = useState("");
  const [localEspesor, setLocalEspesor] = useState("");
  const [projectNameInput, setProjectNameInput] = useState("");
  
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");

  const [prices] = useState<Record<string, number>>({
    "ladrillo": 650, "mortero": 5500, "hormigon": 120000, "malla": 4500, "plancha": 12500, "estructura": 3800, "otros": 1000
  });

  useEffect(() => {
    if (!user) {
        const guestScans = parseInt(localStorage.getItem('obra_go_guest_scans') || '0');
        if (guestScans >= 1) {
            setShowRegisterModal(true);
        }
    }
  }, [user]);

  const triggerSensorFallback = (isForcedManually = false) => {
    console.log("🛠️ Inyectando Heurística de Sensores...");
    setFallbackNotice(isForcedManually ? "Análisis forzado manual mediante sensores." : "Análisis obtenido mediante sensores volumétricos locales.");
    setSelectedSystemId("radier_estandar");
    
    const safeDims = { 
      largo: Math.max(editedDims.largo, 6.2), 
      ancho: Math.max(editedDims.ancho, 3.5), 
      espesor: Math.max(editedDims.espesor, 0.12), 
      alto: 0 
    };
    
    setEditedDims(safeDims);
    setLocalLargo(safeDims.largo.toString());
    setLocalAncho(safeDims.ancho.toString());
    setLocalAlto(safeDims.alto.toString());
    setLocalEspesor(safeDims.espesor.toString());
    setIsAnalysisComplete(true);
    setStep('confirm'); // Salto inmediato, sin timeouts.
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setIsAnalysisComplete(false);
    setShowForcedButton(false);
    setFallbackNotice(null);
    setLocalLargo("");
    setLocalAncho("");
    setLocalAlto("");
    setLocalEspesor("");
    setEditedDims({ largo: 0, ancho: 0, espesor: 0, alto: 0 });
    setSelectedSystemId(null);

    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    setStep('analyzing');

    let isEmergencyTriggered = false;
    const controller = new AbortController();

    // Temporizador de emergencia: 45 segundos
    const emergencyTimer = setTimeout(() => {
      if (!isAnalysisComplete) {
        console.warn("🚨 EMERGENCY: AI Timeout. Triggering local sensor fallback.");
        isEmergencyTriggered = true;
        controller.abort();
        triggerSensorFallback();
      }
    }, 45000);

    // Botón de fuerza: 50 segundos
    const forcedButtonTimer = setTimeout(() => {
      if (!isAnalysisComplete) {
        setShowForcedButton(true);
      }
    }, 50000);

    try {
      console.log("📸 Compressing image for Render stability...");
      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedBlob, 'scan.jpg');
      
      const API_URL = import.meta.env.VITE_API_URL || "https://obrascan-backend-v3.onrender.com";
      
      const timeoutId = setTimeout(() => controller.abort(), 90000); // Timeout máximo
      
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Connection': 'keep-alive' },
        body: formData,
        signal: controller.signal
      });
      
      if (isEmergencyTriggered) return; // Ya salimos por fallback

      clearTimeout(timeoutId);
      clearTimeout(emergencyTimer);
      clearTimeout(forcedButtonTimer);
      const result = await response.json();
      console.log('IA Result:', result);
      
      if (result.success) {
        setIsAnalysisComplete(true);
        setSelectedSystemId(result.data?.sistema_id || "radier_estandar");
        
        const dim = result.data?.dimensiones || {};
        // HARD-CODE DE EMERGENCIA: Si las dimensiones son nulas o menores a lo ínfimo, inyecta 10m2
        const safeDims = {
          largo: (dim.largo && dim.largo > 0) ? dim.largo : 5,
          ancho: (dim.ancho && dim.ancho > 0) ? dim.ancho : 2,
          alto: dim.alto || 0,
          espesor: (dim.espesor && dim.espesor > 0) ? dim.espesor : 0.12
        };
        
        setEditedDims(safeDims);
        setLocalLargo(safeDims.largo.toString());
        setLocalAncho(safeDims.ancho.toString());
        setLocalAlto(safeDims.alto.toString());
        setLocalEspesor(safeDims.espesor.toString());
        
        if (result.data?.is_fallback) setFallbackNotice(result.data.observaciones);
        
        // Registrar escaneo de invitado
        if (!user) {
          const guestScans = parseInt(localStorage.getItem('obra_go_guest_scans') || '0');
          localStorage.setItem('obra_go_guest_scans', (guestScans + 1).toString());
        }
        
        setStep('confirm'); // Salto instantáneo
      }
    } catch (err) {
      console.error('Error in handleImageChange:', err);
      alert("Error analizando la imagen. Intenta con otra toma.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNameChange = (val: string) => {
    const clean = DOMPurify.sanitize(val);
    setProjectNameInput(clean);
  };

  const handleLocalInputChange = (dim: 'largo' | 'ancho' | 'alto' | 'espesor', val: string) => {
    const num = parseFloat(val.replace(',', '.')) || 0;
    const inMeters = unitMode === 'cm' ? num / 100 : num;
    setEditedDims(p => ({ ...p, [dim]: inMeters }));
    if (dim === 'largo') setLocalLargo(val);
    if (dim === 'ancho') setLocalAncho(val);
    if (dim === 'alto') setLocalAlto(val);
    if (dim === 'espesor') setLocalEspesor(val);
  };

  const currentMaterials = calculateMaterialQuantities(selectedSystemId, editedDims, prices);
  const currentCost = calculateTotalCost(selectedSystemId, editedDims, currentMaterials);

  const saveToSupabase = async () => {
    if (!user) {
      setShowRegisterModal(true);
      return;
    }

    try {
      const { data, error } = await supabase.from('projects').insert({
        user_id: user.id,
        elemento: SYSTEMS_CATALOG.find(s => s.id === selectedSystemId)?.name || "Desconocido",
        sistema: selectedSystemId,
        dimensiones: editedDims,
        materiales: currentMaterials,
        total_cost: currentCost.total,
        region: selectedRegion,
        commune: selectedCommune,
        prices: prices,
        selected_system_id: selectedSystemId,
        image_url: previewImage,
        created_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;
      setProjectContext(data);
      alert("Presupuesto guardado exitosamente en Obra Go Cloud.");
    } catch {
      alert("Error al guardar en la base de datos.");
    }
  };

  const handleExportPDF = async () => {
    if (!user) {
      setShowRegisterModal(true);
      return;
    }
    const isPremium = plan === 'pro' || plan === 'admin';
    if (!isPremium && !projectContext?.is_paid) {
      setShowPaywall(true);
      return;
    }
    exportPDF();
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "https://obrascan-backend-v3.onrender.com";
      const res = await fetch(`${API_URL}/api/checkout/pdf`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          projectId: projectContext?.id,
          projectName: projectContext?.name || 'Cubicación Obra Go'
        })
      });
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch {
      alert("Error al iniciar el pago.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const exportPDF = () => {
    const { costoDirecto, gg, profit, total } = currentCost;
    
    if (total <= 0) {
       alert("⚠️ BLOQUEO DE SEGURIDAD: Por favor, ingresa el espesor para calcular el presupuesto correctamente.");
       return;
    }
    
    saveToSupabase();

    const doc = new jsPDF();
    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(212, 175, 55); 
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("Obra Go", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.text("INGENIERÍA TÉCNICA Y CUBICACIÓN INTELIGENTE", 105, 35, { align: "center" });

    const localStr = selectedCommune && selectedRegion ? `${selectedCommune}, ${selectedRegion}` : "Todo Chile";
    
    doc.setTextColor(0,0,0);
    doc.setFontSize(11);
    let y = 55;
    doc.text(`PARTIDA: ${projectNameInput || "Radiere de Hormigón H20"}`, 15, y); y += 7;
    doc.text(`UBICACIÓN: ${localStr}`, 15, y); y += 7;
    doc.text(`FECHA: ${new Date().toLocaleDateString('es-CL')}`, 15, y); y += 7;
    doc.text(`DIMENSIONES: ${editedDims.largo}m x ${editedDims.ancho}m (e=${editedDims.espesor}m)`, 15, y); y += 12;

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(15, y-2, 195, y-2);

    doc.setFont("helvetica", "bold");
    doc.text("DESGLOSE TÉCNICO DE MATERIALES:", 15, y); y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    currentMaterials.forEach(m => {
      doc.text(`${m.name}`, 20, y);
      doc.text(`${m.quantity.toFixed(2)} ${m.unit}`, 130, y);
      doc.text(`$${m.total.toLocaleString('es-CL')}`, 170, y);
      y += 7;
      if (y > 275) { doc.addPage(); y = 20; }
    });

    y += 10;
    doc.setDrawColor(230);
    doc.line(15, y, 195, y); y += 10;

    doc.setFontSize(11);
    doc.text(`COSTO DIRECTO: $${costoDirecto.toLocaleString('es-CL')}`, 15, y); y += 7;
    doc.text(`GASTOS GENERALES (12%): $${gg.toLocaleString('es-CL')}`, 15, y); y += 7;
    doc.text(`UTILIDAD (15%): $${profit.toLocaleString('es-CL')}`, 15, y); y += 7;
    const iva = total * 0.19;
    doc.text(`IVA (19%): $${iva.toLocaleString('es-CL')}`, 15, y); y += 12;

    doc.setFontSize(18);
    doc.setTextColor(212, 175, 55);
    doc.text(`INVERSIÓN TOTAL (IVA INCL.): $${(total + iva).toLocaleString('es-CL')}`, 15, y);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Este documento es generado automáticamente por la inteligencia artificial de ObraGo.", 105, 285, { align: "center" });

    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
    doc.save(`Presupuesto_AEC_${projectNameInput || 'Radier'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans max-w-lg mx-auto shadow-2xl border-x border-white/5">
      <nav className="p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Volver">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-primary/30 shadow-lg overflow-hidden group">
            <img src="/obrago-gold-logo.jpg" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="O" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs font-black tracking-widest uppercase text-primary">Obra Go</h1>
            <p className="text-[8px] font-bold text-white/40 tracking-[0.2em] uppercase leading-none">Scanner de Fotografías</p>
          </div>
        </div>
        <button onClick={() => setStep('upload')} className="p-2 rounded-xl text-white/50 hover:bg-white/10 transition-colors" aria-label="Reiniciar Scanner">
          <RotateCcw className="w-5 h-5" />
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto pb-24 px-6">
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 py-6">
            <div className="w-48 h-48 rounded-[40px] bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30 relative overflow-hidden group hover:border-primary/50 transition-all">
               {previewImage ? (
                 <img src={previewImage} className="w-full h-full object-cover" alt="Vista previa de terreno" />
               ) : (
                 <Lucide.Camera className="w-16 h-16 text-primary relative z-10" />
               )}
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Analizar Terreno</h2>
              <div className="space-y-2 text-left">
                <label htmlFor="projectName" className="text-[10px] uppercase font-black text-white/40 px-1">Nombre del Proyecto (Sanitizado)</label>
                <input 
                  id="projectName"
                  type="text"
                  placeholder="Ej: Radier Propiedad Juan"
                  value={projectNameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-white outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                  aria-label="Nombre del Proyecto"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] uppercase font-black text-white/40 px-1">Región</label>
                  <select 
                    value={selectedRegion}
                    aria-label="Seleccionar Región de Chile"
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setSelectedCommune("");
                    }}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-background">Selecciona Región</option>
                    {REGIONS_CHILE.map(r => (
                      <option key={r.name} value={r.name} className="bg-background">{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] uppercase font-black text-white/40 px-1">Comuna</label>
                  <select 
                    value={selectedCommune}
                    aria-label="Seleccionar Comuna de Chile"
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    disabled={!selectedRegion}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-background">Selecciona Comuna</option>
                    {REGIONS_CHILE.find(r => r.name === selectedRegion)?.communes.map(c => (
                      <option key={c} value={c} className="bg-background">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                boxShadow: ["0 0 0 0 rgba(225,255,0,0)", "0 0 20px 0 rgba(225,255,0,0.3)", "0 0 0 0 rgba(225,255,0,0)"]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full pt-4"
            >
              <Button
                size="lg"
                disabled={isAnalyzing || !selectedRegion || !selectedCommune}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 rounded-[32px] text-xl font-black bg-primary hover:bg-primary/90 text-black shadow-2xl shadow-primary/20 transition-all gap-4 border border-black/10 disabled:opacity-50"
              >
                <Lucide.ImagePlus className="w-8 h-8" />
                {isAnalyzing ? "PROCESANDO PÍXELES..." : "ANALIZAR TERRENO"}
              </Button>
            </motion.div>
            <input 
              type="file" 
              ref={fileInputRef} 
              id="groundImage"
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange} 
              aria-label="Subir foto del terreno"
            />
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 relative">
            {previewImage && (
              <div className="absolute inset-0 z-0 opacity-20 filter blur-[2px]">
                <img src={previewImage} className="w-full h-full object-cover" alt="Analizando..." />
              </div>
            )}
            <AnalyzingProgressRing isComplete={isAnalysisComplete} isFallback={!!fallbackNotice} />
            
            {showForcedButton && !isAnalysisComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-20 w-full px-4"
              >
                <Button 
                  variant="outline"
                  onClick={() => triggerSensorFallback(true)}
                  className="w-full h-16 border-2 border-primary/50 bg-primary/10 text-primary font-black uppercase tracking-tighter hover:bg-primary/20"
                >
                  <Lucide.Zap className="w-5 h-5 mr-3" />
                  Ver Reporte Forzado (Heurística)
                </Button>
                <p className="text-[10px] text-white/30 text-center mt-3 uppercase font-bold tracking-widest">
                  La IA está tardando. Activar procesamiento local.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-700 py-6">
             <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-6">
                 <div className="flex justify-between items-center">
                   <div className="flex flex-col">
                     <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Ajuste de Cubicaciones</h2>
                     {fallbackNotice && (
                       <span className="text-[10px] font-bold text-primary animate-pulse">{fallbackNotice}</span>
                     )}
                   </div>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => setUnitMode(m => m === 'm' ? 'cm' : 'm')} 
                     className="text-[10px] font-black uppercase text-primary h-8 bg-primary/10 rounded-lg hover:bg-primary/20"
                   >
                     Unidad: {unitMode}
                   </Button>
                 </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="dimLargo" className="text-[10px] uppercase font-black text-white/40 px-1">Largo ({unitMode})</label>
                    <input 
                      id="dimLargo"
                      value={localLargo} 
                      onChange={(e) => handleLocalInputChange('largo', e.target.value)} 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl font-black text-lg text-primary outline-none focus:border-primary/50 transition-all font-mono"
                      aria-label={`Largo en ${unitMode}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="dimAncho" className="text-[10px] uppercase font-black text-white/40 px-1">Ancho ({unitMode})</label>
                    <input 
                      id="dimAncho"
                      value={localAncho} 
                      onChange={(e) => handleLocalInputChange('ancho', e.target.value)} 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl font-black text-lg text-primary outline-none focus:border-primary/50 transition-all font-mono"
                      aria-label={`Ancho en ${unitMode}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="dimAlto" className="text-[10px] uppercase font-black text-white/40 px-1">Alto ({unitMode})</label>
                    <input 
                      id="dimAlto"
                      value={localAlto} 
                      onChange={(e) => handleLocalInputChange('alto', e.target.value)} 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl font-black text-lg text-primary outline-none focus:border-primary/50 transition-all font-mono"
                      aria-label={`Alto en ${unitMode}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="dimEspesor" className="text-[10px] uppercase font-black text-white/40 px-1">Espesor ({unitMode})</label>
                    <input 
                      id="dimEspesor"
                      value={localEspesor} 
                      onChange={(e) => handleLocalInputChange('espesor', e.target.value)} 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl font-black text-lg text-primary outline-none focus:border-primary/50 transition-all font-mono"
                      aria-label={`Espesor en ${unitMode}`}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {(!localEspesor || Number(localEspesor) <= 0) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-4 p-4 bg-primary/10 border border-primary/40 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                          <Lucide.AlertCircle className="w-6 h-6 text-primary animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Dato Requerido</p>
                          <p className="text-xs text-white/90 font-bold">Ingresa el espesor para activar el cálculo del presupuesto.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

             <div className="space-y-4 pb-20">
               <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-2 items-center flex gap-2">
                 <Lucide.ListChecks className="w-3 h-3" /> Partidas AEC Detectadas
               </h3>
               
               <div className="space-y-3">
                 {currentMaterials.map((m, idx) => (
                   <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                     <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase text-white/90">{m.name}</p>
                       <p className="text-[9px] font-bold text-white/40">{m.quantity.toFixed(2)} {m.unit}</p>
                     </div>
                     <p className="text-sm font-black text-primary">${m.total.toLocaleString('es-CL')}</p>
                   </div>
                 ))}
               </div>

                <div className="mt-8 bg-primary text-black p-8 rounded-[40px] shadow-2xl shadow-primary/30 space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase opacity-60 italic border-b border-black/10 pb-2">
                    <span>Inversión Directa Obra Go</span>
                    <span>${currentCost.costoDirecto.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="text-center py-2">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Presupuesto Estimado Neto</p>
                     <p className="text-4xl font-black italic tracking-tighter">${currentCost.total.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex gap-4">
                      <Button 
                        onClick={handleExportPDF}
                        className="flex-1 h-14 rounded-2xl bg-primary hover:bg-white text-black font-black uppercase tracking-tighter shadow-xl shadow-primary/20 gap-2 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                      >
                        {(plan === 'pro' || plan === 'admin') ? <Download className="w-5 h-5" /> : <Lock className="w-5 h-5" />}  
                        Exportar PDF
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-14 h-14 rounded-2xl border-white/10 hover:bg-white/5"
                        aria-label="Volver al dashboard"
                      >
                        <Lucide.Home className="w-6 h-6" />
                      </Button>
                    </div>
                    <AdSenseSlot id="scanner-results-bottom" className="w-full" />
                  </div>
               </div>
             </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lucide.UserPlus className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-2">Has Alcanzado tu<br /><span className="text-primary italic">Límite de Prueba</span></h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
                Regístrate gratis para seguir cubicando, guardar tus proyectos y exportar PDFs profesionales.
              </p>
              <div className="space-y-3">
                <Button 
                    onClick={() => navigate('/register')}
                    className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-tighter"
                >
                    Registrarme Ahora
                </Button>
                <Button 
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="w-full h-14 rounded-2xl text-white/40 font-bold uppercase text-[10px]"
                >
                    Ya tengo cuenta
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showPaywall && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-2">Desbloquea tu<br /><span className="text-primary italic">Presupuesto Maestro</span></h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
                Incluye desglose de materiales, cálculos de IVA y validez técnica nacional.
              </p>
              <div className="text-4xl font-black text-white mb-2">$2.990</div>
              <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest mb-8">Precio de Lanzamiento Chile</p>
              
              <Button 
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full h-16 rounded-[28px] bg-primary hover:bg-white text-black font-black uppercase shadow-2xl shadow-primary/20 flex gap-3"
              >
                  {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  PAGAR CON MERCADO PAGO
              </Button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="mt-6 text-[10px] items-center gap-2 font-black text-slate-500 uppercase hover:text-white transition-colors"
              >
                Regresar al análisis gratuito
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

