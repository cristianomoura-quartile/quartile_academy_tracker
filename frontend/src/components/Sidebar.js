import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  House, Books, Chalkboard, Users, CalendarBlank, SignOut,
  CaretLeft, CaretRight, GearSix, UserCircle
} from "@phosphor-icons/react";

export default function Sidebar({ open, onToggle }) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: House },
    { path: "/modules", label: "Modules", icon: Books },
    { path: "/instructors", label: "Instructors", icon: Chalkboard },
    { path: "/students", label: "Students", icon: Users },
    { path: "/calendar", label: "Calendar", icon: CalendarBlank },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", icon: GearSix }] : []),
  ];

  const roleColor = user?.role === "admin" ? "#FF6E13" : user?.role === "instructor" ? "#2E7D32" : "#1565C0";

  return (
    <aside
      data-testid="sidebar"
      className={`fixed top-0 left-0 h-screen bg-[#F5F2EB] border-r border-[#EBE5DB] flex flex-col transition-all duration-300 z-40
        ${open ? "w-[240px]" : "w-[72px]"}`}
    >
      <div className="p-6 pb-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FF6E13] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Cabinet Grotesk' }}>Q</span>
        </div>
        {open && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-[#2D241E] leading-none" style={{ fontFamily: 'Cabinet Grotesk' }}>Quartile</h1>
            <p className="text-[10px] text-[#7A6F69] leading-none mt-0.5">Academic Tracker</p>
          </div>
        )}
      </div>

      {/* User badge */}
      {open && user && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2.5 bg-white/60 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: roleColor }}>
              {user.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#2D241E] truncate">{user.name}</p>
              <p className="text-[10px] capitalize font-medium" style={{ color: roleColor }}>{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              data-testid={`nav-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? "bg-white text-[#FF6E13] shadow-sm border-l-2 border-[#FF6E13]"
                  : "text-[#7A6F69] hover:bg-white/60 hover:text-[#2D241E]"
                }`}
            >
              <Icon size={20} weight={isActive ? "duotone" : "regular"} className="shrink-0" />
              {open && <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={onToggle}
          data-testid="sidebar-toggle"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6F69] hover:bg-white/60 hover:text-[#2D241E] transition-all w-full"
        >
          {open ? <CaretLeft size={20} /> : <CaretRight size={20} />}
          {open && <span className="text-sm font-medium">Collapse</span>}
        </button>
        <button
          onClick={logout}
          data-testid="sign-out-btn"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6F69] hover:bg-white/60 hover:text-[#C62828] transition-all w-full"
        >
          <SignOut size={20} />
          {open && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
