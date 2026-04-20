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
      doc.text("REPORTE TÉCNICO ÉLITE", 15, 25);
      doc.save(`ObraGo_Proyecto_${projectNameInput || "Final"}.pdf`);
    } catch (err) { alert("Error al generar PDF."); }
  };

  const handleDownload = () => { generatePDF(); };

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
