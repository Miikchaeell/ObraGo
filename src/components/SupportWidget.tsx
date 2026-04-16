import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

// [V4.0] Multi-Agente AEC - Identidad de Marca Obra Go
const AGENT_NAMES = ['Michael', 'Ricardo', 'Danitza', 'Cristopher', 'David'];

interface SupportWidgetProps {
  metadata?: {
    projectName: string;
    dims: { largo: number; ancho: number; espesor: number };
    dosage: { resistencia: string; secado: string; armaduraTipo: string };
    totalCost: number;
    step: string;
    category?: string;
  };
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ metadata }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Selección aleatoria del agente al cargar
  const activeAgent = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * AGENT_NAMES.length);
    return AGENT_NAMES[randomIndex];
  }, []);

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);

  // Lógica de Consultoría AEC (V4.0)
  const getAgentReply = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    const { resistencia, secado } = metadata?.dosage || { resistencia: 'G-25', secado: 'Estándar' };

    if (msg.includes('sí') || msg.includes('recomienda') || msg.includes('consejo') || msg.includes('opin')) {
      return `¡Vibrante elección! Para un ${resistencia} ${secado}, te recomiendo fijarte bien en el APU del reporte. Ahí verás por qué el curado es crítico en las primeras 48 horas para evitar fisuras. ¿Te gustaría que revisemos el desglose de materiales hoy?`;
    }

    if (msg.includes('pdf') || msg.includes('descargar') || msg.includes('pagar') || msg.includes('cuánto') || msg.includes('valor')) {
      return `El reporte profesional de Obra Go cuesta $2.990. Es una inversión mínima para tener un APU detallado (Mincho Chico) que respalde tu compra de materiales y contrato de mano de obra. ¿Quieres que te enviemos el link de pago seguro?`;
    }

    if (msg.includes('apu') || msg.includes('mincho')) {
        return `El APU de Obra Go desglosa Materiales, Mano de Obra y Equipos por separado. Aplicamos los Gastos Generales y Utilidad al final para que tengas transparencia total. Es la mejor herramienta para negociar en terreno.`;
    }

    return `Entiendo. Como parte del equipo de Obra Go, mi meta es que tu proyecto sea exacto. ¿Quieres que profundicemos en la dosificación de ${resistencia} o prefieres descargar el APU completo ahora mismo?`;
  };

  // Inicializar chat con marca
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([
          { 
              role: 'bot', 
              content: `Hola, soy ${activeAgent} de Obra Go. Estoy analizando tu proyecto para darte la mejor asesoría técnica. ¿En qué puedo ayudarte con tu presupuesto hoy?` 
          }
        ]);
    }
  }, [activeAgent, messages.length]);

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
      const personalizedMessage = message.replace('¡Hola!', `Hola, soy ${activeAgent}.`);
      setMessages(prev => [...prev, { role: 'bot', content: personalizedMessage }]);
    };

    window.addEventListener('obra-go-bot-trigger', handleTrigger);
    return () => window.removeEventListener('obra-go-bot-trigger', handleTrigger);
  }, [activeAgent]);

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
            assignedAgent: activeAgent,
            brandLogo: 'Obra Go'
          }
        })
      });
      
      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: getAgentReply(userMessage) }]);
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
                  <h4 className="text-black font-black uppercase text-[10px] tracking-tighter">{activeAgent} de Obra Go</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-black/60 uppercase tracking-widest">Soporte AEC Activo</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-lg border border-black/5">
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((m, idx) => (
                <motion.div initial={{ opacity: 0, x: m.role === 'bot' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} key={idx} className={`flex ${m.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${m.role === 'bot' ? 'bg-white/5 text-white border border-white/5 rounded-tl-none' : 'bg-primary text-black font-bold rounded-tr-none'}`}>
                    {m.content}
                    {(m.content.includes('/api/checkout') || m.content.toLowerCase().includes('webpay')) && (
                        <button onClick={() => { document.getElementById('main-pay-button')?.click(); }} className="block mt-3 bg-black text-primary p-2 rounded-lg font-black uppercase text-[9px] text-center w-full">Completar en Webpay →</button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Analizando APU...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-6 pt-0">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[24px] border border-white/5">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Consulta técnica..." className="flex-1 bg-transparent px-2 text-xs font-bold text-white outline-none" />
                <Button onClick={() => handleSendMessage()} disabled={isLoading} className="w-10 h-10 rounded-full bg-primary text-black p-0 border-none"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsOpen(!isOpen)} className="h-16 px-6 bg-primary text-black rounded-full shadow-2xl flex items-center gap-3 border border-black/10">
        <div className="flex flex-col items-start mr-2 hidden md:flex">
            <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">Equipo Directo</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{activeAgent}</span>
        </div>
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
