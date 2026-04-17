/* eslint-disable */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
  Zap, 
  CheckCircle2, 
  Download, 
  Settings2, 
  Boxes,
  Lock,
  AlertCircle,
  FileText,
  ShieldCheck,
  Truck,
  ArrowDownCircle,
  Layers,
  Camera,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportWidget } from "@/components/SupportWidget";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  calculateMaterialQuantities, 
  calculateTotalCost
} from "@/services/calculator";
import type { DosageSelection } from "@/services/calculator";
import { SYSTEMS_CATALOG } from "@/constants/catalog";
import { REGIONS_CHILE } from "@/data/chile";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

// --- COMPONENTES AUXILIARES ---

const AnalyzingProgressRing = ({ isComplete }: { isComplete: boolean }) => {
  const [progress, setProgress] = useState(0);
  const { plan } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (isComplete) return 100;
        return prev < 90 ? prev + 5 : prev;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <div className="relative w-72 h-72 flex flex-col items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
        <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeDasharray={753.9}
          strokeDashoffset={753.9 - (753.9 * progress) / 100}
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-black italic tracking-tighter text-white">{Math.round(progress)}%</span>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mt-2">
            {isComplete ? "Ingeniería Lista" : "Analizando Píxeles"}
        </span>
      </div>
    </div>
  );
};

export default function Scanner() {
  const navigate = useNavigate();
  const { user, plan } = useAuth();
  const isPremium = plan === 'premium';

  const [step, setStep] = useState<'config' | 'upload' | 'analyzing' | 'dosage_config' | 'confirm'>('config');
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showForcedButton, setShowForcedButton] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [projectNameInput, setProjectNameInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [tempDims, setTempDims] = useState({ largo: "", ancho: "", espesor: "10" });
  const [editedDims, setEditedDims] = useState({ largo: 0, ancho: 0, espesor: 10 });
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [dosage, setDosage] = useState<DosageSelection>({
    resistencia: "G-25",
    colocacion: "GN",
    secado: "Estándar",
    mezclado: "Planta (Mixer)",
    vaciado: "Directa",
    acabado: "Platachado",
    armaduraTipo: "ACMA",
    armaduraDetalle: "malla_acma_c92"
  });

  const categories = Array.from(new Set(SYSTEMS_CATALOG.map(s => s.category)));
  const availableSystems = SYSTEMS_CATALOG.filter(s => s.category === selectedCategory);
  const currentSystem = SYSTEMS_CATALOG.find(s => s.id === selectedSystemId);

  const wasteMargin = 0.05;
  const currentMaterials = calculateMaterialQuantities(selectedSystemId, editedDims, {}, wasteMargin, dosage);
  const currentCost = calculateTotalCost(selectedSystemId, editedDims, currentMaterials);

  const validatePreConfig = () => projectNameInput && selectedCategory && selectedSystemId && tempDims.largo && tempDims.ancho && selectedRegion && selectedCommune;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setEditedDims({
            largo: parseFloat(tempDims.largo) || 0,
            ancho: parseFloat(tempDims.ancho) || 0,
            espesor: parseFloat(tempDims.espesor) || 10
        });
        setStep('analyzing');
        runAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    setShowForcedButton(false);
    const timer = setTimeout(() => setShowForcedButton(true), 4000);
    
    await new Promise(resolve => setTimeout(resolve, 6000));
    clearTimeout(timer);
    
    const scanData = {
      project_name: projectNameInput,
      category: selectedCategory,
      system_id: selectedSystemId,
      dimensions: editedDims,
      total_cost: currentCost.total,
      region: selectedRegion,
      commune: selectedCommune,
      user_id: user?.id
    };

    try {
        if (supabase) {
            await supabase.from('scans').insert([scanData]);
        }
    } catch (err) {
        console.warn("Offline Mode Active: Local Storage only.");
    }

    setIsAnalysisComplete(true);
    setStep('dosage_config');
  };

  const triggerSensorFallback = () => {
    setIsAnalysisComplete(true);
    setStep('dosage_config');
  };

  const formatCLP = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const addInstitutionWatermark = (doc: any) => {
    const totalPages = doc.internal.getNumberOfPages();
    for(let i=1; i<=totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(240, 240, 240);
        doc.setFontSize(60);
        doc.setFont("helvetica", "bold");
        doc.text("OBRA GO", 105, 150, { align: "center", angle: 45 });
    }
  };

  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      // PAGE 1: RESUMEN EJECUTIVO
      addInstitutionWatermark(doc);
      doc.setTextColor(225, 255, 0);
      doc.setFillColor(15, 17, 21);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("REPORTE TÉCNICO ÉLITE", 15, 25);
      doc.setFontSize(10);
      doc.text("OBRA GO • INGENIERÍA Y CUBICACIÓN V5.1", 15, 33);

      let y = 55;
      doc.setTextColor(15, 17, 21);
      doc.setFontSize(12);
      doc.text("DATOS DEL PROYECTO", 15, y); y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`PROYECTO: ${projectNameInput.toUpperCase()}`, 15, y); y += 6;
      doc.text(`UBICACIÓN: ${selectedCommune}, ${selectedRegion}`, 15, y); y += 6;
      doc.text(`FECHA: ${new Date().toLocaleDateString('es-CL')}`, 15, y); y += 15;

      // Tabla de Resumen Económico
      const costoDirecto = currentCost.costoDirecto;
      const gg = currentCost.gg; // 12%
      const profit = currentCost.profit; // 15%
      const subtotalNeto = currentCost.total;
      const iva = Math.round(subtotalNeto * 0.19);
      const totalFinal = subtotalNeto + iva;

      autoTable(doc, {
          startY: y,
          head: [['DESCRIPCIÓN', 'VALOR (%)', 'MONTO (CLP)']],
          body: [
              ['COSTO DIRECTO (MATERIALES + M.O)', '-', formatCLP(costoDirecto)],
              ['GASTOS GENERALES', '12%', formatCLP(gg)],
              ['UTILIDAD', '15%', formatCLP(profit)],
              ['SUBTOTAL NETO', '-', formatCLP(subtotalNeto)],
              ['I.V.A', '19%', formatCLP(iva)],
              ['TOTAL GENERAL', '-', formatCLP(totalFinal)]
          ],
          theme: 'grid',
          headStyles: { fillColor: [20, 20, 20], textColor: [225, 255, 0] },
          styles: { fontStyle: 'bold' }
      });

      // PAGE 2: DESGLOSE DE APU (MINCHO CHICO)
      doc.addPage();
      addInstitutionWatermark(doc);
      doc.setTextColor(15, 17, 21);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DESGLOSE DE ANÁLISIS DE PRECIOS UNITARIOS (APU)", 15, 20);
      doc.setFontSize(10);
      doc.text(`PARTIDA: ${currentSystem?.name} (Grado ${dosage.resistencia})`, 15, 28);
      
      const apuRows = [];
      currentMaterials.forEach(m => {
          apuRows.push([m.name, m.unit, m.quantity.toFixed(2), formatCLP(m.price), formatCLP(m.total)]);
      });

      // Añadir Mano de Obra como fila
      apuRows.push(['Mano de Obra Especializada', 'serv', '1.00', formatCLP(currentCost.labor), formatCLP(currentCost.labor)]);

      autoTable(doc, {
          startY: 35,
          head: [['RECURSO / INSUMO', 'UNID.', 'CANT.', 'P. UNIT', 'TOTAL']],
          body: apuRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [15, 17, 21], textColor: [255, 255, 255] }
      });

      doc.save(`ObraGo_${projectNameInput.replace(/\s+/g, '_')}_V5.1.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      // Fallback simple if autotable fails
      const doc = new jsPDF();
      doc.text("PRUEBA OBRA GO - FALLA CRÍTICA DE TABLA", 10, 10);
      doc.save("ObraGo_Fallback.pdf");
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col max-w-lg mx-auto shadow-2xl">
      <nav className="p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2"><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="text-sm font-black uppercase text-primary italic">Obra Go Élite 5.1</h1>
        <button onClick={() => setStep('config')} className="p-2"><RotateCcw className="w-5 h-5" /></button>
      </nav>

      <main className="flex-1 overflow-y-auto pb-24 px-6">
        {step === 'config' && (
          <div className="py-8 space-y-6">
            <h2 className="text-3xl font-black italic uppercase">Input de Obra Go</h2>
            <input type="text" placeholder="Proyecto" value={projectNameInput} onChange={(e)=>setProjectNameInput(e.target.value)} className="w-full bg-white/5 p-5 rounded-2xl font-black outline-none border border-white/10 focus:border-primary" />
            
            <select value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl font-bold">
                <option value="">Categoría...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            {selectedCategory && (
                <select value={selectedSystemId} onChange={(e)=>setSelectedSystemId(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl font-bold">
                    <option value="">Partida...</option>
                    {availableSystems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            )}

            <div className="grid grid-cols-2 gap-4">
                <input placeholder="Largo" value={tempDims.largo} onChange={(e)=>setTempDims({...tempDims, largo: e.target.value})} className="bg-black p-4 rounded-xl text-primary text-center font-black" />
                <input placeholder="Ancho" value={tempDims.ancho} onChange={(e)=>setTempDims({...tempDims, ancho: e.target.value})} className="bg-black p-4 rounded-xl text-primary text-center font-black" />
            </div>

            <Button disabled={!validatePreConfig()} onClick={()=>setStep('upload')} className="w-full h-16 bg-primary text-black font-black uppercase rounded-2xl shadow-xl shadow-primary/20">Analizar Captura</Button>
          </div>
        )}

        {step === 'upload' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <div onClick={()=>fileInputRef.current?.click()} className="w-48 h-48 bg-primary/5 rounded-[40px] border-4 border-dashed border-primary/20 flex items-center justify-center cursor-pointer">
                    <Camera className="w-16 h-16 text-primary" />
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
                </div>
                <h2 className="text-2xl font-black uppercase">Fotografiar Obra</h2>
            </div>
        )}

        {step === 'analyzing' && <div className="flex flex-col items-center justify-center min-h-[50vh]"><AnalyzingProgressRing isComplete={isAnalysisComplete} /></div>}

        {step === 'dosage_config' && (
            <div className="py-8 space-y-6">
                <h2 className="text-2xl font-black uppercase text-center">Dosificación Técnica</h2>
                <div className="grid grid-cols-3 gap-2">
                    {["G-17", "G-20", "G-25", "G-30", "G-35", "G-40"].map(r => (
                        <button key={r} onClick={()=>setDosage({...dosage, resistencia: r})} className={`p-3 rounded-lg border font-black ${dosage.resistencia === r ? 'bg-primary text-black' : 'bg-white/5 text-white/50'}`}>{r}</button>
                    ))}
                </div>
                <Button onClick={()=>setStep('confirm')} className="w-full h-16 bg-primary text-black font-black uppercase rounded-2xl">Ver Resultados</Button>
            </div>
        )}

        {step === 'confirm' && (
            <div className="py-8 space-y-6 pb-32">
                <h2 className="text-3xl font-black italic text-primary">Reporte Obra Go</h2>
                
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 space-y-6">
                    <div className="text-center py-4 bg-primary rounded-[32px] text-black">
                        <p className="text-4xl font-black italic">{formatCLP(currentCost.total * 1.19)}</p>
                        <p className="text-[10px] uppercase font-black opacity-50">Total con IVA</p>
                    </div>
                    <Button onClick={handleDownload} className="w-full h-16 bg-black text-primary font-black uppercase rounded-2xl flex gap-3 shadow-xl"><Download /> Descargar PDF Élite</Button>
                </div>

                <div style={{ height: '120px', background: '#ffcc00', border: '10px solid black', display: 'flex' }} className="w-full rounded-[32px] items-center justify-center p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <Zap className="w-10 h-10 text-black animate-bounce" />
                        <div>
                            <p className="text-black font-black uppercase text-xl leading-none">PUBLICIDAD OBRA GO</p>
                            <p className="text-black font-bold text-xs uppercase opacity-70">Libera el APU Detallado Ahora mismo</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* [BANNER PUBLICITARIO FORZADO V5.1] */}
      <div className="fixed bottom-24 left-6 right-6 z-[999]">
          <div className="bg-[#ffcc00] border-4 border-black p-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-bounce">
              <Zap className="w-5 h-5 text-black" />
              <span className="text-black font-black uppercase text-[12px] tracking-tighter">PROVEEDOR DESTACADO: CEMENTOS CHILE</span>
          </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-[999]">
          <div className="bg-[#ffcc00] border-4 border-black p-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-bounce">
              <Zap className="w-5 h-5 text-black" />
              <span className="text-black font-black uppercase text-[12px] tracking-tighter">PROVEEDOR DESTACADO: CEMENTOS CHILE</span>
          </div>
      </div>
    </div>
  );
}
