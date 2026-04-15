import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

// [v1.0] Autonomous Support Widget - Obra Go Chile
// Integración con Ingeniero de Soporte IA (GPT-4o)

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: '¡Hola! Soy el Ingeniero de Soporte de Obra Go. ¿En qué puedo ayudarte sobre tu cálculo o el uso de la plataforma?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/api/chat/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }))
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, tuve un problema de conexión técnico. ¿Podrías intentar de nuevo o contactarme vía WhatsApp?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-[350px] md:w-[400px] h-[500px] bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col mb-4 mr-2 backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="bg-primary p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-black font-black uppercase text-xs tracking-tighter">Ingeniero de Soporte</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-black/60 uppercase">En Línea • Autónomo</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
            >
              {messages.map((m, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex ${m.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    m.role === 'bot' 
                      ? 'bg-white/5 text-white border border-white/5 rounded-tl-none' 
                      : 'bg-primary text-black font-bold rounded-tr-none'
                  }`}>
                    {m.content}
                    {m.content.includes('wa.me') && (
                        <a 
                            href={m.content.match(/https?:\/\/wa\.me\/[^\s]*/)?.[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block mt-2 font-black underline uppercase text-[10px]"
                        >
                            Contactar Ingeniería WhatsApp →
                        </a>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">IA Analizando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-6 pt-0 bg-transparent">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[24px] border border-white/5 focus-within:border-primary/50 transition-all">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe tu consulta técnica..."
                  className="flex-1 bg-transparent px-2 text-xs font-bold text-white outline-none placeholder:text-slate-600"
                  aria-label="Mensaje para el bot"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-full bg-primary hover:bg-white text-black p-0 shrink-0"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group h-16 px-6 bg-primary hover:bg-white text-black rounded-full shadow-2xl shadow-primary/40 flex items-center gap-3 border border-black/10"
      >
        <span className="text-xs font-black uppercase tracking-tighter items-center hidden md:block">
          ¿Dudas? Habla con ingeniería
        </span>
        <MessageSquare className="w-6 h-6" />
        
        {/* Notification Dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </motion.button>
    </div>
  );
};
