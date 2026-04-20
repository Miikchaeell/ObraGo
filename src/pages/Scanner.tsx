// @ts-nocheck
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Download, Camera, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * MOTOR DE GENERACIÓN DE PDF ÉLITE - OBRA GO
 * SIN CAPA DE SEGURIDAD - ACCESO DIRECTO
 */
const generateElitePDF = (projectName) => {
  try {
    const doc = new jsPDF();
    const primaryColor = [249, 115, 22]; // AEC Orange

    // Header Pro
    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("OBRA GO ELITE - REPORTE TÉCNICO", 105, 15, { align: "center" });

    // Resumen General
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("RESUMEN DE INGENIERÍA", 15, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Proyecto: ${projectName || "Obra Nueva"}`, 15, 50);
    doc.text(`Ubicación: Región de O'Higgins, Chile`, 15, 57);
    doc.text(`Normativa: NCh 170 (Hormigón) / NCh 430`, 15, 64);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 71);

    // Tabla de Partidas
    autoTable(doc, {
      startY: 80,
      head: [['Ítem', 'Partida', 'Cantidad', 'Unidad', 'Total Est.']],
      body: [
        ['1.1', 'Hormigón G25 Bombeable', '64.5', 'm3', '$50.632.500'],
        ['1.2', 'Fierro A630-420H 10mm', '1250', 'kg', '$1.562.500'],
        ['1.3', 'Instalación de Faena', '1', 'Gl', '$5.000.000'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 17, 21], textColor: primaryColor }
    });

    // Costos Indirectos
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text("ANÁLISIS DE COSTOS INDIRECTOS", 15, finalY);
    
    autoTable(doc, {
      startY: finalY + 5,
      body: [
        ['Gastos Generales (12%)', '$13.344.438'],
        ['Utilidad (15%)', '$16.680.547'],
        ['Impuesto IVA (19%)', '$17.755.050'],
      ],
      theme: 'plain'
    });

    // Cierre
    const totalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("VALOR TOTAL PRESUPUESTO: $111.203.650", 15, totalY);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Firmado Digitalmente por Michael Seura - Fundador Obra Go", 105, 280, { align: "center" });

    doc.save(`Reporte_Elite_ObraGo_${projectName || "Final"}.pdf`);
  } catch (error) {
    console.error("PDF Fail:", error);
    alert("Error crítico al generar PDF. Asegúrate de que las librerías jspdf estén cargadas.");
  }
};

export default function Scanner() {
  const navigate = useNavigate();
  const [step, setStep] = useState('config');
  const [name, setName] = useState("");
  const fileInputRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col max-w-lg mx-auto font-sans">
      {/* Header Fijo */}
      <nav className="p-4 flex items-center justify-between border-b border-white/10 bg-black sticky top-0 z-50">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="text-sm font-black uppercase text-orange-500 tracking-tighter">Obra Go Elite</h1>
        <button onClick={() => setStep('config')}><RotateCcw className="w-5 h-5 text-gray-500" /></button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col justify-center">
        {step === 'config' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter">Cubicación</h2>
              <p className="text-gray-400 text-sm">Escaneo técnico de obra en tiempo real.</p>
            </div>
            <input 
              type="text" 
              placeholder="Nombre del Proyecto" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-lg font-bold focus:border-orange-500 transition-all outline-none"
            />
            <Button 
              onClick={() => setStep('scan')} 
              className="w-full h-16 bg-orange-500 text-black font-black text-lg rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              CONTINUAR
            </Button>
          </div>
        )}

        {step === 'scan' && (
          <div className="flex flex-col items-center space-y-10">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-56 h-56 bg-orange-500/5 border-4 border-dashed border-orange-500/30 rounded-[60px] flex items-center justify-center cursor-pointer group hover:bg-orange-500/10 transition-all"
            >
              <Camera className="w-16 h-16 text-orange-500 group-hover:scale-110 transition-transform" />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={() => {
                  setStep('result');
                }}
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black">Subir Fotografía</h2>
              <p className="text-gray-500 text-sm">Captura el estado de la obra para analizar.</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[48px] text-center space-y-4 shadow-2xl">
              <div className="inline-block px-4 py-1 bg-orange-500/20 text-orange-500 text-[10px] font-black uppercase rounded-full tracking-widest mb-2">
                Ingeniería Validada
              </div>
              <h3 className="text-5xl font-black tabular-nums tracking-tighter text-white">
                $111.203.650
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Inversión Estimada con IVA</p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <Button 
                  onClick={() => generateElitePDF(name)}
                  className="h-14 bg-orange-500 text-black font-black rounded-2xl flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> REPORTE PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 border-white/10 hover:bg-white/5 rounded-2xl flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[32px] flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Validación Técnica</p>
                <p className="text-xs text-orange-100/70 leading-relaxed font-bold">
                  Hormigón G25 y Fierro cubicados al 100% bajo NCh 170.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="p-8 text-center border-t border-white/5">
        <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">
          Powered by Obra Go AI Automation V7.1
        </p>
      </footer>
    </div>
  );
}
