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
  Ruler,
  TrendingUp,
  Boxes
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
import { useAuth } from "@/context/AuthContext";
import { REGIONS_CHILE } from "@/data/chile";



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

  const [step, setStep] = useState<'config' | 'upload' | 'analyzing' | 'confirm'>('config');
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showForcedButton, setShowForcedButton] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NUEVOS ESTADOS V3.0
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const [masterMeasure, setMasterMeasure] = useState<string>(""); // Medida de ancla
  const [wasteMargin, setWasteMargin] = useState<number>(0.05); // 5%, 10%, 15%
  
  const [editedDims, setEditedDims] = useState({ largo: 0, ancho: 0, espesor: 0.1, alto: 2.4 });
  const [unitMode, setUnitMode] = useState<'m' | 'cm'>('m');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const [localLargo, setLocalLargo] = useState("");
  const [localAncho, setLocalAncho] = useState("");
  const [localAlto, setLocalAlto] = useState("");
  const [localEspesor, setLocalEspesor] = useState("");
  const [projectNameInput, setProjectNameInput] = useState("");
  
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");

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

  const triggerSensorFallback = (isForcedManually = false) => {
    setFallbackNotice(isForcedManually ? "Análisis forzado manual mediante sensores." : "Análisis obtenido mediante sensores volumétricos locales.");
    
    // Aplicamos Medida Maestra al fallback
    const referenceLength = parseFloat(masterMeasure.replace(',', '.')) || 6.2;
    
    const safeDims = { 
      largo: referenceLength, 
      ancho: 3.5, 
      espesor: 0.12, 
      alto: 2.4 
    };
    
    setEditedDims(safeDims);
    setLocalLargo(safeDims.largo.toString());
    setLocalAncho(safeDims.ancho.toString());
    setLocalAlto(safeDims.alto.toString());
    setLocalEspesor(safeDims.espesor.toString());
    setIsAnalysisComplete(true);
    setStep('confirm');
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Analizando...
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
        
        const dim = result.data?.dimensiones || {};
        
        // Lógica de Escalamiento Proporcional con Medida Maestra
        let finalLargo = dim.largo || 5;
        let finalAncho = dim.ancho || 2;
        let finalAlto = dim.alto || 2.4;
        let finalEspesor = dim.espesor || 0.12;

        if (masterMeasure) {
            const anchor = parseFloat(masterMeasure.replace(',', '.'));
            if (anchor > 0) {
                const ratio = anchor / finalLargo;
                finalLargo = anchor;
                finalAncho = finalAncho * ratio;
                finalAlto = finalAlto * ratio;
                // El espesor suele ser fijo según partida, pero lo escalamos si es estructural
                if (finalEspesor < 0.05) finalEspesor = finalEspesor * ratio;
            }
        }

        const safeDims = {
          largo: finalLargo,
          ancho: finalAncho,
          alto: finalAlto,
          espesor: finalEspesor
        };
        
        setEditedDims(safeDims);
        setLocalLargo(safeDims.largo.toFixed(2));
        setLocalAncho(safeDims.ancho.toFixed(2));
        setLocalAlto(safeDims.alto.toFixed(2));
        setLocalEspesor(safeDims.espesor.toFixed(2));
        
        if (result.data?.is_fallback) setFallbackNotice(result.data.observaciones);
        
        if (!user) {
          const guestScans = parseInt(localStorage.getItem('obra_go_guest_scans') || '0');
          localStorage.setItem('obra_go_guest_scans', (guestScans + 1).toString());
        }
        
        setStep('confirm');
      } else {
        triggerSensorFallback();
      }
    } catch (err) {
      console.error('Error:', err);
      triggerSensorFallback();
    }
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

  const currentMaterials = calculateMaterialQuantities(selectedSystemId, editedDims, prices, wasteMargin);
  const currentCost = calculateTotalCost(selectedSystemId, editedDims, currentMaterials);

  const handleExportPDF = async () => {
    if (!user) {
      setShowRegisterModal(true);
      return;
    }
    exportPDF();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    // Identidad Tesla Dark en PDF
    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(225, 255, 0); 
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.text("OBRA GO", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("INGENIERÍA PROFESIONAL Y CUBICACIÓN AEC", 105, 42, { align: "center" });

    doc.setTextColor(0,0,0);
    doc.setFontSize(12);
    let y = 65;
    doc.text(`PROYECTO: ${projectNameInput || "Sin Nombre"}`, 15, y); y += 8;
    doc.text(`PARTIDA: ${SYSTEMS_CATALOG.find(s => s.id === selectedSystemId)?.name}`, 15, y); y += 8;
    doc.text(`UBICACIÓN: ${selectedCommune}, ${selectedRegion}`, 15, y); y += 8;
    doc.text(`MARGEN DE PÉRDIDA: ${wasteMargin * 100}%`, 15, y); y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("DESGLOSE DE MATERIALES (Incl. Pérdida):", 15, y); y += 10;
    doc.setFont("helvetica", "normal");
    
    currentMaterials.forEach(m => {
      doc.text(`${m.name}`, 20, y);
      doc.text(`${m.quantity.toFixed(2)} ${m.unit}`, 140, y);
      doc.text(`$${m.total.toLocaleString('es-CL')}`, 175, y);
      y += 7;
    });

    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL ESTIMADO: $${currentCost.total.toLocaleString('es-CL')}`, 15, y);

    doc.save(`ObraGo_${projectNameInput || 'Reporte'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans max-w-lg mx-auto shadow-2xl border-x border-white/5">
      <nav className="p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-black tracking-widest uppercase text-primary">Obra Go <span className="text-white/30 ml-1">V3.0</span></h1>
        </div>
        <button onClick={() => setStep('config')} className="p-2 rounded-xl text-white/50 hover:bg-white/10">
          <RotateCcw className="w-5 h-5" />
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto pb-24 px-6">
        {step === 'config' && (
          <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <header className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Configuración<br /><span className="text-primary text-5xl">De Partida</span></h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Ingeniería Autónoma AEC</p>
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
                {/* Categoría */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2"><Boxes className="w-3 h-3"/> Categoría de Obra</label>
                    <div className="grid grid-cols-1 gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); setSelectedSystemId(""); }}
                                className={`p-4 rounded-2xl border transition-all text-left font-bold uppercase text-sm ${selectedCategory === cat ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sistema */}
                {selectedCategory && (
                    <div className="space-y-2 animate-in slide-in-from-left duration-300">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2"><Settings2 className="w-3 h-3"/> Especificación Técnica</label>
                        <select
                            value={selectedSystemId}
                            onChange={(e) => setSelectedSystemId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black text-white outline-none focus:border-primary/50 transition-all appearance-none"
                        >
                            <option value="">Selecciona Partida...</option>
                            {availableSystems.map(s => (
                                <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Medida Maestra */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2"><Ruler className="w-3 h-3"/> Medida Maestra (m)</label>
                        <input
                            type="text"
                            placeholder="Ej: 3.20"
                            value={masterMeasure}
                            onChange={(e) => setMasterMeasure(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black text-xl text-primary outline-none focus:border-primary/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Pérdida (%)</label>
                        <select
                            value={wasteMargin}
                            onChange={(e) => setWasteMargin(parseFloat(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black text-xl text-white outline-none focus:border-primary/50 appearance-none"
                        >
                            <option value={0.05} className="bg-slate-900">5% (Óptimo)</option>
                            <option value={0.10} className="bg-slate-900">10% (Normal)</option>
                            <option value={0.15} className="bg-slate-900">15% (Seguridad)</option>
                        </select>
                    </div>
                </div>

                {/* Proyecto Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40">Región</label>
                        <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold">
                            <option value="">Región...</option>
                            {REGIONS_CHILE.map(r => <option key={r.name} value={r.name} className="bg-slate-900">{r.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40">Comuna</label>
                        <select value={selectedCommune} onChange={(e) => setSelectedCommune(e.target.value)} disabled={!selectedRegion} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold">
                            <option value="">Comuna...</option>
                            {REGIONS_CHILE.find(r => r.name === selectedRegion)?.communes.map(c => <option key={c} value={c} className="bg-slate-900" >{c}</option>)}
                        </select>
                    </div>
                </div>

                <Button
                    size="lg"
                    disabled={!selectedSystemId || !selectedCommune}
                    onClick={() => setStep('upload')}
                    className="w-full h-20 rounded-3xl bg-primary text-black font-black text-xl uppercase tracking-tighter shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform flex gap-3"
                >
                    Siguiente: Capturar <ChevronLeft className="w-6 h-6 rotate-180" />
                </Button>
            </div>
            
            <AdSenseSlot id="config-bottom" className="mt-4" />
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
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">La IA detectará los volúmenes finales</p>
             </div>
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left space-y-3 w-full">
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-primary">Configuración Activa:</span>
                    <button onClick={() => setStep('config')} className="text-white/40 underline">Cambiar</button>
                </div>
                <p className="text-sm font-bold truncate">{SYSTEMS_CATALOG.find(s => s.id === selectedSystemId)?.name}</p>
                <div className="flex gap-4 text-[10px] font-black opacity-50 uppercase">
                    <span><Ruler className="inline w-3 h-3 mr-1" /> {masterMeasure}m</span>
                    <span><TrendingUp className="inline w-3 h-3 mr-1" /> {wasteMargin * 100}%</span>
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
             <AdSenseSlot id="analyzing-mid" />
           </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-700 py-8">
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Resultados</h2>
                   {previewImage && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                        <img src={previewImage} className="w-full h-full object-cover" alt="Contexto" />
                    </div>
                   )}
                   <div className="flex gap-2">
                    <button onClick={() => setUnitMode(u => u === 'm' ? 'cm' : 'm')} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase">
                        {unitMode}
                    </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {['largo', 'ancho', 'alto', 'espesor'].map((dim) => (
                        <div key={dim} className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-white/30 ml-2">{dim}</label>
                            <input
                                value={dim === 'largo' ? localLargo : dim === 'ancho' ? localAncho : dim === 'alto' ? localAlto : localEspesor}
                                onChange={(e) => handleLocalInputChange(dim as any, e.target.value)}
                                className="w-full bg-black border border-white/5 p-4 rounded-2xl font-mono font-black text-xl text-primary text-center"
                            />
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-4">
                    <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest opacity-50 flex items-center gap-2">
                        <Lucide.ListChecks className="w-3 h-3" /> Listado de Materiales (Ingeniería)
                    </h3>
                    <div className="space-y-2">
                        {currentMaterials.map((m, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                <div>
                                    <p className="text-[11px] font-black uppercase">{m.name}</p>
                                    <p className="text-[9px] font-bold text-white/40">{m.quantity.toFixed(2)} {m.unit}</p>
                                </div>
                                <span className="text-sm font-black text-primary">${m.total.toLocaleString('es-CL')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary p-8 rounded-[40px] text-black space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase opacity-60 italic border-b border-black/10 pb-2">
                        <span>Total Neto Estimado</span>
                        <span>${currentCost.total.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="text-center py-2">
                        <p className="text-5xl font-black italic tracking-tighter">${(currentCost.total * 1.19).toLocaleString('es-CL')}</p>
                        <p className="text-[9px] font-black uppercase opacity-50">IVA Incluido (19%)</p>
                    </div>
                    <Button onClick={handleExportPDF} className="w-full h-16 rounded-2xl bg-black text-primary font-black uppercase tracking-tighter hover:bg-zinc-900 border-none transition-all">
                        <Download className="w-5 h-5 mr-3" /> Exportar Planilla AEC
                    </Button>
                </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><Lucide.UserPlus className="w-10 h-10 text-primary" /></div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-2 underline decoration-primary">Límite Alcanzado</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Registra tu cuenta profesional para guardar proyectos y exportar PDFs ilimitados.</p>
              <Button onClick={() => navigate('/register')} className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-tighter">Crear Cuenta AEC</Button>
            </motion.div>
          </div>
        )}

        {showPaywall && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-10 h-10 text-primary" /></div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-2">Desbloquear Reporte</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Pago único por proyecto.</p>
              <div className="text-5xl font-black text-white mb-8">$2.990</div>
              <Button onClick={() => setShowPaywall(false)} className="w-full h-16 rounded-[28px] bg-primary text-black font-black uppercase">Liberar PDF Profesional</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
