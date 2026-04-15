import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Scanner from "@/pages/Scanner";
import History from "@/pages/History";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Pricing from "@/pages/Pricing";
import Admin from "@/pages/Admin";

import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import Landing from "@/pages/Landing";
import { SupportWidget } from "@/components/SupportWidget";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children, allowGuest = false }: { children: React.ReactNode, allowGuest?: boolean }) => {
  const { user } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
  //       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  //       <p className="text-primary text-xs font-black uppercase tracking-widest animate-pulse">Iniciando Obra Go...</p>
  //     </div>
  //   );
  // }

  // Si allowGuest es true, dejamos pasar aunque no haya user
  if (!user && !allowGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


function App() {
  return (
    <>
      <h1 className="absolute top-0 left-0 z-[9999] bg-red-600 text-white p-2">OBRA GO VIVA</h1>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectView /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute allowGuest={true}><Scanner /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SupportWidget />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
