import { useState, useEffect, useRef } from 'react';
import { X, Box, Layers, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AROverlayProps {
  onClose: () => void;
  scanResult: any;
}

export default function AROverlay({ onClose, scanResult }: AROverlayProps) {
  const [isXRay, setIsXRay] = useState(false);
  const [isDrawingPipes, setIsDrawingPipes] = useState(false);
  const [isSunTracking, setIsSunTracking] = useState(false);
  const [pipeLength, setPipeLength] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col">
      {/* Video Background */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* AR HUD */}
      <div className="relative flex-1 p-6 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <h3 className="text-[#D4AF37] font-black italic tracking-tighter text-xl">MODO AR AS-BUILT</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital Twin Proyección V18.0</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
           {isSunTracking ? (
             <div className="w-96 h-96 border-t-4 border-dashed border-orange-500 rounded-full flex flex-col items-center justify-start pt-4 relative animate-[spin_20s_linear_infinite]">
                <div className="w-8 h-8 bg-orange-400 rounded-full shadow-[0_0_30px_rgba(251,146,60,1)] flex items-center justify-center">
                  <span className="text-[6px] font-black text-black">SOL</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <p className="text-[#D4AF37] font-black text-xs uppercase bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">NCh 1079: Asoleamiento</p>
                </div>
             </div>
           ) : isDrawingPipes ? (
             <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute top-0 left-1/2 w-1 h-32 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] rounded-full"></div>
                <div className="absolute bottom-0 right-1/2 w-32 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] rounded-full"></div>
                <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-400 rounded-full flex items-center justify-center cursor-crosshair" onClick={() => setPipeLength(p => p + 1.5)}>
                  <span className="text-blue-400 text-[10px] font-black">TRAZAR</span>
                </div>
             </div>
           ) : (
             <div className="w-64 h-64 border-2 border-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 border border-[#D4AF37]/50 rounded-full animate-ping"></div>
                <MousePointer2 className="w-8 h-8 text-[#D4AF37] absolute" />
             </div>
           )}
        </div>

        {/* AR Data Overlays */}
        <div className="space-y-4 pointer-events-auto">
          <AnimatePresence>
            {isXRay && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-blue-500/20 backdrop-blur-xl border border-blue-500/40 p-6 rounded-[35px] shadow-[0_0_30px_rgba(59,130,246,0.3)]"
              >
                <div className="flex items-center gap-3 mb-2 text-blue-400">
                   <Layers className="w-5 h-5 animate-pulse" />
                   <p className="text-xs font-black uppercase tracking-widest">Capa Invisible: Instalaciones Detectadas</p>
                </div>
                <p className="text-sm text-blue-100 font-bold italic">"Proyectando trazado de tuberías y enfierradura interna según escaneo previo..."</p>
                <div className="mt-4 h-1 bg-blue-500/30 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-400 animate-[progress_2s_infinite_linear]" style={{ width: '40%' }}></div>
                </div>
              </motion.div>
            )}

            {isDrawingPipes && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-blue-400/30 p-4 rounded-3xl flex justify-between items-center"
              >
                 <div>
                   <p className="text-[10px] text-blue-400 font-black uppercase">Trazado Tubería PPR / Conduit</p>
                   <p className="text-2xl font-black text-white">{pipeLength.toFixed(1)} ml</p>
                 </div>
                 <button onClick={() => setPipeLength(0)} className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full uppercase font-bold">Reset</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-black/60 backdrop-blur-2xl border border-[#D4AF37]/30 p-6 rounded-[40px] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-1">Malla Digital</p>
              <h4 className="text-2xl font-black text-white italic tracking-tighter">
                {scanResult?.dimensiones?.largo}m x {scanResult?.dimensiones?.ancho}m
              </h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Precisión IA: 99.2% (BIM Validated)</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => { setIsDrawingPipes(!isDrawingPipes); setIsXRay(false); setIsSunTracking(false); }}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all ${isDrawingPipes ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/10 text-slate-400'}`}
              >
                <span className="text-lg">📏</span>
                <span className="text-[7px] font-black uppercase mt-1">TUBOS</span>
              </button>
              
              <button 
                onClick={() => { setIsSunTracking(!isSunTracking); setIsXRay(false); setIsDrawingPipes(false); }}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all ${isSunTracking ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 'bg-white/10 text-slate-400'}`}
              >
                <span className="text-lg">☀️</span>
                <span className="text-[7px] font-black uppercase mt-1">NCh1079</span>
              </button>

              <button 
                onClick={() => { setIsXRay(!isXRay); setIsDrawingPipes(false); setIsSunTracking(false); }}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all ${isXRay ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-white/10 text-slate-400'}`}
              >
                <Box className="w-5 h-5" />
                <span className="text-[7px] font-black uppercase mt-1">X-RAY</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
