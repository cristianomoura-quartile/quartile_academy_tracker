import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Books, Users, Chalkboard, Key, Plus, Pencil, Trash, ArrowCounterClockwise,
  X, Check, Warning
} from "@phosphor-icons/react";

const SECTION_TABS = [
  { id: "modules", label: "Modules", icon: Books },
  { id: "students", label: "Students", icon: Users },
  { id: "instructors", label: "Instructors", icon: Chalkboard },
  { id: "users", label: "Users & Passwords", icon: Key },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("modules");

  return (
    <div className="p-8 max-w-[1400px]" data-testid="admin-page">
      <div className="mb-6 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6E13] mb-1">Administration</p>
        <h1 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Admin Panel</h1>
        <p className="text-[#7A6F69] mt-1">Manage modules, students, instructors, and user accounts.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-3 mb-6">
        {SECTION_TABS.map(s => (
          <button
            key={s.id}
            data-testid={`admin-tab-${s.id}`}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeSection === s.id
                ? "bg-[#FF6E13] text-white"
                : "bg-white border border-[#EBE5DB] text-[#7A6F69] hover:bg-[#F5F2EB]"}`}
          >
            <s.icon size={16} />
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "modules" && <ModulesCRUD />}
      {activeSection === "students" && <StudentsCRUD />}
      {activeSection === "instructors" && <InstructorsCRUD />}
      {activeSection === "users" && <UsersCRUD />}
    </div>
  );
}

/* ─── MODULES CRUD ─────────────────────────────────────────────────────── */

function ModulesCRUD() {
  const [modules, setModules] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { api.getModules().then(setModules); }, []);

  const empty = { id: "", start_time: "", week: "", date: "", day: "", shift: "", length_hrs: 0, format: "Live", channel: "", module: "", instructor: "", status: "Scheduled" };

  const handleSave = async () => {
    try {
      if (creating) {
        await api.adminCreateModule(form);
      } else {
        await api.adminUpdateModule(editing, form);
      }
      setEditing(null); setCreating(false);
      api.getModules().then(setModules);
    } catch (e) { alert(e.response?.data?.detail || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete module ${id}?`)) return;
    await api.adminDeleteModule(id);
    api.getModules().then(setModules);
  };

  const loadVersions = async (id) => {
    const v = await api.adminModuleVersions(id);
    setVersions(v);
    setShowVersions(id);
  };

  const restoreVersion = async (id, idx) => {
    await api.adminRestoreModule(id, idx);
    setShowVersions(null);
    api.getModules().then(setModules);
  };

  return (
    <div data-testid="admin-modules-crud">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#2D241E]">{modules.length} modules</p>
        <button
          data-testid="admin-create-module"
          onClick={() => { setForm(empty); setCreating(true); setEditing(null); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6E13] text-white text-xs font-semibold rounded-lg hover:bg-[#E65C0A] transition-all"
        >
          <Plus size={14} /> New Module
        </button>
      </div>

      {/* Inline Form */}
      {(creating || editing) && (
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 mb-4" data-testid="module-form">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-3">{creating ? "Create Module" : "Edit Module"}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(empty).map(k => (
              <div key={k}>
                <label className="text-[9px] font-semibold text-[#7A6F69] uppercase">{k.replace(/_/g, ' ')}</label>
                <input
                  value={form[k] || ""}
                  onChange={e => setForm({ ...form, [k]: k === "length_hrs" ? parseFloat(e.target.value) || 0 : e.target.value })}
                  disabled={editing && k === "id"}
                  className="w-full px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs text-[#2D241E] outline-none focus:border-[#FF6E13]"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-semibold rounded-lg"><Check size={12} /> Save</button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#F5F2EB] text-[#7A6F69] text-xs font-semibold rounded-lg"><X size={12} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Version History */}
      {showVersions && (
        <div className="bg-[#FFF0E6] border border-[#FFD4B2] rounded-xl p-4 mb-4" data-testid="version-history">
          <p className="text-xs font-bold text-[#B34700] uppercase tracking-wider mb-2">Version History: {showVersions}</p>
          {versions.length === 0 ? <p className="text-xs text-[#7A6F69]">No versions saved yet.</p> : (
            <div className="space-y-2">
              {versions.map((v, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2">
                  <span className="text-xs text-[#7A6F69]">{new Date(v.saved_at).toLocaleString()}</span>
                  <button onClick={() => restoreVersion(showVersions, i)} className="text-xs font-semibold text-[#FF6E13]">Restore</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowVersions(null)} className="mt-2 text-xs text-[#7A6F69]">Close</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#EBE5DB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#F5F2EB]">
              <tr>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[#7A6F69]">ID</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[#7A6F69]">Module</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[#7A6F69]">Week</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[#7A6F69]">Channel</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[#7A6F69]">Status</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[#7A6F69]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.slice(0, 50).map(m => (
                <tr key={m.id} className="border-b border-[#EBE5DB] hover:bg-[#FDFBF7]">
                  <td className="px-3 py-2 font-semibold text-[#FF6E13]">{m.id}</td>
                  <td className="px-3 py-2 text-[#2D241E] max-w-[200px] truncate">{m.module}</td>
                  <td className="px-3 py-2 text-[#7A6F69]">{m.week}</td>
                  <td className="px-3 py-2 text-[#7A6F69]">{m.channel}</td>
                  <td className="px-3 py-2 text-[#7A6F69]">{m.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setForm(m); setEditing(m.id); setCreating(false); }} className="p-1 text-[#7A6F69] hover:text-[#FF6E13]"><Pencil size={14} /></button>
                      <button onClick={() => loadVersions(m.id)} className="p-1 text-[#7A6F69] hover:text-[#FF6E13]"><ArrowCounterClockwise size={14} /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1 text-[#7A6F69] hover:text-[#C62828]"><Trash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── STUDENTS CRUD ────────────────────────────────────────────────────── */

function StudentsCRUD() {
  const [students, setStudents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { api.getStudents().then(setStudents); }, []);
  const empty = { name: "", role: "", country: "", student_id: "" };

  const handleSave = async () => {
    try {
      if (creating) {
        await api.adminCreateStudent(form);
      } else {
        await api.adminUpdateStudent(editing, form);
      }
      setEditing(null); setCreating(false);
      api.getStudents().then(setStudents);
    } catch (e) { alert(e.response?.data?.detail || "Error"); }
  };

  const handleDelete = async (sid) => {
    if (!window.confirm(`Delete student ${sid}?`)) return;
    await api.adminDeleteStudent(sid);
    api.getStudents().then(setStudents);
  };

  return (
    <div data-testid="admin-students-crud">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#2D241E]">{students.length} students</p>
        <button
          data-testid="admin-create-student"
          onClick={() => { setForm(empty); setCreating(true); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6E13] text-white text-xs font-semibold rounded-lg hover:bg-[#E65C0A] transition-all"
        >
          <Plus size={14} /> New Student
        </button>
      </div>

      {(creating || editing) && (
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(empty).map(k => (
              <div key={k}>
                <label className="text-[9px] font-semibold text-[#7A6F69] uppercase">{k.replace(/_/g, ' ')}</label>
                <input value={form[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-semibold rounded-lg"><Check size={12} /> Save</button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="px-3 py-1.5 bg-[#F5F2EB] text-[#7A6F69] text-xs font-semibold rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(s => (
          <div key={s.student_id} className="bg-white border border-[#EBE5DB] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center text-[#FF6E13] font-bold text-sm">{s.name?.charAt(0)}</div>
                <div>
                  <p className="text-sm font-semibold text-[#2D241E]">{s.name}</p>
                  <p className="text-[10px] text-[#7A6F69]">{s.student_id} | {s.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setForm({ name: s.name, role: s.role, country: s.country, student_id: s.student_id }); setEditing(s.student_id); setCreating(false); }} className="p-1 text-[#7A6F69] hover:text-[#FF6E13]"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(s.student_id)} className="p-1 text-[#7A6F69] hover:text-[#C62828]"><Trash size={14} /></button>
              </div>
            </div>
            <p className="text-xs text-[#7A6F69]">{s.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── INSTRUCTORS CRUD ─────────────────────────────────────────────────── */

function InstructorsCRUD() {
  const [instructors, setInstructors] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { api.getInstructors().then(setInstructors); }, []);
  const empty = { name: "", channels: "", modules: "", total_hrs: 0, role: "COE Specialist" };

  const handleSave = async () => {
    try {
      const data = { ...form, channels: typeof form.channels === "string" ? form.channels.split(",").map(s => s.trim()).filter(Boolean) : form.channels, modules: typeof form.modules === "string" ? form.modules.split(",").map(s => s.trim()).filter(Boolean) : form.modules, total_hrs: parseFloat(form.total_hrs) || 0 };
      if (creating) { await api.adminCreateInstructor(data); }
      else { await api.adminUpdateInstructor(editing, data); }
      setEditing(null); setCreating(false);
      api.getInstructors().then(setInstructors);
    } catch (e) { alert(e.response?.data?.detail || "Error"); }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete instructor ${name}?`)) return;
    await api.adminDeleteInstructor(name);
    api.getInstructors().then(setInstructors);
  };

  return (
    <div data-testid="admin-instructors-crud">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#2D241E]">{instructors.length} instructors</p>
        <button onClick={() => { setForm(empty); setCreating(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6E13] text-white text-xs font-semibold rounded-lg hover:bg-[#E65C0A] transition-all" data-testid="admin-create-instructor"><Plus size={14} /> New Instructor</button>
      </div>

      {(creating || editing) && (
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["name", "role", "total_hrs"].map(k => (
              <div key={k}>
                <label className="text-[9px] font-semibold text-[#7A6F69] uppercase">{k.replace(/_/g, ' ')}</label>
                <input value={form[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-[9px] font-semibold text-[#7A6F69] uppercase">Channels (comma-separated)</label>
              <input value={Array.isArray(form.channels) ? form.channels.join(", ") : form.channels || ""} onChange={e => setForm({ ...form, channels: e.target.value })} className="w-full px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-semibold rounded-lg"><Check size={12} /> Save</button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="px-3 py-1.5 bg-[#F5F2EB] text-[#7A6F69] text-xs font-semibold rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#EBE5DB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#F5F2EB]">
              <tr>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase text-[#7A6F69]">Name</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase text-[#7A6F69]">Channels</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase text-[#7A6F69]">Hours</th>
                <th className="text-left px-3 py-2 text-[9px] font-semibold uppercase text-[#7A6F69]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map(inst => (
                <tr key={inst.name} className="border-b border-[#EBE5DB] hover:bg-[#FDFBF7]">
                  <td className="px-3 py-2 font-medium text-[#2D241E]">{inst.name}</td>
                  <td className="px-3 py-2 text-[#7A6F69]">{inst.channels?.join(", ")}</td>
                  <td className="px-3 py-2 text-[#7A6F69]">{inst.total_hrs}h</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setForm({ ...inst, channels: inst.channels?.join(", ") || "" }); setEditing(inst.name); setCreating(false); }} className="p-1 text-[#7A6F69] hover:text-[#FF6E13]"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(inst.name)} className="p-1 text-[#7A6F69] hover:text-[#C62828]"><Trash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── USERS CRUD ───────────────────────────────────────────────────────── */

function UsersCRUD() {
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPw, setResetPw] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "student" });

  const loadUsers = () => api.adminGetUsers().then(setUsers).catch(() => {});
  useEffect(() => { loadUsers(); }, []);

  const handleCreateUser = async () => {
    try {
      await api.adminCreateUser(form);
      setCreating(false);
      loadUsers();
    } catch (e) { alert(e.response?.data?.detail || "Error"); }
  };

  const handleReset = async () => {
    if (!resetEmail || !resetPw) return;
    try {
      await api.adminResetPassword(resetEmail, resetPw);
      setResetEmail(""); setResetPw("");
      alert("Password reset successfully");
    } catch (e) { alert(e.response?.data?.detail || "Error"); }
  };

  return (
    <div className="space-y-6" data-testid="admin-users-crud">
      {/* Create User */}
      <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider">Users ({users.length})</p>
          <button onClick={() => setCreating(!creating)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6E13] text-white text-xs font-semibold rounded-lg" data-testid="admin-create-user">
            <Plus size={12} /> New User
          </button>
        </div>
        {creating && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]" />
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]" />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="px-2.5 py-1.5 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]">
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
            <button onClick={handleCreateUser} className="col-span-2 md:col-span-4 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-semibold rounded-lg">Create User</button>
          </div>
        )}
        <div className="space-y-2">
          {users.map(u => (
            <div key={u._id} className="flex items-center justify-between p-3 bg-[#F5F2EB] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${u.role === 'admin' ? 'bg-[#FF6E13]' : u.role === 'instructor' ? 'bg-[#2E7D32]' : 'bg-[#1565C0]'}`} />
                <div>
                  <p className="text-xs font-semibold text-[#2D241E]">{u.name}</p>
                  <p className="text-[10px] text-[#7A6F69]">{u.email} · {u.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Reset */}
      <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
        <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-3">Password Reset</p>
        <div className="flex gap-3">
          <select value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="flex-1 px-2.5 py-2 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]">
            <option value="">Select user...</option>
            {users.map(u => <option key={u._id} value={u.email}>{u.name} ({u.email})</option>)}
          </select>
          <input type="password" placeholder="New password" value={resetPw} onChange={e => setResetPw(e.target.value)} className="flex-1 px-2.5 py-2 border border-[#EBE5DB] rounded-lg text-xs outline-none focus:border-[#FF6E13]" />
          <button onClick={handleReset} data-testid="admin-reset-password" className="px-4 py-2 bg-[#FF6E13] text-white text-xs font-semibold rounded-lg hover:bg-[#E65C0A] transition-all">Reset</button>
        </div>
      </div>
    </div>
  );
}
