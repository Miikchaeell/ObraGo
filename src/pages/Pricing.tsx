import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Shield, Loader2 } from "lucide-react";
import { AdSenseSlot } from "@/components/AdSenseSlot";

const plans = [
  {
    name: "Contratista Élite",
    planType: "basic",
    price: "$9.990",
    period: "/auditoría",
    features: ["1 Reporte Élite Full", "Cubicación NCh 170", "Validación IA Nexus", "Descarga PDF Inmediata"],
    buttonText: "Comprar Ahora",
    priceId: "plan_9990",
    highlight: false
  },
  {
    name: "Constructora PRO",
    planType: "pro",
    price: "$24.990",
    period: "/mes",
    features: ["5 Reportes Élite/mes", "Auditoría de Ingeniería Pro", "Soporte Senior Directo", "Acceso a BI HUB CEO"],
    buttonText: "Elegir PRO",
    priceId: "plan_24990",
    highlight: true
  },
  {
    name: "Corporativo Industrial",
    planType: "enterprise",
    price: "$59.990",
    period: "/mes",
    features: ["Auditorías Ilimitadas", "Multi-usuario Empresa", "API Integration", "Logo Personalizado en PDF"],
    buttonText: "Activar Corp",
    priceId: "plan_59990",
    highlight: false
  }
];

export default function Pricing() {
  const { user, plan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planType: string, priceId: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    
    if (planType === "enterprise") {
      window.location.href = "mailto:ventas@obrago.cl";
      return;
    }

    setLoadingPlan(planType);
    try {
      const rawToken = localStorage.getItem("token");
      const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null;
      
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/api/stripe/create-checkout`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ planType, priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error creating checkout:", err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 font-display">
      <div className="max-w-6xl mx-auto space-y-12 py-12">
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight text-foreground"
          >
            Escala tu Productividad
          </motion.h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades en terreno.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p, idx) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col p-8 bg-card border rounded-3xl transition-all hover:shadow-2xl hover:scale-105 ${
                p.highlight ? "border-primary ring-2 ring-primary/20 scale-105 z-10" : "border-border"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-black px-4 py-1 rounded-full uppercase tracking-widest">
                  Más Popular
                </span>
              )}

              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-bold">{p.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{p.price}</span>
                  {p.period && <span className="text-muted-foreground">{p.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-balance">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(p.planType, p.priceId)}
                disabled={loadingPlan === p.planType || plan === p.planType || (plan !== 'free' && p.planType === 'free')}
                className={`w-full h-12 rounded-xl text-lg font-bold transition-all ${
                  p.highlight 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                {loadingPlan === p.planType ? (
                  <Loader2 className="animate-spin" />
                ) : plan === p.planType ? (
                  "Plan Actual"
                ) : (
                  p.buttonText
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="bg-card/50 border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-primary" />
              Garantía de Satisfacción
            </h4>
            <p className="text-muted-foreground">
              Cancela en cualquier momento. Sin contratos ocultos ni complicaciones.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="h-12 px-8 rounded-xl font-bold">
            Volver a la App
          </Button>
        </div>

        {/* [v7.0] Monetization Slot */}
        <div className="py-10">
            <AdSenseSlot id="pricing-banner-ads" className="w-full" />
        </div>
      </div>
    </div>
  );
}
