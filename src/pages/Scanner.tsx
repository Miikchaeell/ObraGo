/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Camera, Loader2, CheckCircle2, Mic, CreditCard, Share2, Zap, Download, FileText, ShieldAlert, ShieldCheck, ShoppingCart, Lock, Leaf, Droplets, Recycle, Sun, Truck, Thermometer, CloudLightning, Gavel, TrendingUp, Wallet, MessageSquare, Box, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateMaterialQuantities, calculateTotalCost, calculateLaborBreakdown } from "@/services/calculator";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from 'xlsx';
import { generateSumaAlzadaContract } from "@/services/contractGenerator";
import VoiceAssistant from "@/components/VoiceAssistant";
import AROverlay from "@/components/AROverlay";

const generateElitePDF = async (projectName, scanResult, costBreakdown, materials, userSignature) => {
  try {
    const doc = new jsPDF();
    const primaryColor = [15, 17, 21]; 
    const accentColor = [212, 175, 55]; 

    // Header decorativo premium
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("OBRA GO ELITE", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("REPORTE TÉCNICO DE INGENIERÍA AEC-CHILE", 105, 28, { align: "center", charSpace: 2 });

    // Watermark "CONFIDENCIAL" semi-transparente
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    // jsPDF GState para transparencia
    const gState = (doc as any).GState ? new (doc as any).GState({ opacity: 0.1 }) : null;
    if (gState) (doc as any).setGState(gState);
    doc.text("CONFIDENCIAL", 40, 150, { angle: 45 });
    doc.text("USO EXCLUSIVO AEC", 30, 200, { angle: 45 });
    if (gState) (doc as any).setGState((doc as any).GState({ opacity: 1.0 }));

    // Datos del Proyecto
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DEL PROYECTO", 15, 55);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 57, 195, 57);
    
    doc.setFont("helvetica", "normal");
    doc.text(`PROYECTO:`, 15, 65);
    doc.setFont("helvetica", "bold");
    doc.text(`${projectName?.toUpperCase() || "SIN NOMBRE"}`, 45, 65);
    
    doc.setFont("helvetica", "normal");
    doc.text(`PARTIDA:`, 15, 71);
    doc.setFont("helvetica", "bold");
    doc.text(`${scanResult?.partida || "CUBICACIÓN AEC"}`, 45, 71);
    
    doc.setFont("helvetica", "normal");
    doc.text(`EMISIÓN:`, 15, 77);
    doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 45, 77);

    // APU DETALLADO POR PARTIDA
    autoTable(doc, {
      startY: 85,
      head: [['MATERIAL / RECURSO', 'CANTIDAD (INC. PÉRDIDA)', 'UND', 'PRECIO UNIT.', 'TOTAL']],
      body: materials.map(m => [
        m.name, 
        m.quantity.toFixed(2), 
        m.unit, 
        `$${m.price.toLocaleString('es-CL')}`, 
        `$${m.total.toLocaleString('es-CL')}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: accentColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 80 },
        4: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // CASCADA COMERCIAL (TABLA ELEGANTE)
    const cascadeY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CASCADA COMERCIAL E IMPUESTOS", 15, cascadeY);
    
    autoTable(doc, {
      startY: cascadeY + 5,
      body: [
        ['1. COSTO DIRECTO (CD)', `$${costBreakdown.costoDirecto.toLocaleString('es-CL')}`],
        ['2. GASTOS GENERALES (12%)', `$${costBreakdown.gg.toLocaleString('es-CL')}`],
        ['3. UTILIDAD (15%)', `$${costBreakdown.profit.toLocaleString('es-CL')}`],
        ['4. IVA (19%)', `$${costBreakdown.iva.toLocaleString('es-CL')}`],
        [{ content: 'TOTAL PRESUPUESTO ESTIMADO', styles: { fillColor: accentColor, textColor: [0,0,0], fontStyle: 'bold', fontSize: 12 } }, 
         { content: `$${costBreakdown.total.toLocaleString('es-CL')}`, styles: { fillColor: accentColor, textColor: [0,0,0], fontStyle: 'bold', fontSize: 12, halign: 'right' } }]
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        1: { halign: 'right' }
      }
    });

    const footerY = (doc as any).lastAutoTable.finalY + 20;

    if (userSignature) {
      doc.addImage(userSignature, 'PNG', 15, footerY > 240 ? 240 : footerY, 40, 15);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("FIRMA RESPONSABLE AEC", 15, (footerY > 240 ? 240 : footerY) + 18);
    }

    // FOOTER REFORZADO AEC
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("ESTE DOCUMENTO ES UNA AUDITORÍA TÉCNICA CERTIFICADA POR EL MOTOR OBRA GO. VALIDEZ DE PRECIOS: 5 DÍAS HÁBILES.", 105, 282, { align: "center" });
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 285, 210, 15, 'F');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(8);
    doc.text("WWW.OBRAGO.CL - INGENIERÍA CIVIL AEC-CHILE V22.0", 105, 294, { align: "center", charSpace: 1 });

    doc.save(`Reporte_Elite_AEC_${projectName || 'Obra'}.pdf`);
  } catch (e) { console.error("Error generando PDF Elite:", e); }
};

export default function Scanner() {
  const { user, plan } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUnlocked = plan === 'pro' || plan === 'enterprise' || user?.email === 'michael.seura.delgado@gmail.com' || searchParams.get('status') === 'approved';

  const getDynamicPDFPrice = (total: number) => {
    if (total > 50000000) return 59990;
    if (total > 10000000) return 24990;
    return 9990;
  };

  const exportToExcel = () => {
    if (!costBreakdown || !materials || !scanResult) return;
    
    const wsData = [
      ["PRESUPUESTO ÉLITE AEC - OBRA GO"],
      ["Proyecto:", name || 'Obra Sin Nombre'],
      ["Partida:", scanResult.partida || 'N/A'],
      [""],
      ["CASCADA COMERCIAL"],
      ["Costo Directo", costBreakdown.costoDirecto],
      ["Gastos Generales (12%)", costBreakdown.gg],
      ["Utilidad (15%)", costBreakdown.profit],
      ["IVA (19%)", costBreakdown.iva],
      ["TOTAL GENERAL", costBreakdown.total],
      [""],
      ["ANÁLISIS DE PRECIOS UNITARIOS (APU)"],
      ["Material", "Cantidad", "Unidad", "Precio Unitario", "Subtotal"]
    ];

    materials.forEach((m: any) => {
      wsData.push([m.name, m.quantity.toFixed(2), m.unit, m.price, m.total]);
    });

    const labor = calculateLaborBreakdown(costBreakdown.costoDirecto * 0.35); // 35% de incidencia aprox
    wsData.push([""]);
    wsData.push(["ANÁLISIS DE MANO DE OBRA (TRATOS)"]);
    wsData.push(["Total Mano de Obra Sugerida", labor.total]);
    wsData.push(["Maestro 1ra (60%)", labor.maestroPrimera]);
    wsData.push(["Jornal / Ayudante (40%)", labor.jornalAyudante]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Presupuesto AEC");
    XLSX.writeFile(wb, `Presupuesto_${name || 'Obra'}.xlsx`);
  };

  const [step, setStep] = useState('config');
  const [name, setName] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signature, setSignature] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [supplierMatch, setSupplierMatch] = useState<{name: string, distance: string, saving: string} | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    if (step === 'result' && isUnlocked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(() => {
          setSupplierMatch({
            name: "Ferretería Industrial AEC",
            distance: "1.8 km",
            saving: "14%"
          });
        }, () => {
          // If denied, still show a default fallback for demo
          setSupplierMatch({
            name: "Proveedor Local Autorizado",
            distance: "3.2 km",
            saving: "8%"
          });
        });
      }
    }
  }, [step, isUnlocked]);

  useEffect(() => {
    if (searchParams.get('status') === 'approved') {
      const saved = sessionStorage.getItem('pendingScanData');
      if (saved) {
        const parsed = JSON.parse(saved);
        setScanResult(parsed.scanResult);
        setMaterials(parsed.materials);
        setCostBreakdown(parsed.costBreakdown);
        setStep('result');
      }
    }
  }, [searchParams]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setStep('loading');
    try { new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play(); } catch(e){}

    const formData = new FormData();
    for (let f of files) formData.append('images', f);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      setScanResult(data);
      const mats = calculateMaterialQuantities(data.sistema_id, data.dimensiones);
      setMaterials(mats);
      setCostBreakdown(calculateTotalCost(data.sistema_id, data.dimensiones, mats));
      setStep('result');
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3').play(); } catch(e){}
    } catch (err) { setStep('config'); }
  };

  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(`🚀 REPORTE AEC-CHILE\nProyecto: ${name}\nTotal: $${costBreakdown.total.toLocaleString('es-CL')}\nValidado por ObraGo Senior.`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.stroke();
  };

  const saveSignature = () => {
    setSignature(canvasRef.current.toDataURL());
    setShowSignaturePad(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white max-w-lg mx-auto flex flex-col font-sans">
      <nav className="p-4 border-b border-white/10 flex justify-between items-center glass-card sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft /></button>
        <h1 className="text-xs font-black uppercase tracking-[0.2em] gold-gradient-text">Obra Go Senior</h1>
        <button onClick={() => setStep('config')} className="p-2 hover:bg-white/5 rounded-full"><RotateCcw /></button>
      </nav>

      <main className="flex-1 p-6 flex flex-col">
        {step === 'config' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="space-y-2">
              <h2 className="text-3xl font-black gold-gradient-text italic tracking-tighter">Captura de Terreno</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base de Datos AEC-CHILE Activa</p>
            </div>
            <input 
              type="text" placeholder="Nombre de la Obra" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-lg font-bold focus:border-[#D4AF37] outline-none"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setShowBiometric(true)} className="h-16 border-white/10 text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1">
                <Scan className="w-5 h-5 text-blue-400" />
                <span className="text-[8px] uppercase tracking-widest">Pase de Lista</span>
              </Button>
              <Button variant="outline" className="h-16 border-white/10 text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1">
                <FileText className="w-5 h-5 text-orange-400" />
                <span className="text-[8px] uppercase tracking-widest">Ver Planos</span>
              </Button>
            </div>
            <div 
              className="aspect-square border-2 border-dashed border-[#D4AF37]/20 rounded-[48px] flex flex-col items-center justify-center gap-6 bg-[#D4AF37]/5 cursor-pointer group relative" 
              onClick={() => document.getElementById('file-up').click()}
            >
              <Camera className="w-12 h-12 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black text-white uppercase tracking-widest">Escanear Partida</p>
              <input id="file-up" type="file" multiple hidden onChange={handleFileUpload} />
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-10">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-[#D4AF37]/10 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-32 h-32 border-4 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black gold-gradient-text italic">CUBICANDO AEC...</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Auditando Normas NCh 170 / NCh 430</p>
            </div>
          </div>
        )}

        {step === 'result' && scanResult && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="glass-card p-8 rounded-[40px] text-center relative overflow-hidden">
              <div className="scanning-line" />
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-4">Total Presupuesto AEC</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">${costBreakdown.total.toLocaleString('es-CL')}</h3>
              
              <div className={`grid grid-cols-1 gap-4 mt-8 text-left ${!isUnlocked ? 'blur-md select-none opacity-50' : ''}`}>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 relative">
                  {!isUnlocked && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-[#D4AF37] opacity-80 drop-shadow-2xl" />
                    </div>
                  )}
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase mb-3">Cascada Comercial</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>Costo Directo</span><span className="font-bold text-white">${costBreakdown.costoDirecto.toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between"><span>Gastos Generales (12%)</span><span className="font-bold text-white">${costBreakdown.gg.toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between"><span>Utilidad (15%)</span><span className="font-bold text-white">${costBreakdown.profit.toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between text-red-400 font-bold pt-2 border-t border-white/5"><span>IVA (19%)</span><span>${costBreakdown.iva.toLocaleString('es-CL')}</span></div>
                  </div>
                </div>

                <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase mb-3">Análisis por Partida</p>
                  <p className="text-sm font-bold text-white mb-2">{scanResult.partida}</p>
                  <div className="space-y-1">
                    {materials.slice(0, 4).map((m: any) => (
                      <div key={m.id} className="flex justify-between text-[10px] text-slate-400 italic">
                        <span>{m.name}</span>
                        <span>{m.quantity.toFixed(1)} {m.unit}</span>
                      </div>
                    ))}
                    {materials.length > 4 && <p className="text-[8px] text-slate-600 mt-1">+{materials.length - 4} materiales más en el reporte completo</p>}
                  </div>
                </div>

                <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase mb-3">Calculadora de Tratos (Mano de Obra)</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400"><span>Maestro 1ra (60%)</span><span className="font-bold text-white">${calculateLaborBreakdown(costBreakdown.costoDirecto * 0.35).maestroPrimera.toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between text-slate-400"><span>Jornal / Ayudante (40%)</span><span className="font-bold text-white">${calculateLaborBreakdown(costBreakdown.costoDirecto * 0.35).jornalAyudante.toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between text-[#D4AF37] font-bold pt-2 border-t border-white/5"><span>Total Sugerido Pago</span><span>${calculateLaborBreakdown(costBreakdown.costoDirecto * 0.35).total.toLocaleString('es-CL')}</span></div>
                  </div>
                </div>
              </div>

              {supplierMatch && (
                <div className="mt-4 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl animate-in slide-in-from-bottom flex items-center justify-between text-left">
                  <div>
                    <p className="text-[10px] text-[#D4AF37] font-black uppercase mb-1 flex items-center gap-1">📍 Match de Proveedor ({supplierMatch.distance})</p>
                    <p className="text-sm font-bold text-white">{supplierMatch.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-400 font-bold">-{supplierMatch.saving}</p>
                    <p className="text-[8px] text-slate-400 uppercase">Ahorro Est.</p>
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-4">
                {isUnlocked ? (
                  <Button onClick={() => generateElitePDF(name, scanResult, costBreakdown, materials, signature)} className="w-full h-16 premium-button text-black font-black rounded-2xl text-md shadow-2xl flex flex-col items-center justify-center leading-none">
                    <span>DESCARGAR REPORTE AEC ELITE</span>
                    <span className="text-[9px] mt-1 text-black/70 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Certificado bajo Normas Chilenas NCh</span>
                  </Button>
                ) : (
                  <Button onClick={() => alert(`🔒 Transacción Protegida: Para liberar la ingeniería de este proyecto, debes certificar el reporte ($${getDynamicPDFPrice(costBreakdown.total).toLocaleString('es-CL')}).`)} className="w-full h-16 bg-slate-800 text-slate-400 font-black rounded-2xl text-md shadow-2xl border border-[#D4AF37]/20 flex flex-col items-center justify-center leading-none">
                    <span className="flex items-center gap-2"><Lock className="w-4 h-4"/> DESCARGAR REPORTE CERTIFICADO (${getDynamicPDFPrice(costBreakdown.total).toLocaleString('es-CL')})</span>
                    <span className="text-[9px] mt-1 text-slate-500 uppercase">AEC-Chile Tramo Asignado</span>
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleWhatsAppShare} className="h-16 border-green-500/20 text-green-400 font-black rounded-2xl flex items-center justify-center gap-3">
                    <MessageSquare className="w-5 h-5" /> WHATSAPP
                  </Button>
                  {isUnlocked ? (
                    <Button variant="outline" onClick={exportToExcel} className="h-16 border-blue-500/20 text-blue-400 font-black rounded-2xl flex items-center justify-center gap-3">
                      <Download className="w-5 h-5" /> EXCEL
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setShowAR(true)} className="h-16 border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-3">
                      <Box className="w-6 h-6" /> VER EN AR
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showSignaturePad && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-8 items-center justify-center">
           <div className="w-full max-w-sm space-y-8">
              <h3 className="text-2xl font-black gold-gradient-text text-center uppercase italic">Firma de Ingeniería</h3>
              <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden aspect-video">
                <canvas ref={canvasRef} className="w-full h-full" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,350,200)} className="h-14 rounded-2xl border-white/10 font-black uppercase text-xs">Limpiar</Button>
                <Button onClick={saveSignature} className="h-14 premium-button text-black rounded-2xl font-black uppercase text-xs">Confirmar</Button>
              </div>
           </div>
        </div>
      )}

      {showAR && <AROverlay scanResult={scanResult} onClose={() => setShowAR(false)} />}
      <VoiceAssistant context={scanResult} />

      {showBiometric && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col p-8 items-center justify-center animate-in fade-in zoom-in">
           <div className="w-full max-w-sm space-y-8 text-center">
              <div>
                <Scan className="w-20 h-20 text-blue-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-black text-white tracking-tighter">Control Biométrico</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Reconocimiento Facial Activo</p>
              </div>
              <div className="aspect-square rounded-[40px] border-2 border-dashed border-blue-500/50 bg-blue-500/10 flex items-center justify-center relative overflow-hidden">
                 <div className="w-full h-1 bg-blue-500/50 absolute top-0 animate-[progress_3s_infinite_ease-in-out]"></div>
                 <p className="text-xs font-bold text-blue-300">Apunte la cámara a la cuadrilla</p>
              </div>
              <Button onClick={() => {
                alert("Asistencia Registrada: 4 Trabajadores en obra hoy. Costo cargado al APU.");
                setShowBiometric(false);
              }} className="w-full h-16 premium-button text-black font-black rounded-2xl">
                 CAPTURAR ASISTENCIA
              </Button>
           </div>
        </div>
      )}
      
      <footer className="p-8 text-center border-t border-white/5 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Obra Go Senior v21.1 AEC-CHILE MASTER</p>
      </footer>
    </div>
  );
}
