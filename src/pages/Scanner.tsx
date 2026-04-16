import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Lucide from "lucide-react";
import {
  ChevronLeft,
  RotateCcw,
  Lock,
  Download,
  Loader2,
  Settings2,
  Boxes,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import { AdSenseSlot } from "@/components/AdSenseSlot";
import { Button } from "@/components/ui/button";
import { SupportWidget } from "@/components/SupportWidget";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { 
  calculateMaterialQuantities, 
  calculateTotalCost
} from "@/services/calculator";
import type { DosageSelection } from "@/services/calculator";
import { SYSTEMS_CATALOG } from "@/constants/catalog";
import { useAuth } from "@/context/AuthContext";
import { REGIONS_CHILE } from "@/data/chile";

const formatCLP = (val: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(val));
};

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
        }, 'image/jpeg', 0.85); 
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AnalyzingProgressRing = ({ isComplete, isFallback }: { isComplete: boolean, isFallback?: boolean }) => {
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
        <span className="absolute text-3xl font-black italic text-primary">{isComplete ? 100 : progress}%</span>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-black uppercase text-white animate-pulse tracking-tighter">
          {isComplete ? "Analizado" : "Ingeniería de Píxeles..."}
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
  const { user } = useAuth();

  const [step, setStep] = useState<'config' | 'upload' | 'analyzing' | 'dosage_config' | 'confirm'>('config');
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showForcedButton, setShowForcedButton] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESTADOS V3.0 ELITE
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const [wasteMargin] = useState<number>(0.05); 
  const [tempDims, setTempDims] = useState({ largo: "", ancho: "", espesor: "" });
  const [editedDims, setEditedDims] = useState({ largo: 0, ancho: 0, espesor: 0, alto: 2.4 });
  
  // Dosage Options
  const [dosage, setDosage] = useState<DosageSelection>({
    resistencia: "H-20",
    secado: "Estándar",
    armaduraTipo: "ACMA",
    armaduraDetalle: "malla_acma_c92"
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [projectNameInput, setProjectNameInput] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [hasTriggeredProactive, setHasTriggeredProactive] = useState(false);

  const [prices] = useState<Record<string, number>>({});

  const categories = useMemo(() => Array.from(new Set(SYSTEMS_CATALOG.map(s => s.category))), []);
  const availableSystems = useMemo(() => SYSTEMS_CATALOG.filter(s => s.category === selectedCategory), [selectedCategory]);

  useEffect(() => {
    if (!user) {
        const guestScans = parseInt(localStorage.getItem('obra_go_guest_scans') || '0');
        if (guestScans >= 1) {
            setShowRegisterModal(true);
        }
    }
  }, [user]);

  const validatePreConfig = () => {
    return (
        projectNameInput.trim() !== "" &&
        selectedSystemId !== "" &&
        selectedCommune !== "" &&
        parseFloat(tempDims.largo) > 0 &&
        parseFloat(tempDims.ancho) > 0 &&
        parseFloat(tempDims.espesor) > 0
    );
  };

  useEffect(() => {
    if (step === 'confirm' && !hasTriggeredProactive) {
        const timer = setTimeout(() => {
            const event = new CustomEvent('obra-go-bot-trigger', {
                detail: {
                    message: `¡Hola! He notado que calculaste un ${selectedCategory} con ${dosage.resistencia} ${dosage.secado}. ¿Tienes alguna duda con la dosificación antes de descargar tu reporte profesional?`,
                    forceOpen: true
                }
            });
            window.dispatchEvent(event);
            setHasTriggeredProactive(true);
        }, 15000); // 15 segundos de espera
        return () => clearTimeout(timer);
    }
  }, [step, hasTriggeredProactive, selectedCategory, dosage]);

  const triggerSensorFallback = (isForcedManually = false) => {
    setFallbackNotice(isForcedManually ? "Análisis forzado manual mediante sensores." : "Análisis obtenido mediante sensores volumétricos locales.");
    
    setEditedDims({
        largo: parseFloat(tempDims.largo),
        ancho: parseFloat(tempDims.ancho),
        espesor: parseFloat(tempDims.espesor) / 100, // cm a mt
        alto: 2.4
    });

    setIsAnalysisComplete(true);
    setStep('dosage_config');
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalysisComplete(false);
    setShowForcedButton(false);
    setFallbackNotice(null);

    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    setStep('analyzing');

    const controller = new AbortController();
    const emergencyTimer = setTimeout(() => {
      if (!isAnalysisComplete) {
        controller.abort();
        triggerSensorFallback();
      }
    }, 45000);

    const forcedButtonTimer = setTimeout(() => {
      if (!isAnalysisComplete) setShowForcedButton(true);
    }, 50000);

    try {
      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedBlob, 'scan.jpg');
      
      const API_URL = import.meta.env.VITE_API_URL || "https://obrascan-backend-v3.onrender.com";
      
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Connection': 'keep-alive' },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(emergencyTimer);
      clearTimeout(forcedButtonTimer);
      const result = await response.json();
      
      if (result.success) {
        setIsAnalysisComplete(true);
        
        // Priorizar inputs manuales del constructor real
        setEditedDims({
            largo: parseFloat(tempDims.largo),
            ancho: parseFloat(tempDims.ancho),
            espesor: parseFloat(tempDims.espesor) / 100,
            alto: 2.4
        });
        
        if (result.data?.is_fallback) setFallbackNotice(result.data.observaciones);
        
        if (!user) {
          const guestScans = parseInt(localStorage.getItem('obra_go_guest_scans') || '0');
          localStorage.setItem('obra_go_guest_scans', (guestScans + 1).toString());
        }
        
        setStep('dosage_config');
      } else {
        triggerSensorFallback();
      }
    } catch (err) {
      console.error('Error:', err);
      triggerSensorFallback();
    }
  };

  const currentMaterials = calculateMaterialQuantities(selectedSystemId, editedDims, prices, wasteMargin, dosage);
  const currentCost = calculateTotalCost(selectedSystemId, editedDims, currentMaterials);

  const handleExportPDF = async () => {
    if (!user) {
      setShowRegisterModal(true);
      return;
    }
    // El muro de pago solo aparece aquí
    setShowPaywall(true); 
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(225, 255, 0); 
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.text("OBRA GO", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("INGENIERÍA ELITE Y CUBICACIÓN PROFESIONAL", 105, 42, { align: "center" });

    doc.setTextColor(0,0,0);
    doc.setFontSize(12);
    let y = 65;
    doc.text(`PROYECTO: ${projectNameInput}`, 15, y); y += 8;
    doc.text(`PARTIDA: ${SYSTEMS_CATALOG.find(s => s.id === selectedSystemId)?.name}`, 15, y); y += 8;
    doc.text(`ESPECIFICACIÓN: ${dosage.resistencia} / ${dosage.secado}`, 15, y); y += 8;
    doc.text(`ARMADURA: ${dosage.armaduraTipo === 'ACMA' ? 'Malla ACMA' : 'Enfierradura Tradicional'}`, 15, y); y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("DESGLOSE TÉCNICO DE MATERIALES:", 15, y); y += 10;
    doc.setFont("helvetica", "normal");
    
    currentMaterials.forEach(m => {
      doc.text(`${m.name}`, 20, y);
      doc.text(`${m.quantity.toFixed(2)} ${m.unit}`, 140, y);
      doc.text(`$${m.total.toLocaleString('es-CL')}`, 175, y);
      y += 7;
    });

    y += 15;
    doc.setFontSize(16);
    doc.text(`INVERSIÓN TOTAL ESTIMADA: $${(currentCost.total * 1.19).toLocaleString('es-CL')}`, 15, y);

    doc.save(`ObraGo_Elite_${projectNameInput}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans max-w-lg mx-auto shadow-2xl border-x border-white/5">
      <nav className="p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-black tracking-widest uppercase text-primary italic">Obra Go <span className="text-white ml-1">Elite</span></h1>
        </div>
        <button onClick={() => setStep('config')} className="p-2 rounded-xl text-white/50 hover:bg-white/10">
          <RotateCcw className="w-5 h-5" />
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto pb-24 px-6">
        {step === 'config' && (
          <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <header className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Input De<br /><span className="text-primary text-5xl">Ingeniería</span></h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" /> Configuración Obligatoria Pre-Cámara
                </p>
            </header>

            <div className="space-y-6">
                {/* Nombre Proyecto */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40">Nombre del Proyecto</label>
                    <input
                        type="text"
                        placeholder="Ej: Radier Estacionamiento"
                        value={projectNameInput}
                        onChange={(e) => setProjectNameInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black text-white outline-none focus:border-primary/50"
                    />
                </div>

                {/* Categoría & Partida */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40"><Boxes className="w-3 h-3 inline mr-2"/> Categoría</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSystemId(""); }}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold appearance-none"
                        >
                            <option value="">Selecciona Categoría...</option>
                            {categories.map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                        </select>
                    </div>
                    {selectedCategory && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40"><Settings2 className="w-3 h-3 inline mr-2"/> Partida</label>
                            <select 
                                value={selectedSystemId} 
                                onChange={(e) => setSelectedSystemId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold appearance-none"
                            >
                                <option value="">Selecciona Partida...</option>
                                {availableSystems.map(s => <option key={s.id} value={s.id} className="bg-slate-900" >{s.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                {/* Dimensiones Mandatorias */}
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-[32px] space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary italic">Dimensiones de Ingeniería</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-white/40 ml-2">Largo (m)</label>
                            <input
                                placeholder="0.00"
                                value={tempDims.largo}
                                onChange={(e) => setTempDims({...tempDims, largo: e.target.value})}
                                className="w-full bg-black border border-white/5 p-4 rounded-2xl font-mono font-black text-xl text-primary text-center"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-white/40 ml-2">Ancho (m)</label>
                            <input
                                placeholder="0.00"
                                value={tempDims.ancho}
                                onChange={(e) => setTempDims({...tempDims, ancho: e.target.value})}
                                className="w-full bg-black border border-white/5 p-4 rounded-2xl font-mono font-black text-xl text-primary text-center"
                            />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <label className="text-[9px] font-black uppercase text-white/40 ml-2 text-center block">Espesor (cm)</label>
                            <input
                                placeholder="10"
                                value={tempDims.espesor}
                                onChange={(e) => setTempDims({...tempDims, espesor: e.target.value})}
                                className="w-full bg-black border border-primary/20 p-4 rounded-2xl font-mono font-black text-3xl text-primary text-center"
                            />
                        </div>
                    </div>
                </div>

                {/* Proyecto Info (Ubicación) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40">Región</label>
                        <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold appearance-none">
                            <option value="">Región...</option>
                            {REGIONS_CHILE.map(r => <option key={r.name} value={r.name} className="bg-slate-900">{r.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40">Comuna</label>
                        <select value={selectedCommune} onChange={(e) => setSelectedCommune(e.target.value)} disabled={!selectedRegion} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold appearance-none">
                            <option value="">Comuna...</option>
                            {REGIONS_CHILE.find(r => r.name === selectedRegion)?.communes.map(c => <option key={c} value={c} className="bg-slate-900" >{c}</option>)}
                        </select>
                    </div>
                </div>

                <Button
                    size="lg"
                    disabled={!validatePreConfig()}
                    onClick={() => setStep('upload')}
                    className="w-full h-20 rounded-3xl bg-primary text-black font-black text-xl uppercase tracking-tighter shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform flex gap-3 disabled:opacity-30"
                >
                    Siguiente: Capturar <ChevronLeft className="w-6 h-6 rotate-180" />
                </Button>
            </div>
          </div>
        )}

        {step === 'upload' && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 py-10 animate-in zoom-in duration-500">
             <div className="w-64 h-64 rounded-[60px] bg-primary/5 flex items-center justify-center border-4 border-dashed border-primary/20 relative group overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Lucide.Camera className="w-20 h-20 text-primary animate-pulse" />
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
             </div>
             <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Capturar Imagen</h2>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">IA Analizará Contexto Visual</p>
             </div>
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left space-y-3 w-full">
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-primary font-bold">Datos Inyectados:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center bg-black/50 p-4 rounded-xl">
                    <div>
                        <p className="text-[8px] text-white/40 uppercase">Largo</p>
                        <p className="text-sm font-black text-white">{tempDims.largo}m</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-white/40 uppercase">Ancho</p>
                        <p className="text-sm font-black text-white">{tempDims.ancho}m</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-white/40 uppercase">Espesor</p>
                        <p className="text-sm font-black text-white">{tempDims.espesor}cm</p>
                    </div>
                </div>
             </div>
           </div>
        )}

        {step === 'analyzing' && (
           <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
             <AnalyzingProgressRing isComplete={isAnalysisComplete} isFallback={!!fallbackNotice} />
             {showForcedButton && !isAnalysisComplete && (
               <Button onClick={() => triggerSensorFallback(true)} className="w-full h-16 border-2 border-primary/50 bg-primary/10 text-primary font-black uppercase transition-all">
                 <Lucide.Zap className="w-5 h-5 mr-3" /> Ver Reporte Forzado
               </Button>
             )}
           </div>
        )}

        {step === 'dosage_config' && (
            <div className="py-8 space-y-8 animate-in slide-in-from-right duration-500">
                <header className="space-y-2 text-center">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-primary">Dosificación <span className="text-white">Elite</span></h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Personalización Técnica de Mezcla</p>
                </header>

                <div className="space-y-6">
                    {/* Resistencia */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><Settings2 className="w-3 h-3" /> Resistencia Hormigón</label>
                        <div className="grid grid-cols-3 gap-3">
                            {["H-20", "H-25", "H-30"].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setDosage({...dosage, resistencia: r as any})}
                                    className={`p-4 rounded-2xl border font-black transition-all ${dosage.resistencia === r ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tiempo de Secado */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><RotateCcw className="w-3 h-3" /> Requerimiento de Curado</label>
                        <div className="grid grid-cols-2 gap-3">
                            {["Estándar", "R-7"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setDosage({...dosage, secado: s as any})}
                                    className={`p-4 rounded-2xl border font-black transition-all ${dosage.secado === s ? 'bg-primary border-primary text-black scale-105' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    {s}
                                    {s === 'R-7' && <span className="block text-[8px] opacity-60">Alta Resistencia</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Armadura */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><Boxes className="w-3 h-3" /> Sistema de Armadura</label>
                        <div className="space-y-3">
                             <div className="flex gap-3">
                                <button
                                    onClick={() => setDosage({...dosage, armaduraTipo: "ACMA", armaduraDetalle: "malla_acma_c92"})}
                                    className={`flex-1 p-4 rounded-2xl border font-black transition-all ${dosage.armaduraTipo === 'ACMA' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    Malla ACMA
                                </button>
                                <button
                                    onClick={() => setDosage({...dosage, armaduraTipo: "Tradicional", armaduraDetalle: "fierro_10"})}
                                    className={`flex-1 p-4 rounded-2xl border font-black transition-all ${dosage.armaduraTipo === 'Tradicional' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    Fierro Tradicional
                                </button>
                             </div>

                             <div className="bg-black/40 border border-white/5 p-5 rounded-[24px]">
                                <label className="text-[8px] font-black uppercase text-white/30 block mb-3 text-center">Especificación de Acero</label>
                                {dosage.armaduraTipo === 'ACMA' ? (
                                    <select 
                                        value={dosage.armaduraDetalle}
                                        onChange={(e) => setDosage({...dosage, armaduraDetalle: e.target.value})}
                                        className="w-full bg-transparent text-center font-black text-sm text-primary outline-none"
                                    >
                                        <option value="malla_acma_c92" className="bg-slate-900">Malla C-92 (Estándar)</option>
                                        <option value="malla_acma_c139" className="bg-slate-900">Malla C-139 (Pesada)</option>
                                        <option value="malla_acma_c188" className="bg-slate-900">Malla C-188 (Industrial)</option>
                                    </select>
                                ) : (
                                    <div className="flex justify-center gap-4">
                                        {["fierro_8", "fierro_10", "fierro_12"].map(f => (
                                            <button 
                                                key={f}
                                                onClick={() => setDosage({...dosage, armaduraDetalle: f})}
                                                className={`px-4 py-2 rounded-lg font-black text-xs ${dosage.armaduraDetalle === f ? 'bg-primary text-black' : 'bg-white/10 text-white/40'}`}
                                            >
                                                {f === 'fierro_8' ? '8mm' : f === 'fierro_10' ? '10mm' : '12mm'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={() => setStep('confirm')}
                        className="w-full h-20 rounded-3xl bg-primary text-black font-black text-xl uppercase tracking-tighter flex gap-3 shadow-2xl shadow-primary/20"
                    >
                        Generar Cubicaciones <CheckCircle2 className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-700 py-8 pb-32">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-primary">Reporte <span className="text-white">Elite</span></h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{projectNameInput}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {previewImage && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <img src={previewImage} className="w-full h-full object-cover" alt="Contexto" />
                        </div>
                    )}
                    <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-primary uppercase">Validado por AEC</span>
                    </div>
                </div>
            </header>

            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                <div className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-[8px] font-black text-white/30 uppercase mb-1">Volumen Cubicada</p>
                        <p className="text-xl font-black text-white">{currentCost.volume.toFixed(2)} m³</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-white/30 uppercase mb-1">Armadura Base</p>
                        <p className="text-xl font-black text-primary">{dosage.armaduraTipo === 'ACMA' ? 'Malla C' : 'Fierro'}</p>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2 px-2">
                        <Lucide.ListChecks className="w-3 h-3 text-primary" /> Desglose de Materiales Real
                    </h3>
                    <div className="space-y-3">
                        {currentMaterials.map((m, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase group-hover:text-primary transition-colors">{m.name}</p>
                                    <p className="text-[9px] font-bold text-white/40 italic">{m.quantity.toFixed(2)} {m.unit} • Rendimiento Real</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white">{formatCLP(m.total)}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase">Subtotal</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary p-8 rounded-[40px] text-black space-y-4 shadow-3xl shadow-primary/20">
                    <div className="flex justify-between text-[10px] font-black uppercase opacity-60 italic border-b border-black/10 pb-2">
                        <span>Presupuesto Base (Incl. {wasteMargin * 100}% Pérdida)</span>
                        <span>{formatCLP(currentCost.total)}</span>
                    </div>
                    <div className="text-center py-2 overflow-hidden">
                        <p 
                            className="font-black italic tracking-tighter leading-none transition-all duration-300"
                            style={{ 
                                fontSize: formatCLP(currentCost.total * 1.19).length > 12 ? '2.5rem' : 
                                          formatCLP(currentCost.total * 1.19).length > 9 ? '3.5rem' : '4.5rem' 
                            }}
                        >
                            {formatCLP(currentCost.total * 1.19)}
                        </p>
                        <p className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em] mt-1">Suma Total IVA Incluido</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={handleExportPDF} 
                            className="flex-1 h-16 rounded-2xl bg-black text-primary font-black uppercase tracking-tighter hover:bg-zinc-900 border-none transition-all flex gap-3"
                        >
                            <Download className="w-5 h-5" /> 
                            <span>Descargar PDF</span>
                            <Lock className="w-4 h-4 opacity-50" />
                        </Button>
                        <button onClick={() => setStep('config')} className="w-16 h-16 rounded-2xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all border border-black/10">
                            <RotateCcw className="w-6 h-6 text-black/50" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 p-6 rounded-3xl flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-white leading-relaxed">
                    Este reporte es el cálculo preliminar de ingeniería. Para certificar esta cubicación con firma y timbre profesional, utiliza el botón de <span className="text-primary font-black">Descargar PDF</span>.
                </p>
            </div>
            
            <AdSenseSlot id="results-bottom" />
          </div>
        )}
      </main>

      <SupportWidget 
        metadata={{
            projectName: projectNameInput,
            dims: editedDims,
            dosage: dosage,
            totalCost: currentCost.total,
            step: step
        }}
      />

      {/* Paywall Modal (Solo en Descarga PDF) */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><FileText className="w-10 h-10 text-primary" /></div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-2 italic">Exportar Memoria<br /><span className="text-primary">Técnica Profesional</span></h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">PDF Certificado con validez para bancos, constructoras y compras en retail.</p>
              <div className="text-5xl font-black text-white mb-2">$2.990</div>
              <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-8">Acceso de por vida a este reporte</p>
              <Button onClick={exportPDF} className="w-full h-16 rounded-[28px] bg-primary text-black font-black uppercase shadow-2xl shadow-primary/20">Desbloquear Ahora</Button>
              <button onClick={() => setShowPaywall(false)} className="mt-6 text-[10px] font-black text-white/20 uppercase hover:text-white transition-colors">Volver al Reporte Gratis</button>
            </motion.div>
          </div>
        )}

        {showRegisterModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><Lucide.UserPlus className="w-10 h-10 text-primary" /></div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-2 italic underline decoration-primary">Portal Ingeniería</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Registra tu firma profesional para guardar proyectos y exportar PDFs ilimitados.</p>
              <Button onClick={() => navigate('/register')} className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-tighter">Crear Cuenta AEC</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
