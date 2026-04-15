import React from 'react';
import { motion } from 'framer-motion';

interface AdSenseSlotProps {
  id: string;
  className?: string;
}

// [v1.0] Premium AdSense Container
// Diseño unificado con bordes redondeados y margen dorado sutil.

export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({ id, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className={`relative rounded-[24px] overflow-hidden border border-primary/20 bg-card/40 backdrop-blur-sm shadow-xl p-0.5 group ${className}`}
    >
      {/* Golden Sutil Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50 group-hover:opacity-80 transition-opacity" />
      
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center min-h-[100px] bg-[#000000]/40 rounded-[22px] border border-white/5">
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40 mb-2">Anuncio Publicitario</span>
        
        {/* Placeholder para Google AdSense */}
        <div className="w-full flex items-center justify-center">
          <ins className="adsbygoogle block"
               data-ad-client={import.meta.env.VITE_ADSENSE_ID || "ca-pub-0000000000000000"}
               data-ad-slot={id}
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
        
        <p className="text-[7px] font-bold text-muted-foreground/30 mt-2 uppercase">Google AdSense - Obra Go Partner</p>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-1 h-1 bg-primary/20 rounded-full" />
      <div className="absolute bottom-2 right-2 w-1 h-1 bg-primary/20 rounded-full" />
    </motion.div>
  );
};
