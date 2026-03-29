import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Lock, Buildings, Briefcase, CheckSquare, FloppyDisk, Eye, EyeSlash
} from "@phosphor-icons/react";

const TEAMS = [
  "COE", "Mid-Market", "DTC", "SMB", "Customer Growth",
  "Marketing", "Product", "Tech", "HR", "Finance", "Operations"
];

const CHANNELS = [
  "AMZ", "Google", "Google Ads", "Walmart", "Meta", "TikTok",
  "Bing", "Portal", "DTC", "Soft Skills", "Tech", "Sciene", "Excel", "Multichannel"
];

const ROLE_COLORS = {
  admin: "#FF6E13",
  instructor: "#2E7D32",
  student: "#1565C0",
};

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-[#EBE5DB] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} weight="duotone" className="text-[#FF6E13]" />
        <h3 className="text-sm font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const colors = { success: "bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20", error: "bg-red-50 text-red-700 border-red-200" };
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm font-semibold shadow-lg z-50 animate-fade-in ${colors[type]}`}>
      {msg}
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // Profile fields
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("");
  const [selectedChannels, setSelectedChannels] = useState([]);

  // Password fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  useEffect(() => {
    api.getProfile().then(p => {
      setProfile(p);
      setName(p.name || "");
      setTitle(p.title || "");
      setTeam(p.team || "");
      setSelectedChannels(p.channels || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        name, title, team, channels: selectedChannels
      });
      setProfile(updated);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showToast("Please fill in all password fields", "error"); return;
    }
    if (newPw !== confirmPw) {
      showToast("New passwords don't match", "error"); return;
    }
    if (newPw.length < 6) {
      showToast("New password must be at least 6 characters", "error"); return;
    }
    setChangingPw(true);
    try {
      await api.changePassword(currentPw, newPw);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to change password", "error");
    } finally {
      setChangingPw(false);
    }
  };

  const toggleChannel = (ch) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-[900px] animate-fade-in" data-testid="profile-page">
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6E13] mb-1">Account</p>
        <h1 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>My Profile</h1>
        <p className="text-[#7A6F69] mt-1">Manage your personal info, role channels, and password.</p>
      </div>

      {/* Avatar + role badge */}
      <div className="bg-white border border-[#EBE5DB] rounded-xl p-6 mb-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
          style={{ backgroundColor: ROLE_COLORS[profile?.role] || "#FF6E13", fontFamily: 'Cabinet Grotesk' }}>
          {(name || profile?.name || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>{name || profile?.name}</p>
          <p className="text-sm text-[#7A6F69]">{profile?.email}</p>
          <span className="mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold capitalize"
            style={{ backgroundColor: `${ROLE_COLORS[profile?.role]}20`, color: ROLE_COLORS[profile?.role] }}>
            {profile?.role}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Personal Info */}
        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F2EB] border border-[#EBE5DB] rounded-xl text-sm text-[#2D241E] outline-none focus:border-[#FF6E13] focus:ring-1 focus:ring-[#FF6E13]/20 transition-all"
                placeholder="Your full name"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">Job Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F2EB] border border-[#EBE5DB] rounded-xl text-sm text-[#2D241E] outline-none focus:border-[#FF6E13] focus:ring-1 focus:ring-[#FF6E13]/20 transition-all"
                placeholder="e.g. COE Specialist"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">Email</label>
            <input
              value={profile?.email || ""}
              disabled
              className="w-full px-4 py-2.5 bg-[#F5F2EB] border border-[#EBE5DB] rounded-xl text-sm text-[#B5AEA6] outline-none cursor-not-allowed"
            />
            <p className="text-[10px] text-[#7A6F69] mt-1">Email cannot be changed. Contact admin if needed.</p>
          </div>
        </Section>

        {/* Team */}
        <Section title="Team" icon={Buildings}>
          <div className="flex flex-wrap gap-2">
            {TEAMS.map(t => (
              <button
                key={t}
                onClick={() => setTeam(t === team ? "" : t)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border
                  ${team === t
                    ? "bg-[#FF6E13] text-white border-[#FF6E13]"
                    : "bg-white text-[#7A6F69] border-[#EBE5DB] hover:border-[#FF6E13]/40 hover:text-[#2D241E]"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        {/* Channel Expertise */}
        <Section title="Channel Expertise" icon={Briefcase}>
          <p className="text-xs text-[#7A6F69] mb-3">Select the channels you specialize in.</p>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(ch => {
              const selected = selectedChannels.includes(ch);
              return (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                    ${selected
                      ? "bg-[#FF6E13] text-white border-[#FF6E13]"
                      : "bg-white text-[#7A6F69] border-[#EBE5DB] hover:border-[#FF6E13]/40 hover:text-[#2D241E]"}`}
                >
                  {selected && <CheckSquare size={12} weight="bold" />}
                  {ch}
                </button>
              );
            })}
          </div>
          {selectedChannels.length > 0 && (
            <p className="text-xs text-[#7A6F69] mt-2">{selectedChannels.length} channel{selectedChannels.length !== 1 ? "s" : ""} selected</p>
          )}
        </Section>

        {/* Save profile button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6E13] text-white text-sm font-semibold rounded-full hover:bg-[#E65C0A] transition-all disabled:opacity-50"
          >
            <FloppyDisk size={16} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* Change Password */}
        <Section title="Change Password" icon={Lock}>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 bg-[#F5F2EB] border border-[#EBE5DB] rounded-xl text-sm text-[#2D241E] outline-none focus:border-[#FF6E13] focus:ring-1 focus:ring-[#FF6E13]/20 transition-all"
                  placeholder="Current password"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6F69] hover:text-[#2D241E]">
                  {showPw ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F2EB] border border-[#EBE5DB] rounded-xl text-sm text-[#2D241E] outline-none focus:border-[#FF6E13] focus:ring-1 focus:ring-[#FF6E13]/20 transition-all"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A6F69] uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F2EB] border border-[#EBE5DB] rounded-xl text-sm text-[#2D241E] outline-none focus:border-[#FF6E13] focus:ring-1 focus:ring-[#FF6E13]/20 transition-all"
                placeholder="Repeat new password"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changingPw}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2D241E] text-white text-sm font-semibold rounded-full hover:bg-[#3d322b] transition-all disabled:opacity-50"
            >
              <Lock size={14} />
              {changingPw ? "Changing..." : "Change Password"}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
