import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, X } from 'lucide-react';

interface VoiceAssistantProps {
  context?: any;
}

export default function VoiceAssistant({ context }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-CL';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleAskAssistant(text);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setAnswer('');
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleAskAssistant = async (question: string) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "";
      
      const response = await fetch(`${API_URL}/api/voice-assistant`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ question, context })
      });

      const result = await response.json();
      if (result.success) {
        setAnswer(result.answer);
        speak(result.answer);
      }
    } catch (error) {
      console.error("Assistant fail:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CL';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#D4AF37] text-black rounded-full shadow-2xl flex items-center justify-center animate-bounce hover:scale-110 transition-all z-50"
      >
        <Mic className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)]">
        <button onClick={() => {
            setIsOpen(false);
            window.speechSynthesis.cancel();
        }} className="absolute top-6 right-6 text-slate-500 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic tracking-tighter text-[#D4AF37]">COPILOTO NORMATIVO</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ingeniería Senior AEC V13.0</p>
          </div>

          <div 
            onClick={toggleListening}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${isListening ? 'bg-red-500/20 scale-110' : 'bg-white/5 border border-white/10'}`}
          >
            {isListening && (
               <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20"></div>
            )}
            {isProcessing ? (
              <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
            ) : isListening ? (
              <MicOff className="w-12 h-12 text-red-500" />
            ) : (
              <Mic className="w-12 h-12 text-[#D4AF37]" />
            )}
          </div>

          <div className="space-y-4 w-full min-h-[100px]">
            {transcript && (
              <div className="p-4 bg-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tu Pregunta</p>
                <p className="text-sm text-white font-medium italic">"{transcript}"</p>
              </div>
            )}

            {answer && (
              <div className="p-6 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest">Respuesta del Ingeniero</p>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-bold">{answer}</p>
              </div>
            )}

            {!transcript && !answer && (
              <p className="text-slate-400 font-bold text-sm">Toca el micrófono y pregunta sobre normas NCh o técnicas de construcción...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
