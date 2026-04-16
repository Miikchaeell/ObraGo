import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

// [v3.4] Support AI Elite - Roulette of Engineers & Protocolo "Identity Pro"
const ENGINEERS = ['Ricardo', 'Danitza', 'Michael', 'Cristopher', 'Francisco'];

interface SupportWidgetProps {
  metadata?: {
    projectName: string;
    dims: { largo: number; ancho: number; espesor: number };
    dosage: { resistencia: string; secado: string; armaduraTipo: string };
    totalCost: number;
    step: string;
  };
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ metadata }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Persistencia del Ingeniero asignado
  const assignedEngineer = useMemo(() => {
    const saved = localStorage.getItem('obrago_assigned_engineer');
    if (saved && ENGINEERS.includes(saved)) return saved;
    const random = ENGINEERS[Math.floor(Math.random() * ENGINEERS.length)];
    localStorage.setItem('obrago_assigned_engineer', random);
    return random;
  }, []);

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { 
        role: 'bot', 
        content: `Hola, soy ${assignedEngineer}, Ingeniero de Soporte de Obra Go. Estamos actualizando el sistema para incluir dosificaciones profesionales como R-7 y enfierradura. ¿En qué puedo ayudarte sobre tu cálculo técnico hoy?` 
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleTrigger = (e: any) => {
      const { message, forceOpen } = e.detail;
      setIsOpen(forceOpen || true);
      // Personalizamos el mensaje proactivo con la identidad del ingeniero
      const personalizedMessage = message.replace('¡Hola!', `Hola, soy ${assignedEngineer}.`);
      setMessages(prev => [...prev, { role: 'bot', content: personalizedMessage }]);
    };

    window.addEventListener('obra-go-bot-trigger', handleTrigger);
    return () => window.removeEventListener('obra-go-bot-trigger', handleTrigger);
  }, [assignedEngineer]);

  const handleSendMessage = async (forcedMessage?: string) => {
    const userMessage = forcedMessage || input.trim();
    if (!userMessage && !forcedMessage) return;
    if (isLoading) return;

    if (!forcedMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://obrascan-backend-v3.onrender.com";
      const res = await fetch(`${API_URL}/api/chat/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content })),
          metadata: {
            ...metadata,
            assignedEngineer // Enviamos el nombre para que la IA lo use
          }
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
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/10">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-black font-black uppercase text-[10px] tracking-tighter">Soporte: {assignedEngineer}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-black/60 uppercase tracking-widest">En Línea • Ingeniero AEC</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors border border-black/5"
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
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${
                    m.role === 'bot' 
                      ? 'bg-white/5 text-white border border-white/5 rounded-tl-none' 
                      : 'bg-primary text-black font-bold rounded-tr-none'
                  }`}>
                    {m.content}
                    {(m.content.includes('/api/checkout') || m.content.toLowerCase().includes('webpay')) && (
                        <button 
                            onClick={() => {
                                const payButton = document.getElementById('main-pay-button');
                                if (payButton) payButton.click();
                                else window.location.href = 'https://obrascan.vercel.app/api/checkout/pdf';
                            }}
                            className="block mt-3 bg-black text-primary p-2 rounded-lg font-black uppercase text-[9px] text-center w-full"
                        >
                            Ir a Webpay Seguro →
                        </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest">{assignedEngineer} está analizando...</span>
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
                  placeholder="Escribe tu consulta..."
                  className="flex-1 bg-transparent px-2 text-xs font-bold text-white outline-none placeholder:text-slate-600"
                  aria-label="Mensaje para el bot"
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-full bg-primary hover:bg-white text-black p-0 shrink-0 border-none"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group h-16 px-6 bg-primary hover:bg-white text-black rounded-full shadow-2xl shadow-primary/40 flex items-center gap-3 border border-black/10 transition-colors"
      >
        <div className="flex flex-col items-start mr-2 hidden md:flex">
            <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">Soporte AEC</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{assignedEngineer}</span>
        </div>
        <MessageSquare className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </motion.button>
    </div>
  );
};
