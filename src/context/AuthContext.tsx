import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  plan: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  login: (phone: string, password: string) => Promise<{ mfaRequired?: boolean; tempToken?: string }>;
  verifyMfa: (tempToken: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<string | null>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // 1. Prioridad: Token del Backend Local (Persistencia Pro)
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            setUser(JSON.parse(savedUser));
            setPlan('pro'); // Usuarios de backend local son Pro por defecto
            setIsLoading(false);
            return;
        }

        // 2. Fallback: Supabase
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Supabase Auth Error:", error.message);
        }
        
        const session = data?.session;
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || ''
          });
          
          try {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('plan_type')
              .eq('user_id', session.user.id)
              .single();
            
            setPlan(sub?.plan_type || 'free');
          } catch (dbError) {
            console.warn("Could not fetch plan:", dbError);
            setPlan('free');
          }
        }
      } catch (err) {
        console.warn("Could not connect to Supabase. Loading guest mode.", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
        
        supabase.from('subscriptions')
          .select('plan_type')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => setPlan(data?.plan_type || 'free'));

      } else if (!localStorage.getItem("token")) {
        setUser(null);
        setPlan(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const login = async (phone: string, password: string) => {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Error de autenticación");
      }

      const data = await response.json();
      
      if (data.mfaRequired) {
          return { mfaRequired: true, tempToken: data.tempToken };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setPlan('pro');
      return { mfaRequired: false };
  };

  const verifyMfa = async (tempToken: string, code: string) => {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${API_URL}/api/auth/verify-mfa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempToken, code })
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Código MFA inválido");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setPlan('pro');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPlan(null);
  };

  return (
    <AuthContext.Provider value={{ user, plan, isLoading, logout, signInWithGoogle, login, verifyMfa }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


