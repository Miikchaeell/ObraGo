// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RECONSTRUCCIÓN DE IDENTIDAD DE MARCA - OBRA GO V9.0
 * PERSONA: MICHAEL - FUNDADOR E INGENIERO SENIOR
 */

// Componente Avatar Pro para evitar fallos de ruta
const TeamAvatar = ({ size = "w-12 h-12" }) => (
  <div className={`relative ${size} shrink-0`}>
    <div 
      className="w-full h-full rounded-full border-2 border-[#D4AF37] bg-cover bg-center overflow-hidden shadow-xl"
      style={{ 
        backgroundImage: 'url("/src/assets/Agente_Michael.jpeg")', // Imagen principal de Michael
        backgroundColor: '#1a1c22'
      }}
    >
      {/* Fallback de iniciales si la carga falla */}
      <div className="w-full h-full flex items-center justify-center text-black bg-[#D4AF37] font-black text-lg">
        MS
      </div>
    </div>
    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1e222d] shadow-sm animate-pulse" />
  </div>
);

export const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: "¡Hola! Soy Michael de Obra Go. He validado técnicamente tu presupuesto de $111.203.650 bajo norma NCh 170. ¿Te ayudo con el análisis de materiales o prefieres bajar el Reporte Élite con el Mincho Chico detallado ahora mismo?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMessage = { role: 'user', content: message };
    setHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content, 
          history: history.slice(-3),
          metadata: { assignedEngineer: "Michael Seura" }
        }),
      });
      const data = await response.json();
      setHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'assistant', content: "Contáctame directamente por WhatsApp para el APU detallado." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] transition-all font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[400px] h-[600px] bg-[#1a1c22]/98 border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
          >
            {/* Header Persona */}
            <div className="p-6 bg-[#1e222d] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TeamAvatar />
                <div>
                  <h3 className="text-white font-black text-sm tracking-tight leading-none">Michael Seura</h3>
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Fundador e Ingeniero Senior
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                <X className="w-6 h-6 text-white/50" />
              </button>
            </div>

            {/* Chat History */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/5 text-white/90 border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-gray-500 font-bold uppercase animate-pulse">Michael está escribiendo...</div>}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/40 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Hablemos de tu presupuesto AEC..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="w-14 h-14 bg-[#D4AF37] text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[22px] bg-[#D4AF37] text-black shadow-2xl flex items-center justify-center hover:rotate-6 active:scale-95 transition-all duration-500 overflow-hidden"
      >
        {isOpen ? <X className="w-8 h-8" /> : <img src="/src/assets/Agente_Michael.jpeg" alt="Soporte" className="w-full h-full object-cover" />}
      </button>
    </div>
  );
};

export default SupportWidget;
