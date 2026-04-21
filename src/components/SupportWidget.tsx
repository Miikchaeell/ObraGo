// @ts-nocheck
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SISTEMA DINÁMICO DE VIDEO-AGENTES - OBRA GO V9.5
 * REINGENIERÍA DE PRODUCCIÓN: Michael, Cristopher, Danitza, Ricardo, David
 */

const AGENTS = [
  { name: "Michael Seura", role: "Fundador e Ingeniero Senior", video: "/videos/Michael.mp4" },
  { name: "Cristopher", role: "Director de Operaciones", video: "/videos/Cristopher.mp4" },
  { name: "Danitza", role: "Jefe de Ingeniería AEC", video: "/videos/Danitza.mp4" },
  { name: "Ricardo", role: "Especialista en Normativa NCh", video: "/videos/Cristopher.mp4" }, // Fallback a Cristopher
  { name: "David", role: "Soporte Técnico Senior", video: "/videos/David.mp4" }
];

export const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [lastTotal, setLastTotal] = useState(localStorage.getItem('lastScanTotal') || '0');
  
  // Rotación aleatoria del agente al montar el componente
  const agent = useMemo(() => AGENTS[Math.floor(Math.random() * AGENTS.length)], []);

  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: `¡Hola! Soy ${agent.name} de Obra Go. He validado tu presupuesto de $${Number(lastTotal).toLocaleString('es-CL')} bajo normas NCh 170/430. ¿Prefieres revisar el desglose técnico o descargar el Reporte Élite con el APU ahora mismo?`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Escuchar actualizaciones del presupuesto desde el Scanner
  useEffect(() => {
    const handleStorageChange = () => {
      const newTotal = localStorage.getItem('lastScanTotal');
      if (newTotal && newTotal !== lastTotal) {
        setLastTotal(newTotal);
        // Actualizar el primer mensaje si cambia el presupuesto
        setHistory(prev => [
            {
                role: 'assistant',
                content: `¡Hola! Soy ${agent.name} de Obra Go. He validado tu presupuesto de $${Number(newTotal).toLocaleString('es-CL')} bajo normas NCh 170/430. ¿Te ayudo con el desglose o prefieres el Reporte Élite?`
            },
            ...prev.slice(1)
        ]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [lastTotal, agent]);

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
          metadata: { 
              assignedEngineer: agent.name,
              engineerRole: agent.role,
              totalCost: lastTotal
          }
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
            className="mb-4 w-[400px] h-[650px] bg-[#1a1c22]/90 border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
          >
            {/* Header Persona con Video */}
            <div className="p-0 bg-black/20 border-b border-white/5 relative h-48 overflow-hidden">
              <video 
                src={agent.video} 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c22] via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl border-2 border-[#D4AF37] overflow-hidden shadow-2xl bg-black">
                   {/* Mini avatar static fallback inside video area */}
                   <div className="w-full h-full flex items-center justify-center text-[#D4AF37] font-black text-xs">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                   </div>
                </div>
                <div>
                  <h3 className="text-white font-black text-base tracking-tight leading-none">{agent.name}</h3>
                  <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {agent.role}
                  </p>
                </div>
              </div>

              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-all backdrop-blur-md border border-white/10">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Chat History */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                    ? 'bg-[#D4AF37] text-black font-bold rounded-tr-none' 
                    : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none backdrop-blur-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-[#D4AF37] font-black uppercase animate-pulse">Michael está escribiendo...</div>}
            </div>

            {/* Input Area Glassmorphism */}
            <div className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-md">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Escribe tu consulta AEC..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-600"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="w-14 h-14 bg-[#D4AF37] text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 rounded-[28px] bg-[#D4AF37] text-black shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden border-4 border-black/20"
      >
        {isOpen ? <X className="w-10 h-10" /> : (
            <div className="w-full h-full relative">
                <video src={agent.video} autoPlay muted loop playsInline className="w-full h-full object-cover scale-150" />
                <div className="absolute inset-0 bg-[#D4AF37]/10" />
            </div>
        )}
      </motion.button>
    </div>
  );
};

export default SupportWidget;

