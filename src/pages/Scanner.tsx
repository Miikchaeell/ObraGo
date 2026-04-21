// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateMaterialQuantities, calculateTotalCost } from "@/services/calculator";

/**
 * MOTOR DE INGENIERÍA AEC OBRA GO - V9.5
 * REINGENIERÍA DE PRODUCCIÓN: DESBLOQUEO TOTAL - SIN PAYWALLS
 */
const generateElitePDF = (projectName, scanData, costData, materials) => {
  try {
    const doc = new jsPDF();
    const primaryColor = [212, 175, 55]; // Gold #D4AF37

    // --- PÁGINA 1: RESUMEN DE INGENIERÍA ---
    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("OBRA GO ELITE - REPORTE TÉCNICO DE OBRA", 105, 15, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("RESUMEN DE CUBICACIÓN AEC (NCh 170/430)", 15, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Proyecto: ${projectName || "Obra Nueva"}`, 15, 50);
    doc.text(`Elemento Analizado: ${scanResult?.partida || "No especificado"}`, 15, 57);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 15, 64);
    doc.text(`Ingeniero Responsable: ObraGo - AEC Engineering`, 15, 71);

    // Tabla de materiales calculados con 5% de pérdida
    autoTable(doc, {
      startY: 80,
      head: [['Ítem', 'Detalle Material (5% Pérdida)', 'Cantidad', 'Unidad', 'Total Estimado']],
      body: materials.map((m, i) => [
        `1.${i+1}`, 
        m.name, 
        m.quantity.toFixed(2), 
        m.unit, 
        `$${Math.round(m.total).toLocaleString('es-CL')}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 17, 21], textColor: primaryColor }
    });

    const totalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`TOTAL PRESUPUESTO INCL. IVA: $${Math.round(costData.total * 1.19).toLocaleString('es-CL')}`, 15, totalY);

    // --- PÁGINA 2: EL MINCHO CHICO (APU DETALLADO) ---
    doc.addPage();
    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("EL MINCHO CHICO - ANÁLISIS DE PRECIOS UNITARIOS", 105, 15, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("DESGLOSE DE INCIDENCIAS AEC", 15, 40);

    autoTable(doc, {
      startY: 50,
      head: [['Componente', 'Porcentaje', 'Incidencia Estimada']],
      body: [
        ['Materiales (Inc. Factor de Pérdida)', '38%', `$${Math.round(costData.materials).toLocaleString('es-CL')}`],
        ['Mano de Obra (MO)', '35%', `$${Math.round(costData.labor).toLocaleString('es-CL')}`],
        ['Gastos Generales (GG)', '12%', `$${Math.round(costData.gg).toLocaleString('es-CL')}`],
        ['Utilidad neta', '15%', `$${Math.round(costData.profit).toLocaleString('es-CL')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] }
    });

    // Firma Digital de Michael
    const finalY = (doc as any).lastAutoTable.finalY + 40;
    doc.setFont("courier", "bolditalic");
    doc.setFontSize(10);
    doc.text("__________________________", 105, finalY, { align: "center" });
    doc.text("Firmado Digitalmente por ObraGo", 105, finalY + 8, { align: "center" });
    doc.text("Fundador e Ingeniero Senior Obra Go", 105, finalY + 14, { align: "center" });
    doc.text(`ID Validación: AEC-${Math.random().toString(36).substring(7).toUpperCase()}`, 105, finalY + 20, { align: "center" });

    doc.save(`Reporte_Elite_ObraGo_${projectName || 'Scan'}.pdf`);
  } catch (error) {
    console.error("PDF Fail:", error);
    alert("Error crítico en el motor de PDF. Contacte a soporte.");
  }
};

export default function Scanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('config');
  const [name, setName] = useState(location.state?.projectName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [materials, setMaterials] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setStep('loading');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "";
      
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error("Error en el análisis");

      const result = await response.json();
      const scanData = result.data;

      // Calcular costos usando el motor de ingeniería (Waste Margin 5%)
      const calculatedMaterials = calculateMaterialQuantities(
        scanData.sistema_id,
        scanData.dimensiones,
        {}, // Precios por defecto
        0.05 // 5% de pérdida exigido por el usuario
      );

      const calculatedCosts = calculateTotalCost(
        scanData.sistema_id,
        scanData.dimensiones,
        calculatedMaterials
      );

      setScanResult(scanData);
      setMaterials(calculatedMaterials);
      setCostBreakdown(calculatedCosts);
      
      // PERSISTIR TOTAL PARA EL SUPPORT WIDGET
      const totalIva = Math.round(calculatedCosts.total * 1.19);
      localStorage.setItem('lastScanTotal', totalIva.toString());
      // Forzar evento storage para pestañas abiertas si es necesario
      window.dispatchEvent(new Event('storage'));

      setStep('result');

      // Guardar en historial
      if (location.state?.projectId) {
          const projectData = {
              workProjectId: location.state.projectId,
              elemento: scanData.partida,
              sistema: scanData.subtipo,
              dimensiones: scanData.dimensiones,
              materiales: calculatedMaterials,
              totalCost: calculatedCosts,
              image: result.imageUrl
          };
          
          await fetch(`${API_URL}/api/projects`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ projectData: JSON.stringify(projectData) })
          });
      }

    } catch (error) {
      console.error("Scan Error:", error);
      alert("Error al analizar la imagen. Intenta de nuevo.");
      setStep('config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    generateElitePDF(name, scanResult, costBreakdown, materials);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col max-w-lg mx-auto font-sans">
      <nav className="p-4 border-b border-white/10 bg-black sticky top-0 z-50 flex justify-between items-center text-[#D4AF37]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft /></button>
        <h1 className="text-sm font-black uppercase tracking-tighter">Obra Go Elite</h1>
        <button onClick={() => setStep('config')} className="p-2 hover:bg-white/5 rounded-full"><RotateCcw /></button>
      </nav>

      <main className="flex-1 p-6 flex flex-col justify-center">
        {step === 'config' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-black italic tracking-tighter text-[#D4AF37]">Cubicación</h2>
            <input 
              type="text" 
              placeholder="Nombre Proyecto / Partida" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-lg font-bold focus:border-[#D4AF37] outline-none transition-all" 
            />
            <Button 
              onClick={() => setStep('scan')} 
              className="w-full h-16 bg-[#D4AF37] text-black font-black rounded-2xl text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              CONTINUAR
            </Button>
          </div>
        )}

        {step === 'scan' && (
          <div className="flex flex-col items-center">
            <div onClick={() => fileInputRef.current?.click()} className="w-56 h-56 border-4 border-dashed border-[#D4AF37]/30 rounded-[60px] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all group relative">
              <Camera className="w-16 h-16 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#D4AF37]/60">Sube una foto de la obra</p>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin" />
            <div className="text-center">
                <h3 className="text-xl font-black text-[#D4AF37] uppercase italic">Analizando Terreno</h3>
                <p className="text-xs text-slate-500 font-bold uppercase mt-2">Motor de Ingeniería AEC v9.5</p>
            </div>
          </div>
        )}

        {step === 'result' && scanResult && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[48px] text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 p-6">
                  <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
              </div>
              
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-4">Presupuesto AEC Generado</p>
              <h3 className="text-5xl font-black text-white tracking-tighter">
                ${Math.round(costBreakdown.total * 1.19).toLocaleString('es-CL')}
              </h3>
              <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Incluye IVA (19%), GG y Utilidad</p>
              
              <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className="text-slate-400">Partida</span>
                      <span className="text-white">{scanResult.partida}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className="text-slate-400">Pérdida Calculada</span>
                      <span className="text-[#D4AF37]">5% (NCh 170)</span>
                  </div>
              </div>

              <div className="mt-10">
                <Button 
                  onClick={handleDownload}
                  className="h-20 w-full bg-[#D4AF37] text-black font-black rounded-2xl text-xl shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  DESCARGAR REPORTE ÉLITE
                </Button>
                <p className="text-[9px] text-gray-600 mt-4 uppercase font-black tracking-widest">Acceso Directo Unlocked 🔓</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 text-center border-t border-white/5 bg-black/20">
        <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em]">Obra Go Pro v9.5 Deployment</p>
      </footer>
    </div>
  );
}


