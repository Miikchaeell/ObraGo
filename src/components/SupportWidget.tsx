import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, ChevronDown, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([
    {
      role: 'assistant',
      content: "¡Hola! Soy Michael de Obra Go. Ya realicé la validación técnica de tu presupuesto. ¿Tienes dudas con las partidas o prefieres bajar el Reporte Élite con el APU detallado ahora mismo?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user' as const, content: message };
    setHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: history.slice(-5), // Send last 5 messages for context
          metadata: {
            assignedEngineer: "Michael",
            assignedPersona: "Founder & Senior Engineer"
          }
        }),
      });

      const data = await response.json();
      setHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Lo siento, tengo un problema puntual de conexión. ¿Puedes reintentar o hablarme por WhatsApp?" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[550px] bg-[#1a1c22] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 bg-[#1e222d]/95 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-2 border-black/20 shadow-lg">
                    <span className="text-black font-black text-lg tracking-tighter">MS</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1a1c22]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white leading-none">Michael</h3>
                  <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Fundador e Ingeniero Senior
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {history.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-primary text-black font-bold rounded-tr-none shadow-lg' 
                      : 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'}
                  `}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start italic text-white/30 text-[10px] animate-pulse ml-2">
                  Michael está validando...
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/40 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu consulta de ingeniería..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="w-12 h-12 bg-primary text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[9px] text-white/20 text-center mt-3 uppercase font-black tracking-widest">
                Obra Go Engineering Support v5.2
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-[22px] shadow-2xl flex items-center justify-center transition-all duration-300
          ${isOpen ? 'bg-white text-black' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black border-2 border-white/20'}
        `}
      >
        {isOpen ? <X className="w-8 h-8" /> : (
          <div className="flex items-center justify-center">
            <span className="text-xl font-black tracking-tighter">MS</span>
          </div>
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default SupportWidget;
