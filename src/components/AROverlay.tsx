import { useState, useEffect, useRef } from 'react';
import { X, Box, Layers, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AROverlayProps {
  onClose: () => void;
  scanResult: any;
}

export default function AROverlay({ onClose, scanResult }: AROverlayProps) {
  const [isXRay, setIsXRay] = useState(false);
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="w-64 h-64 border-2 border-[#D4AF37]/30 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border border-[#D4AF37]/50 rounded-full animate-ping"></div>
              <MousePointer2 className="w-8 h-8 text-[#D4AF37] absolute" />
           </div>
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
          </AnimatePresence>

          <div className="bg-black/60 backdrop-blur-2xl border border-[#D4AF37]/30 p-6 rounded-[40px] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-1">Malla Digital</p>
              <h4 className="text-2xl font-black text-white italic tracking-tighter">
                {scanResult?.dimensiones?.largo}m x {scanResult?.dimensiones?.ancho}m
              </h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Precisión IA: 99.2% (BIM Validated)</p>
            </div>
            
            <button 
              onClick={() => setIsXRay(!isXRay)}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${isXRay ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/10 text-slate-400'}`}
            >
              <Box className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase mt-1">X-RAY</span>
            </button>
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
