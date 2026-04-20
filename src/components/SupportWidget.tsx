// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ShieldCheck, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * COMPONENTE DE SOPORTE ELITE - MICHAEL SEURA
 * IDENTIDAD VISUAL MS GOLD BADGE
 */
export const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: "¡Hola! Soy Michael de Obra Go. Ya validé tu presupuesto de $111M. ¿Te ayudo con el APU o quieres bajar el Reporte Élite por $2.990?"
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
      setHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Error de red. Contáctame directamente por WhatsApp." 
      }]);
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
            className="mb-4 w-[380px] h-[580px] bg-[#1a1c22]/95 border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            {/* Header MS Gold */}
            <div className="p-6 bg-[#1e222d] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-500/30 flex items-center justify-center shadow-xl">
                    <span className="text-black font-black text-lg tracking-tighter">MS</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1e222d] shadow-sm animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm leading-none tracking-tight">Michael Seura</h3>
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Fundador Obra Go
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-white/70" />
              </button>
            </div>

            {/* Area de Chat */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {history.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end font-bold' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md
                    ${msg.role === 'user' 
                      ? 'bg-orange-500 text-black rounded-tr-none' 
                      : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none'}
                  `}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start px-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer con Entrada */}
            <div className="p-4 bg-black/50 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu consulta..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="w-12 h-12 bg-orange-500 text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
                >
                  <Send className="w-5 h-5 shadow-lg" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante Principal */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-[22px] shadow-2xl flex items-center justify-center transition-all duration-500 relative
          ${isOpen ? 'bg-white text-black' : 'bg-orange-500 text-black border-2 border-white/20'}
        `}
      >
        {isOpen ? <X className="w-8 h-8" /> : (
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl font-black tracking-tighter">MS</span>
          </div>
        )}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-[#0f1115] flex items-center justify-center shadow-lg">
            <span className="text-[10px] font-black text-white">1</span>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default SupportWidget;
