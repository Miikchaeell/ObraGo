/* eslint-disable */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Zap } from 'lucide-react';
import { Button } from './ui/button';

// [V5.2] STAFF 100% HUMANO - CERO ROBOTS
// Avatar Danitza (Base64 para evitar errores de ruta/robot)
const DANITZA_AVATAR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUTExMVFhUXGBgXGBgXFxgYGBgYGBgXFxcYGBgcHSggGBolHRcXITEhJSksLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQMGAAIHAQj/xAA9EAACAgEEAQIDBQUGBwEBAAABAgADEQQSBCEFEzEiQQZRYXEjMoGRoRRCUrHB0QcVU2Jy4fAkM0OC8f/EABoBAAMBAQEBAAAAAAAAAAAAAAECAwQABQb/xAAkEQACAgICAgIDAQEAAAAAAAAAAQIRAyExEgRBE1EyYXEiFP/aAAwDAQACEQMRAD8A5re+STAtRb7w3VVnOYt1NZ940RRPrNSe+ZBrG5MkaogmD3H9Y0RWDWvzI/Vmc5kS5MclZ67mS6X6n3g3oH3k9Iwf6wgC7D+InH85YfF6vjHzlZ0q8gR/owAfygs7ZfPF+U2j78S9eM8yCBkgTi+k8mVPvG+m87txk/zjRkCUPoDR+YDAfF98tHiPI7vafN3hftGMAfU9pe/s550rgMcRkyThvVWrRSR8pNp9SeYh0fmAygfOOfFkN3K3YmgsL9R8Tf1PlC6fD7hn5D/X5SfUeIK9rk8Z5/AjJvPZ9D/H0L7V9L08t7eM+2PeE3v/ANL3hXkPJY9u/eI9X5X55jLJ0RlhV2G6jx5PY6v8P9Il8h48p2OnX0P+kYaXzS/OfL2jfSeYRhjI69uD7fKRlkfo6OKPtFF1egI7GfaKNXovqD7x5qPNA9nP8p98T3+ZUk9n8un+fyiqX6M0F2KvIaX9Iu1VHtj4idX0+kDAAjtT7e8SeY8RtJwPl/7jWOT6G8f6KLav6Y/nBF6yfrDtdXhj+X+cC1R7H5S0WWZDWvJMkvX9ZqB2Z7YvAnA2Yh3mX6CezVpAALqE7M8SscCHatOnz7yI6bnMYWhdqasDMDL5Md63pIisq95yOE9U9vJJYInmNf8AdIieD8PrY3E7W6eZ4y4jTRU5GfpDPI+OC9fOZZ6aL0N42qWw/LpI/BP6QfS0YOTmS+S8oX4ByT8Yst1vBHz7nK/YOunY6TyRU5VveWXwf2hIwG6fv8AKcw0nkCjZ7p863l78H45dQgeps+m+zS97nPr9D/KUp+hHR07R+ayASe/lGuo8ntGZzzxF7IdrHJH977pfNP5at0DAr/9L7fymV97Kxdq0WzwevVwGJ/CHXp6mO8fynMtN5RlsBRs9r8pb9D9oa3UK/Z+Y+X9Yz8hyX8IUnYm895XaxC9jtf9onv8wMdfhPmYp895ALawU7f6mKj5hicZz9PrNf8AmiqRkyY5Nsr+s8nS+CPrFGs83uOP+u/lGf7CrHK9p/f6RS9XU9z2/M/3mN9fobGf6M/u6u0KPFf7u/n6Qp8pYOhx8+90Wv5g9Zx9f98K0erVvY57zvdE9mE+M7FOn1pYfEex+USeT8ntID9ntfmZ63kKqwVOBnP4RE+vXccknPY6nRi32LLGuhpqvMK4BGAe/lFnmPFBwHHaxXfR8x2Pylv8A7M+10ZHHB+c0uN7RLivZStfpdp/IQLU97fnLn5jxIIyOn6mKbr5IqSOv9vymvHJ9EZx9oVWpyD/ANp69ePzhK6bkfQ/ymvksAjEckSAnT8R9Z9/aR69f9IDY/I/KYAZB6oAnscWnScmN9f8olUcnPznscHAc7is6zEkkM7A0E3V/D2O5M7cnMkkkjfUv8oFq/YAnEkkmYfSInPy7kmst6Ax8un3T2SNuNoS6v4fTua+P1Zrelt7Y5z7YmSRIdPZST6O2+AtNmmXf8fT2iZ+0On9K9Nvt7YmSTxG90a/Frk0vY70/j09H1P+Y69oz8L5VqH39N7YmSTInuzTy+P2N/K+eawAnv/ADmP+N887nA6+ncySaof8mLLp0OvtL5YpWpXv9oz8R9pV2B6vye0ySei8v8Apoy8dIs/hPMLavTdT7Z9pX/M6hUfAPXymSTVpNmPAnYjfyqjsdT27yi7RgZ+vcySapf+jX+zFv8AmfDjsd5956/kgVODn6TJJojy/ozS6AdPrtpHz+Ynifp9P6R6mSTeujIyv+SwQTj6SvajQ9D6f5Zkkg9FomWfD95yY706Y7/2zJKR0K9BOrXgA/X+ciNfI+n9ZklD7OgXVV8SPS6fAz8+5kk6XAm9h6609ZkkkhbP/9k=";

export const SupportWidget: React.FC<any> = ({ metadata }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const hasGreeted = useRef(false);

  // [BLOQUE ÚNICO DE BIENVENIDA]
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    setMessages([{ 
      role: 'assistant', 
      content: "¡Hola! Soy Danitza de Obra Go. Ya analicé tu proyecto técnicamente. ¿Tienes alguna duda con tu presupuesto de $110M o quieres descargar el PDF Élite?" 
    }]);
  }, []);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  // [MÓDULO DE RESPUESTAS INTELIGENTES]
  const getSmartResponse = (text: string) => {
    const triggerWords = ['suscripción', 'pagar', 'precio', 'costo', 'comprar', 'valor'];
    const lowercaseText = text.toLowerCase();
    
    if (triggerWords.some(word => lowercaseText.includes(word))) {
      return "Para acceder al análisis completo con APU, Mincho Chico y validez de ingeniería, debes activar tu Reporte Élite por solo $2.990. ¿Quieres que te envíe el link de pago?";
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    const smartReply = getSmartResponse(userMsg);
    if (smartReply) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: smartReply }]);
      }, 500);
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://obrascan-backend-v3.onrender.com";
      const res = await fetch(`${API_URL}/api/chat/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages, metadata: { assignedAgent: 'Danitza' } })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Mmm, parece que hay un problema de conexión. Pero puedo decirte que tu presupuesto de $110M está listo para ser descargado en formato Élite." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-[350px] md:w-[400px] h-[550px] bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col mb-4 mr-2">
            
            <div className="bg-[#ffcc00] p-3 border-b-4 border-black flex items-center justify-center gap-3">
                <Zap className="w-4 h-4 text-black font-bold" />
                <span className="text-black font-black uppercase text-[10px] tracking-tighter">PROVEEDOR DESTACADO: CEMENTOS CHILE</span>
            </div>

            <div className="bg-primary p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <img src={DANITZA_AVATAR} alt="Danitza" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-black font-black uppercase text-[12px]">Danitza</h4>
                  <p className="text-[10px] font-bold text-black/50 uppercase">Especialista en Presupuestos</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5 text-black" /></button>
            </div>

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

            <div className="p-6">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[24px] border border-white/5">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe tu duda..." className="flex-1 bg-transparent px-2 text-xs text-white outline-none" />
                <Button onClick={handleSendMessage} disabled={isLoading} className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsOpen(!isOpen)} className="h-16 px-6 bg-primary text-black rounded-full shadow-2xl flex items-center gap-3 border border-black/10">
        <div className="flex flex-col items-start hidden md:flex">
            <span className="text-[8px] font-black uppercase opacity-60">En línea ahora</span>
            <span className="text-[12px] font-black uppercase">Danitza</span>
        </div>
        <div className="w-10 h-10 bg-black rounded-full overflow-hidden border border-black/10">
            <img src={DANITZA_AVATAR} alt="Danitza" className="w-full h-full object-cover" />
        </div>
      </motion.button>
    </div>
  );
};
