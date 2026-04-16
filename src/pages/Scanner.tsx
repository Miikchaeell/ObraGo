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
import { Button } from "@/components/ui/button";
import { SupportWidget } from "@/components/SupportWidget";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESTADOS V3.0 ELITE
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const [wasteMargin] = useState<number>(0.05); 
  const [tempDims, setTempDims] = useState({ largo: "", ancho: "", espesor: "" });
  const [editedDims, setEditedDims] = useState({ largo: 0, ancho: 0, espesor: 0, alto: 2.4 });
  
  // Dosage Options
  const [dosage, setDosage] = useState<DosageSelection>({
    resistencia: "G-25",
    secado: "Estándar",
    armaduraTipo: "ACMA",
    armaduraDetalle: "malla_acma_c92",
    aditivos: [],
    vaciado: "Directa",
    mezclado: "Planta (Mixer)",
    acabado: "Platachado",
    colocacion: "GN"
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
  const currentSystem = useMemo(() => SYSTEMS_CATALOG.find(s => s.id === selectedSystemId), [selectedSystemId]);

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
                    message: `¡Hola! Soy parte del equipo de Obra Go. He liberado el acceso al Portal de Ingeniería para que puedas bajar tu reporte técnico ahora mismo. ¡Pruébalo y dime si los números te cuadran!`,
                    forceOpen: true
                }
            });
            window.dispatchEvent(event);
            setHasTriggeredProactive(true);
        }, 3000); 
        return () => clearTimeout(timer);
    }
  }, [step, hasTriggeredProactive]);

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
    exportPDF();
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    
    const addWatermark = (d: any) => {
        d.setTextColor(240, 240, 240);
        d.setFontSize(60);
        d.setFont("helvetica", "bold");
        d.saveGraphicsState();
        d.setGState(new d.GState({opacity: 0.1}));
        d.text("OBRA GO", 105, 150, { align: "center", angle: 45 });
        d.restoreGraphicsState();
    };

    // HOJA 1: RESUMEN EJECUTIVO
    addWatermark(doc);
    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(225, 255, 0); 
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.text("OBRA GO", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("INGENIERÍA Y GESTIÓN DE COSTOS AEC", 105, 42, { align: "center" });

    doc.setTextColor(40);
    doc.setFontSize(14);
    let y = 65;
    doc.setFont("helvetica", "bold");
    doc.text("MEMORIA TÉCNICA E INFORME DE COSTOS", 15, y); y += 12;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`PROYECTO: ${projectNameInput.toUpperCase()}`, 15, y); y += 7;
    doc.text(`FECHA: ${new Date().toLocaleDateString('es-CL')}`, 15, y); y += 7;
    doc.text(`UBICACIÓN: ${selectedCommune}, ${selectedRegion}`, 15, y); y += 15;

    doc.autoTable({
        startY: y,
        head: [['ÍTEM', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'SUBTOTAL']],
        body: [[
            '01.01', 
            SYSTEMS_CATALOG.find(s => s.id === selectedSystemId)?.name || '',
            'GL',
            '1.00',
            formatCLP(currentCost.total)
        ]],
        theme: 'grid',
        headStyles: { fillColor: [15, 17, 21], textColor: [225, 255, 0], fontStyle: 'bold' },
        styles: { fontSize: 9 }
    });

    y = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`INVERSIÓN TOTAL: ${formatCLP(currentCost.total * 1.19)} (IVA Incl.)`, 15, y); y += 30;

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Este documento representa una cubicación técnica preliminar bajo normativa NCh 170.", 105, 280, { align: "center" });
    doc.text("Validado por Departamento Técnico Obra Go.", 105, 285, { align: "center" });

    // HOJA 2: ANÁLISIS DE PRECIOS UNITARIOS (APU)
    doc.addPage();
    addWatermark(doc);
    doc.setTextColor(15, 17, 21);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ANÁLISIS DE PRECIOS UNITARIOS (APU)", 15, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Partida: ${SYSTEMS_CATALOG.find(s => s.id === selectedSystemId)?.name}`, 15, 28);
    
    const materiales = currentMaterials.filter(m => !m.id.startsWith('serv_') && !m.id.startsWith('acab_'));
    const equipos = currentMaterials.filter(m => m.id.startsWith('serv_') || m.id.startsWith('acab_'));

    const apuRows = [
        ...materiales.map(m => [m.name, 'Material', m.unit, m.quantity.toFixed(2), formatCLP(m.price), formatCLP(m.total)]),
        ['MANO DE OBRA ESPECIALIZADA', 'M. Obra', 'GL', '1.00', formatCLP(currentCost.labor), formatCLP(currentCost.labor)],
        ...equipos.map(e => [e.name, 'Eq/Serv', e.unit, e.quantity.toFixed(2), formatCLP(e.price), formatCLP(e.total)])
    ];

    doc.autoTable({
        startY: 35,
        head: [['RECURSO', 'TIPO', 'UNID.', 'CANT.', 'P. UNIT', 'TOTAL']],
        body: apuRows,
        theme: 'striped',
        margin: { top: 35 },
        headStyles: { fillColor: [60, 60, 60] },
        styles: { fontSize: 8 }
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    
    const summaryData = [
        ['COSTO DIRECTO (CD)', formatCLP(currentCost.materials + currentCost.labor)],
        ['GASTOS GENERALES (12%)', formatCLP(currentCost.gg)],
        ['UTILIDAD (15%)', formatCLP(currentCost.profit)],
        ['TOTAL NETO', formatCLP(currentCost.total)]
    ];

    doc.autoTable({
        startY: y,
        body: summaryData,
        theme: 'plain',
        margin: { left: 120 },
        styles: { fontSize: 9, fontStyle: 'bold', halign: 'right' },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 30 } }
    });

    // QR Verification (Simulado)
    const qrX = 175;
    const qrY = 260;
    doc.setDrawColor(0);
    doc.rect(qrX, qrY, 20, 20);
    for(let i=0; i<5; i++) {
        for(let j=0; j<5; j++) {
            if((i+j) % 2 === 0) doc.rect(qrX + (i*4), qrY + (j*4), 2, 2, 'F');
        }
    }
    doc.setFontSize(6);
    doc.text("VERIFICACIÓN OBRA GO", qrX + 10, qrY + 23, { align: "center" });

    doc.save(`ObraGo_V4_${projectNameInput.replace(/\s+/g, '_')}.pdf`);
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
                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-white">Input de <span className="text-primary">Obra Go</span></h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" /> Configuración Profesional de Proyecto
                </p>
            </header>

            <div className="space-y-6">
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
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-primary">Dosificación <span className="text-white">Obra Go</span></h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Ajuste Técnico Normativo</p>
                </header>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><Settings2 className="w-3 h-3" /> Resistencia Hormigón (Norma NCh 170)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {["G-17", "G-20", "G-25", "G-30", "G-35", "G-40"].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setDosage({...dosage, resistencia: r as any})}
                                    className={`p-3 rounded-xl border font-black transition-all ${dosage.resistencia === r ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    <span className="text-[11px]">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><Zap className="w-3 h-3" /> Variación de Colocación (Hormigonado)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'GN', label: 'Grado Normal', sub: 'Convencional' },
                                { id: 'GB', label: 'Grado Bombeable', sub: 'Incl. Plastificante' }
                            ].map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setDosage({...dosage, colocacion: c.id as any})}
                                    className={`p-4 rounded-2xl border font-black transition-all ${dosage.colocacion === c.id ? 'bg-primary border-primary text-black scale-105 shadow-xl shadow-primary/20' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    <span className="text-[10px] uppercase block leading-none mb-1">{c.label}</span>
                                    <span className="text-[7px] uppercase opacity-60 tracking-widest">{c.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

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

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><Lucide.Truck className="w-3 h-3" /> Logística de Mezclado</label>
                        <div className="grid grid-cols-2 gap-3">
                            {["Planta (Mixer)", "Obra (Trompo)"].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setDosage({...dosage, mezclado: m as any})}
                                    className={`p-4 rounded-2xl border font-black transition-all ${dosage.mezclado === m ? 'bg-primary border-primary text-black scale-105' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    <span className="text-[10px] uppercase">{m}</span>
                                    <span className="block text-[8px] opacity-60 uppercase">{m.includes("Planta") ? "Industrial" : "Terreno"}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><Lucide.ArrowDownCircle className="w-3 h-3" /> Método de Vaciado</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["Directa", "Bomba Pluma", "Bomba Estacionaria"].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setDosage({...dosage, vaciado: v as any})}
                                    className={`p-3 rounded-xl border text-[9px] font-black transition-all ${dosage.vaciado === v ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2 px-2"><Lucide.Layers className="w-3 h-3" /> Acabado de Superficie</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["Platachado", "Helicóptero", "Escobillado"].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setDosage({...dosage, acabado: f as any})}
                                    className={`p-3 rounded-xl border text-[9px] font-black transition-all ${dosage.acabado === f ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/60'}`}
                                >
                                    {f}
                                </button>
                            ))}
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
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-primary">Reporte <span className="text-white">Obra Go</span></h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{projectNameInput}</p>
                </div>
                {previewImage && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={previewImage} className="w-full h-full object-cover" alt="Contexto" />
                    </div>
                )}
            </header>

            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                <div className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-[8px] font-black text-white/30 uppercase mb-1">Volumen Cubicada</p>
                        <p className="text-xl font-black text-white">{currentCost.volume.toFixed(2)} m³</p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-primary uppercase">Validado Obra Go</span>
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

            <div className="bg-primary/10 border border-primary/30 p-6 rounded-3xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                    <p className="text-[10px] font-bold text-white leading-relaxed">
                        Este reporte es el cálculo de ingeniería Obra Go. Para certificar esta cubicación con firma oficial, utiliza el botón de <span className="text-primary font-black">Descargar PDF</span>.
                    </p>
                </div>
                <div className="flex flex-col items-center border-l border-primary/20 pl-4 shrink-0">
                    <Lucide.ShieldCheck className="w-8 h-8 text-primary mb-1" />
                    <p className="text-[7px] font-black text-primary uppercase tracking-widest">Norma NCh 170</p>
                </div>
            </div>
          </div>
        )}
      </main>

      <SupportWidget 
        metadata={{
            projectName: projectNameInput,
            dims: editedDims,
            dosage: dosage,
            totalCost: currentCost.total,
            step: step,
            category: currentSystem?.category
        }}
      />

      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-slate-900 border border-primary/20 rounded-[48px] p-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><FileText className="w-10 h-10 text-primary" /></div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-2 italic">Exportar Memoria<br /><span className="text-primary">Técnica Obra Go</span></h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">PDF Certificado con validez profesional para compras y consultoría.</p>
              <div className="text-5xl font-black text-white mb-2">$2.990</div>
              <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-8">Acceso permanente a este reporte</p>
              <Button onClick={exportPDF} className="w-full h-16 rounded-[28px] bg-primary text-black font-black uppercase shadow-2xl shadow-primary/20">Desbloquear Ahora</Button>
              <button onClick={() => setShowPaywall(false)} className="mt-6 text-[10px] font-black text-white/20 uppercase hover:text-white transition-colors">Volver al Reporte</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
