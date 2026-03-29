import React, { useState } from "react";
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
import ProfilePage from "@/pages/ProfilePage";

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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

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
