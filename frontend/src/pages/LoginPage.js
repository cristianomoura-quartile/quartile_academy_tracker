import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";

const LOGIN_IMAGE = "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left: Login Form (4/5) */}
      <div className="flex-1 flex items-center justify-center bg-[#FDFBF7] px-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#FF6E13] flex items-center justify-center">
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Cabinet Grotesk' }}>Q</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#2D241E] leading-none" style={{ fontFamily: 'Cabinet Grotesk' }}>Quartile</h1>
              <p className="text-[11px] text-[#7A6F69] leading-none mt-0.5">Academic Tracker</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Welcome back</h2>
            <p className="text-[#7A6F69] mt-2">Sign in to access the academy dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">Email</label>
              <input
                data-testid="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@quartile.com"
                className="w-full px-4 py-3 bg-white border border-[#EBE5DB] rounded-xl text-sm text-[#2D241E] placeholder-[#B5AEA6] outline-none focus:border-[#FF6E13] focus:ring-1 focus:ring-[#FF6E13]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  data-testid="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white border border-[#EBE5DB] rounded-xl text-sm text-[#2D241E] placeholder-[#B5AEA6] outline-none focus:border-[#FF6E13] focus:ring-1 focus:ring-[#FF6E13]/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7A6F69] hover:text-[#2D241E] transition-colors"
                >
                  {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium" data-testid="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF6E13] text-white text-sm font-semibold rounded-xl hover:bg-[#E65C0A] transition-all disabled:opacity-50 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-[#EBE5DB]">
            <p className="text-[10px] font-semibold text-[#7A6F69] uppercase tracking-wider mb-3">Quick Access</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Admin", email: "admin@quartile.com", pw: "admin123", color: "#FF6E13" },
                { label: "Instructor", email: "instructor@quartile.com", pw: "instructor123", color: "#2E7D32" },
                { label: "Student", email: "student@quartile.com", pw: "student123", color: "#1565C0" },
              ].map(d => (
                <button
                  key={d.label}
                  data-testid={`quick-login-${d.label.toLowerCase()}`}
                  onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                  className="px-3 py-2 bg-white border border-[#EBE5DB] rounded-lg text-xs font-semibold text-[#2D241E] hover:border-[#FF6E13]/40 transition-all text-center"
                >
                  <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: d.color }} />
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Image (1/5) */}
      <div className="hidden lg:block w-[20%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6E13] via-[#FF9900] to-[#B34700]" />
        <img
          src={LOGIN_IMAGE}
          alt="Quartile Academy"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6">
          <p className="text-white/80 text-[10px] font-semibold uppercase tracking-widest mb-2">Quartile Academy</p>
          <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: 'Cabinet Grotesk' }}>
            Building the next generation of performance marketers
          </p>
        </div>
      </div>
    </div>
  );
}
