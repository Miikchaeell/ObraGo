/* eslint-disable */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Zap } from 'lucide-react';
import { Button } from './ui/button';

// [V5.1] Staff 100% Humano - Obra Go (CERO ROBOTS)
interface AgentConfig {
  name: string;
  role: string;
  avatar: string;
}

const AGENT_DATA: Record<string, AgentConfig> = {
  Danitza: { 
    name: 'Danitza', 
    role: 'Especialista en Presupuestos', 
    avatar: '/avatars/danitza.jpg' 
  }
};

export const SupportWidget: React.FC<any> = ({ metadata }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasGreeted = useRef(false);
  
  // Danitza es la única agente autorizada
  const agent = AGENT_DATA['Danitza'];
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  useEffect(() => {
    if (!hasGreeted.current && messages.length === 0) {
        hasGreeted.current = true;
        setMessages([
          { 
              role: 'assistant', 
              content: `¡Hola! Soy Danitza de Obra Go. Ya analicé tu proyecto técnicamente. ¿Tienes alguna duda con tu presupuesto de $110M o quieres descargar el PDF Élite?` 
          }
        ]);
    }
  }, []);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://obrascan-backend-v3.onrender.com";
      const res = await fetch(`${API_URL}/api/chat/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages, metadata: { ...metadata, assignedAgent: agent.name } })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Excelente consulta. Como experta en Obra Go, te recomiendo descargar el PDF Élite para ver los detalles técnicos de tu proyecto." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-[350px] md:w-[400px] h-[550px] bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col mb-4 mr-2">
            
            {/* [BANNER PUBLICITARIO FORZADO V5.1] */}
            <div className="bg-[#ffcc00] p-3 border-b-4 border-black flex items-center justify-center gap-3 animate-pulse">
                <Zap className="w-4 h-4 text-black font-bold" />
                <span className="text-black font-black uppercase text-[10px] tracking-tighter">PROVEEDOR DESTACADO: CEMENTOS CHILE</span>
            </div>

            {/* Header */}
            <div className="bg-primary p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <img 
                    src={agent.avatar} 
                    alt={agent.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        // Fallback profesional si la imagen no carga, NUNCA UN ROBOT
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200';
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-black font-black uppercase text-[12px]">{agent.name}</h4>
                  <p className="text-[10px] font-bold text-black/50 uppercase">{agent.role}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5 text-black" /></button>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-2xl text-xs ${m.role === 'assistant' ? 'bg-white/5 text-white border border-white/5' : 'bg-primary text-black font-bold'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex justify-start"><Loader2 className="w-4 h-4 text-primary animate-spin" /></div>}
            </div>

            {/* Footer */}
            <div className="p-6">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[24px] border border-white/5">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Consulta a Danitza..." className="flex-1 bg-transparent px-2 text-xs text-white outline-none" />
                <Button onClick={handleSendMessage} disabled={isLoading} className="w-10 h-10 rounded-full bg-primary text-black"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsOpen(!isOpen)} className="h-16 px-6 bg-primary text-black rounded-full shadow-2xl flex items-center gap-3 border border-black/10">
        <div className="flex flex-col items-start hidden md:flex">
            <span className="text-[8px] font-black uppercase opacity-60">En línea ahora</span>
            <span className="text-[12px] font-black uppercase">{agent.name}</span>
        </div>
        <div className="w-10 h-10 bg-black rounded-full overflow-hidden border border-black/10">
            <img 
                src={agent.avatar} 
                alt={agent.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200';
                }}
            />
        </div>
      </motion.button>
    </div>
  );
};
