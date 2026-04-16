import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

// [v3.5] Staff de Ingeniería Elite - Identidad Dinámica por Partida
interface Engineer {
  name: string;
  role: string;
  specialty: string[];
}

const STAFF: Engineer[] = [
  { name: 'Michael', role: 'Director de Ingeniería', specialty: ['Director', 'General'] },
  { name: 'Ricardo', role: 'Ingeniero Calculista', specialty: ['Obra Gruesa', 'Hormigón'] },
  { name: 'Danitza', role: 'Ingeniera de Terminaciones', specialty: ['Terminaciones', 'Acabados'] },
  { name: 'Cristopher', role: 'Ingeniero Estructural', specialty: ['Estructuras', 'Techumbres'] },
  { name: 'David', role: 'Consultor de Presupuestos', specialty: ['Terreno', 'Limpieza', 'General'] }
];

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
  
  // Selección dinámica del ingeniero según la categoría de la obra
  const activeEngineer = useMemo(() => {
    if (!metadata?.category) return STAFF[0]; // Director por defecto
    const engineer = STAFF.find(e => e.specialty.includes(metadata.category!));
    return engineer || STAFF[4]; // David para casos generales
  }, [metadata?.category]);

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);

  // Lógica de Consultoría Offline (Heurística Experta)
  const getOfflineReply = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    const { resistencia, secado } = metadata?.dosage || { resistencia: 'G-25', secado: 'Estándar' };

    if (msg.includes('sí') || msg.includes('recomienda') || msg.includes('consejo') || msg.includes('opin')) {
      return `¡Excelente! Para un ${resistencia} ${secado}, mi consejo es que cuides mucho el curado; al ser de alta resistencia inicial, genera calor rápido. ¿Ya tienes listo el vibrador de inmersión? Recuerda que el PDF de $2.990 tiene la dosificación exacta para que no pierdas material.`;
    }

    if (msg.includes('pdf') || msg.includes('descargar') || msg.includes('pagar') || msg.includes('cuánto') || msg.includes('valor')) {
      return `El PDF profesional cuesta solo $2.990. Te entrega el detalle de materiales, la cubicación exacta y la guía de mezclas. Es tu respaldo técnico para la obra. ¿Te mando el link de pago?`;
    }

    return `Entiendo perfectamente. Como tu socio en esta obra de ${metadata?.category || 'ingeniería'}, mi objetivo es que no pierdas presupuesto por errores de cubicación. ¿Quieres que revisemos la dosificación de ${resistencia} o prefieres descargar el reporte completo ahora?`;
  };

  // Inicializar chat con identidad pro
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([
          { 
              role: 'bot', 
              content: `Hola, soy ${activeEngineer.name}, ${activeEngineer.role} de Obra Go. Estoy analizando tu proyecto de ${metadata?.category || 'ingeniería'}. ¿En qué puedo ayudarte con tu cálculo técnico hoy?` 
          }
        ]);
    }
  }, [activeEngineer, metadata?.category, messages.length]);

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
      const personalizedMessage = message.replace('¡Hola!', `Hola, soy ${activeEngineer.name}.`);
      setMessages(prev => [...prev, { role: 'bot', content: personalizedMessage }]);
    };

    window.addEventListener('obra-go-bot-trigger', handleTrigger);
    return () => window.removeEventListener('obra-go-bot-trigger', handleTrigger);
  }, [activeEngineer]);

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
            assignedEngineer: activeEngineer.name,
            engineerRole: activeEngineer.role
          }
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch {
      // MODO OFFLINE: Heurística Directa si la API falla
      setMessages(prev => [...prev, { role: 'bot', content: getOfflineReply(userMessage) }]);
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
                  <h4 className="text-black font-black uppercase text-[10px] tracking-tighter">{activeEngineer.name} ({activeEngineer.role.split(' ')[0]})</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-black/60 uppercase tracking-widest">AEC Certificado</span>
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
                        <button onClick={() => { document.getElementById('main-pay-button')?.click(); }} className="block mt-3 bg-black text-primary p-2 rounded-lg font-black uppercase text-[9px] text-center w-full">Ir a Webpay Seguro →</button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Analizando rendimientos...</span>
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
            <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">Staff Elite</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{activeEngineer.name}</span>
        </div>
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
