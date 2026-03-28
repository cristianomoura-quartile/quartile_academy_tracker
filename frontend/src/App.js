import React, { useState } from "react";
<<<<<<< Updated upstream
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Modules from "@/pages/Modules";
import ModuleDetail from "@/pages/ModuleDetail";
import Instructors from "@/pages/Instructors";
import Students from "@/pages/Students";
import Calendar from "@/pages/Calendar";
import Admin from "@/pages/Admin";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 240 : 72 }}
      >
        <div className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/modules/:id" element={<ModuleDetail />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/students" element={<Students />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
=======
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import Modules from "@/pages/Modules";
import Instructors from "@/pages/Instructors";
import Students from "@/pages/Students";
import Calendar from "@/pages/Calendar";
import AdminPage from "@/pages/AdminPage";

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[240px]' : 'ml-[72px]'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/students" element={<Students />} />
          <Route path="/calendar" element={<Calendar />} />
          {isAdmin && <Route path="/admin" element={<AdminPage />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
>>>>>>> Stashed changes
      </main>
    </div>
  );
}

<<<<<<< Updated upstream
function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
=======
function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
>>>>>>> Stashed changes
