// [v22.2.1] OBRA GO PRO - DARK INDUSTRIAL LUXURY - DEPLOY: 2026-04-30 12:15 PM - CACHE PURGE REQ
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
import MissionControl from "@/pages/MissionControl";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children, allowGuest = false }: { children: React.ReactNode, allowGuest?: boolean }) => {
  const { user } = useAuth();

  if (!user && !allowGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="min-h-screen bg-[#0f1115] selection:bg-primary selection:text-black">
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
          <Route path="/mission-control" element={<ProtectedRoute><MissionControl /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
