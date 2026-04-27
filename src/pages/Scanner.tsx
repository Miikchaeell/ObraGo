/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Camera, Loader2, CheckCircle2, Mic, CreditCard, Share2, Zap, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateMaterialQuantities, calculateTotalCost } from "@/services/calculator";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from 'xlsx';
import imageCompression from 'browser-image-compression';
import { generateSumaAlzadaContract } from "@/services/contractGenerator";

/**
 * MOTOR DE INGENIERÍA AEC OBRA GO - V9.5
 * REINGENIERÍA DE PRODUCCIÓN: DESBLOQUEO TOTAL - SIN PAYWALLS
 */
const generateElitePDF = (projectName, scanData, costData, materials, userSignature, voiceNotes, gpsCoords) => {
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
    
    if (voiceNotes) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Nota de Voz Transcrita: "${voiceNotes}"`, 15, 78);
    }

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

    // Firma del Usuario (Si existe)
    if (userSignature) {
      const userY = (doc as any).lastAutoTable.finalY + 40;
      doc.addImage(userSignature, 'PNG', 15, userY, 50, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("FIRMA DEL RESPONSABLE EN TERRENO", 15, userY + 25);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 15, userY + 30);
      doc.text(`Validación GPS: ${gpsCoords ? `${gpsCoords.latitude}, ${gpsCoords.longitude}` : 'San Fernando, Chile'}`, 15, userY + 35);
    }

    // Firma Digital de Michael
    const finalY = (doc as any).lastAutoTable.finalY + 40;
    doc.setFont("courier", "bolditalic");
    doc.setFontSize(10);
    doc.text("__________________________", 150, finalY, { align: "center" });
    doc.text("Firmado Digitalmente por ObraGo", 150, finalY + 8, { align: "center" });
    doc.text("Fundador e Ingeniero Senior Obra Go", 150, finalY + 14, { align: "center" });
    doc.text(`ID Validación: AEC-${Math.random().toString(36).substring(7).toUpperCase()}`, 150, finalY + 20, { align: "center" });

    doc.save(`Reporte_Elite_ObraGo_${projectName || 'Scan'}.pdf`);
  } catch (error) {
    console.error("PDF Fail:", error);
    alert("Error crítico en el motor de PDF. Contacte a soporte.");
  }
};

export default function Scanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Cuenta Maestra CEO
  const isCEO = user?.email === 'michael.seura.delgado@gmail.com' || user?.phone === '+56969020506';
  const isUnlocked = isCEO || searchParams.get('status') === 'approved';

  const [step, setStep] = useState('config');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [signature, setSignature] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // [v20.1] Auto-Restore and Auto-Download on MP Return
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'approved') {
      const savedData = sessionStorage.getItem('pendingScanData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setScanResult(parsed.scanResult);
        setMaterials(parsed.materials);
        setCostBreakdown(parsed.costBreakdown);
        setSignature(parsed.signature);
        setVoiceNotes(parsed.voiceNotes);
        setName(parsed.name);
        setStep('result');
        
        // Disparar descarga automática después de un breve delay
        // Capturar GPS antes de generar PDF
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
              generateElitePDF(parsed.name, parsed.scanResult, parsed.costBreakdown, parsed.materials, parsed.signature, parsed.voiceNotes, coords);
            },
            () => {
              generateElitePDF(parsed.name, parsed.scanResult, parsed.costBreakdown, parsed.materials, parsed.signature, parsed.voiceNotes, null);
            }
          );
        } else {
          generateElitePDF(parsed.name, parsed.scanResult, parsed.costBreakdown, parsed.materials, parsed.signature, parsed.voiceNotes, null);
        }
      }
    }
  }, [searchParams]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simular transcripción después de 3 segundos
      setTimeout(() => {
        setIsRecording(false);
        setVoiceNotes("Se detecta necesidad de refuerzo estructural en la zona sur del radier según inspección visual.");
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignature(canvas.toDataURL('image/png'));
    setShowSignaturePad(false);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      alert("Puedes subir un máximo de 10 fotografías o planos a la vez.");
      return;
    }

    setIsLoading(true);
    setStep('loading');

    const formData = new FormData();
    
    // Configuración de compresión
    const options = {
      maxSizeMB: 1, // Reducimos a 1MB máximo por imagen para que 10 fotos no pesen más de 10MB
      maxWidthOrHeight: 1280,
      useWebWorker: true
    };

    // Comprimir todas las imágenes en paralelo
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          return await imageCompression(file as File, options);
        } catch (e) {
          console.error("Error comprimiendo, usando original", e);
          return file; // Fallback al original
        }
      })
    );

    // Añadir al FormData
    compressedFiles.forEach((file, index) => {
      formData.append('images', file, `image_${index}.jpg`); // 'images' coincide con upload.array('images', 10)
    });

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

  const handleDownload = async () => {
    if (!isUnlocked) {
      setIsPaying(true);
      try {
        // Persistir datos para recuperarlos al volver del checkout
        sessionStorage.setItem('pendingScanData', JSON.stringify({
          scanResult,
          materials,
          costBreakdown,
          signature,
          voiceNotes,
          name
        }));

        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${API_URL}/api/payment/create-preference`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ projectName: name })
        });
        
        const data = await res.json();
        if (data.initPoint) {
          window.location.href = data.initPoint;
        }
      } catch (error) {
        console.error("Payment Error:", error);
        alert("Error al conectar con Mercado Pago");
      } finally {
        setIsPaying(false);
      }
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          generateElitePDF(name, scanResult, costBreakdown, materials, signature, voiceNotes, coords);
        },
        () => {
          generateElitePDF(name, scanResult, costBreakdown, materials, signature, voiceNotes, null);
        }
      );
    } else {
      generateElitePDF(name, scanResult, costBreakdown, materials, signature, voiceNotes, null);
    }
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
            <h2 className="text-4xl font-black italic tracking-tighter text-[#D4AF37]">Dimensiones</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Nombre Proyecto / Partida" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-lg font-bold focus:border-[#D4AF37] outline-none transition-all" 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Región" 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                />
                <input 
                  type="text" 
                  placeholder="Comuna" 
                  value={comuna} 
                  onChange={(e) => setComuna(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                />
              </div>
            </div>
            
            <Button 
              onClick={() => setStep('scan')}
              className="w-full h-16 bg-[#D4AF37] text-black font-black rounded-2xl text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              SIGUIENTE: CAPTURAR
            </Button>
            <p className="text-[10px] text-center text-[#D4AF37]/40 font-bold uppercase tracking-widest">Validación de Campo: Activa</p>
          </div>
        )}

        {step === 'scan' && (
          <div className="flex flex-col items-center gap-8">
            <div onClick={() => fileInputRef.current?.click()} className="w-56 h-56 border-4 border-dashed border-[#D4AF37]/30 rounded-[60px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group relative">
              <Camera className="w-16 h-16 text-[#D4AF37] group-hover:scale-110 transition-transform mb-2" />
              <span className="text-[#D4AF37]/70 font-bold text-xs text-center px-4">Subir hasta 10 fotos<br/>o planos 2D</span>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" multiple />
            </div>
            
            <div className="text-center space-y-2 mt-4">
              <h3 className="text-2xl font-black italic tracking-tighter text-[#D4AF37]">Captura la Faena</h3>
              <p className="text-sm text-[#D4AF37]/70">El Cerebro IA fusionará las imágenes</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/5 border border-white/10'}`}
              >
                <Mic className={`w-6 h-6 ${isRecording ? 'text-white' : 'text-slate-400'}`} />
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {isRecording ? 'Grabando Nota...' : (voiceNotes ? 'Nota Grabada ✓' : 'Grabar Observación')}
              </p>
            </div>
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
              <div className="absolute top-0 right-0 p-6 flex gap-2">
                  {voiceNotes && (
                    <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                      <Mic className="w-3 h-3 text-primary" />
                      <span className="text-[8px] font-bold text-primary uppercase">Nota de Voz OK</span>
                    </div>
                  )}
                  <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
              </div>
              
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-4">Presupuesto AEC Generado</p>
              <h3 className="text-5xl font-black text-white tracking-tighter">
                ${Math.round(costBreakdown.total * 1.19).toLocaleString('es-CL')}
              </h3>
              
              {voiceNotes && (
                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Observación de Campo (IA Transcribe)</p>
                  <p className="text-[11px] text-slate-300 italic">"{voiceNotes}"</p>
                </div>
              )}

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

              <div className="mt-10 space-y-4">
                {signature ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={signature} className="h-16 border-b border-white/20" alt="Firma" />
                    <button onClick={() => setShowSignaturePad(true)} className="text-[10px] text-[#D4AF37] font-bold uppercase">Cambiar Firma</button>
                  </div>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setShowSignaturePad(true)}
                    className="w-full h-12 border-white/20 text-white font-bold rounded-2xl"
                  >
                    AÑADIR FIRMA DIGITAL
                  </Button>
                )}
                
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={handleDownload}
                    disabled={isPaying && !isUnlocked}
                    className={`w-full h-16 ${isUnlocked ? 'bg-green-500' : 'bg-[#D4AF37]'} text-black font-black rounded-2xl text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3`}
                  >
                    {isPaying && !isUnlocked ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        PROCESANDO PAGO...
                      </>
                    ) : isUnlocked ? (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        REPORTE ELITE DESBLOQUEADO {isCEO ? '(CEO)' : ''}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        DESCARGAR REPORTE ELITE
                      </>
                    )}
                  </Button>

                  {isUnlocked && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const worksheet = XLSX.utils.json_to_sheet(materials.map((m, i) => ({
                            "Ítem": `1.${i+1}`,
                            "Descripción": m.nombre,
                            "Cantidad": m.cantidad.toFixed(2),
                            "Unidad": m.unidad,
                            "Costo Total Estimado": Math.round(m.costo)
                          })));
                          const workbook = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(workbook, worksheet, "Materiales");
                          XLSX.writeFile(workbook, `ObraGo_Presupuesto_${name || 'Scan'}.xlsx`);
                        }}
                        className="h-14 border-green-500/30 text-green-400 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs hover:bg-green-500/10"
                      >
                        <Download className="w-4 h-4" />
                        EXCEL
                      </Button>

                      <Button 
                        variant="outline"
                        onClick={() => generateSumaAlzadaContract(name, costBreakdown, materials)}
                        className="h-14 border-blue-500/30 text-blue-400 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs hover:bg-blue-500/10"
                      >
                        <FileText className="w-4 h-4" />
                        CONTRATO
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const msg = encodeURIComponent(`¡Hola! Acabo de calcular un presupuesto de $${Math.round(costBreakdown.total * 1.19).toLocaleString('es-CL')} para mi proyecto ${name} usando Obra Go. Mira el análisis aquí: ${window.location.href}`);
                        window.open(`https://wa.me/?text=${msg}`, '_blank');
                      }}
                      className="h-14 border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs"
                    >
                      <Share2 className="w-4 h-4" />
                      WHATSAPP
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => alert("Iniciando Proyección en Realidad Aumentada (Beta). Por favor, apunte su cámara al suelo.")}
                      className="h-14 border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs"
                    >
                      <Zap className="w-4 h-4" />
                      VER EN AR
                    </Button>
                  </div>
                </div>

                <p className="text-[9px] text-gray-600 mt-4 uppercase font-black tracking-widest">
                   {isUnlocked ? '🔓 Ingeniería AEC Activada' : '🔐 Pago Seguro via Mercado Pago Chile'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex flex-col p-6 items-center justify-center">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-black text-[#D4AF37] italic uppercase tracking-tighter">Firma Digital</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Dibuja tu firma en el recuadro</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
              <canvas 
                ref={canvasRef}
                width={350}
                height={200}
                className="w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={clearSignature} className="h-14 rounded-2xl font-black uppercase text-xs border-white/10">Limpiar</Button>
              <Button onClick={saveSignature} className="h-14 bg-[#D4AF37] text-black rounded-2xl font-black uppercase text-xs">Guardar Firma</Button>
            </div>
            <Button variant="ghost" onClick={() => setShowSignaturePad(false)} className="w-full text-[10px] text-slate-500 font-bold uppercase">Cancelar</Button>
          </div>
        </div>
      )}

      <footer className="p-8 text-center border-t border-white/5 bg-black/20">
        <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em]">Obra Go Pro v9.5 Deployment</p>
      </footer>
    </div>
  );
}


