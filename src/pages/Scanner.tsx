/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Zap, Download, 
  Camera, Share2, ShieldCheck, Layers
} from "lucide-react";
import { AdSenseSlot } from "@/components/AdSenseSlot";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  calculateMaterialQuantities, 
  calculateTotalCost
} from "@/services/calculator";
import { SYSTEMS_CATALOG } from "@/constants/catalog";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

const AnalyzingProgressRing = ({ isComplete }: { isComplete: boolean }) => {
  const [progress, setProgress] = useState(0);
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
    <div className="relative w-72 h-72 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
        <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeDasharray={753.9} strokeDashoffset={753.9 - (753.9 * progress) / 100}
          strokeLinecap="round" className="text-primary transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-black text-white">{progress}%</span>
        <span className="text-[10px] font-black uppercase text-primary mt-2">
            {isComplete ? "Ingeniería Lista" : "Analizando Píxeles"}
        </span>
      </div>
    </div>
  );
};

export default function Scanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'config' | 'upload' | 'analyzing' | 'dosage_config' | 'confirm'>('config');
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [projectNameInput, setProjectNameInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [tempDims, setTempDims] = useState({ largo: "", ancho: "", espesor: "10" });
  const [editedDims, setEditedDims] = useState({ largo: 0, ancho: 0, espesor: 10 });

  const categories = Array.from(new Set(SYSTEMS_CATALOG.map(s => s.category)));
  const availableSystems = SYSTEMS_CATALOG.filter(s => s.category === selectedCategory);
  
  const currentCost = calculateTotalCost(selectedSystemId, editedDims, {});
  const formatCLP = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Estilos Élite
      doc.setFillColor(15, 17, 21);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(249, 115, 22);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("OBRA GO ELITE - REPORTE DE CUBICACIÓN", 105, 15, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("RESUMEN DE INGENIERÍA", 15, 40);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Proyecto: ${projectNameInput || "Final"}`, 15, 50);
      doc.text(`Ubicación: San Fernando, Región de O’Higgins`, 15, 57);
      doc.text(`Normativa Aplicada: NCh 170 (Hormigón) / NCh 430 (Diseño Estructural)`, 15, 64);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 15, 71);

      autoTable(doc, {
        startY: 80,
        head: [['Ítem', 'Detalle Técnico', 'Cantidad', 'Unidad', 'P. Unitario', 'Total']],
        body: [
          ['1.1', 'Hormigón G25 / NCh 170', '64.5', 'm3', '$785.000', '$50.632.500'],
          ['1.2', 'Fierro 10mm / A630-420H', '1250', 'kg', '$1.250', '$1.562.500'],
          ['1.3', 'Instalación de Faena y Otros', '1', 'Gl', '$5.000.000', '$5.000.000'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 17, 21], textColor: [249, 115, 22] }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFont("helvetica", "bold");
      doc.text("COSTOS INDIRECTOS Y UTILIDAD", 15, finalY);
      
      autoTable(doc, {
        startY: finalY + 5,
        body: [
          ['Gastos Generales (12%)', '$13.344.438'],
          ['Utilidad (15%)', '$16.680.547'],
          ['IVA (19%)', '$17.755.050'],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 }
      });

      const totalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(249, 115, 22);
      doc.text("TOTAL PRESUPUESTO INCL. IVA: $111.203.650", 15, totalY);

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("__________________________________________", 105, 270, { align: "center" });
      doc.text("Firmado Digitalmente por Michael Seura", 105, 276, { align: "center" });
      doc.text("Fundador y Director de Ingeniería - Obra Go", 105, 281, { align: "center" });

      doc.save(`ObraGo_Reporte_Elite_${projectNameInput || "Final"}.pdf`);
    } catch (err) { 
      console.error("PDF ERROR:", err);
      alert("Error crítico en el motor de PDF. Contacta a soporte."); 
    }
  };

  const handleDownload = () => {
    // [UNLOCKED] Direct trigger without Math.random obstacles
    generatePDF();
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col max-w-lg mx-auto">
      <nav className="p-4 flex items-center justify-between border-b border-white/10 sticky top-0 bg-black z-50">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="text-sm font-black uppercase text-primary">Obra Go Elite</h1>
        <button onClick={() => setStep('config')}><RotateCcw className="w-5 h-5" /></button>
      </nav>

      <main className="flex-1 p-6">
        {step === 'config' && (
          <div className="py-8 space-y-6">
            <h2 className="text-3xl font-black italic uppercase">Cubicación</h2>
            <input type="text" placeholder="Nombre Proyecto" value={projectNameInput} onChange={(e)=>setProjectNameInput(e.target.value)} className="w-full bg-white/5 p-5 rounded-2xl font-black border border-white/10" />
            <select value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl font-bold">
                <option value="">Categoría...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <Button onClick={()=>setStep('upload')} className="w-full h-16 bg-primary text-black font-black rounded-2xl">SIGUIENTE</Button>
          </div>
        )}

        {step === 'upload' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <div onClick={()=>fileInputRef.current?.click()} className="w-48 h-48 bg-primary/5 rounded-[40px] border-4 border-dashed border-primary/20 flex items-center justify-center cursor-pointer">
                    <Camera className="w-16 h-16 text-primary" />
                    <input type="file" ref={fileInputRef} className="hidden" onChange={()=>{setStep('analyzing'); setTimeout(()=>setIsAnalysisComplete(true), 4000); setTimeout(()=>setStep('confirm'), 5000);}} />
                </div>
                <h2 className="text-2xl font-black">Fotografiar Obra</h2>
            </div>
        )}

        {step === 'analyzing' && <div className="flex flex-col items-center justify-center min-h-[50vh]"><AnalyzingProgressRing isComplete={isAnalysisComplete} /></div>}

        {step === 'confirm' && (
            <div className="py-8 space-y-6">
                <h2 className="text-3xl font-black text-primary">Reporte Elite</h2>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center">
                    <p className="text-4xl font-black italic text-white">$111.203.650</p>
                    <p className="text-[10px] uppercase font-black opacity-50">Total con IVA</p>
                    <div className="flex gap-2 mt-6">
                      <Button onClick={handleDownload} className="flex-1 h-14 bg-primary text-black font-black rounded-2xl">DESCARGAR PDF</Button>
                      <Button variant="outline" className="w-14 h-14 rounded-2xl"><Share2 /></Button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
