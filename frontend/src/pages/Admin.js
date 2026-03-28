import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-xl transition
        ${active ? "bg-primary text-white" : "bg-white border border-border text-text-muted hover:text-text-main"}`}
    >
      {children}
    </button>
  );
}

// ─── USERS ───
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "student" });
  const [msg, setMsg] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPwd, setResetPwd] = useState("");

  useEffect(() => { api.adminGetUsers().then(setUsers); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.adminCreateUser(form);
      setMsg("✓ User created");
      api.adminGetUsers().then(setUsers);
      setForm({ email: "", password: "", name: "", role: "student" });
    } catch (err) { setMsg("✗ " + (err?.response?.data?.detail || "Error")); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.adminResetPassword(resetEmail, resetPwd);
      setMsg("✓ Password reset");
      setResetEmail(""); setResetPwd("");
    } catch (err) { setMsg("✗ " + (err?.response?.data?.detail || "Error")); }
  };

  return (
    <div className="space-y-5">
      {msg && <div className="text-sm text-text-muted bg-surface-2 rounded-xl px-4 py-2">{msg}</div>}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-main">All Users</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-2 border-b border-border">
            <tr>
              {["Name", "Email", "Role"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-border/50">
                <td className="px-4 py-2.5 font-medium text-text-main">{u.name}</td>
                <td className="px-4 py-2.5 text-text-muted">{u.email}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${u.role === "admin" ? "bg-orange-100 text-orange-700" : u.role === "instructor" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-bold text-text-main mb-4">Create User</h3>
          <form onSubmit={createUser} className="space-y-3">
            {[
              { field: "name", placeholder: "Full name" },
              { field: "email", placeholder: "Email", type: "email" },
              { field: "password", placeholder: "Password", type: "password" },
            ].map(({ field, placeholder, type = "text" }) => (
              <input key={field} type={type} placeholder={placeholder} value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            ))}
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none">
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition">
              Create User
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-bold text-text-main mb-4">Reset Password</h3>
          <form onSubmit={resetPassword} className="space-y-3">
            <input type="email" placeholder="User email" value={resetEmail}
              onChange={e => setResetEmail(e.target.value)} required
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="password" placeholder="New password" value={resetPwd}
              onChange={e => setResetPwd(e.target.value)} required
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button type="submit" className="w-full py-2 bg-warning text-white text-sm font-semibold rounded-xl hover:opacity-90 transition">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── MODULES CRUD ───
function ModulesPanel() {
  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const BLANK = { id: "", week: "", date: "", day: "", start_time: "", shift: "AM", length_hrs: 1, format: "Live", channel: "", module: "", instructor: "", status: "Scheduled" };
  const [form, setForm] = useState(BLANK);

  const load = () => api.getModules().then(setModules);
  useEffect(() => { load(); }, []);

  const filtered = modules.filter(m =>
    m.module?.toLowerCase().includes(search.toLowerCase()) ||
    m.id?.toLowerCase().includes(search.toLowerCase())
  );

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.adminUpdateModule(editing, { ...form, length_hrs: parseFloat(form.length_hrs) });
        setMsg("✓ Module updated");
      } else {
        await api.adminCreateModule({ ...form, length_hrs: parseFloat(form.length_hrs) });
        setMsg("✓ Module created");
      }
      setEditing(null); setForm(BLANK); load();
    } catch (err) { setMsg("✗ " + (err?.response?.data?.detail || "Error")); }
  };

  const del = async (id) => {
    if (!window.confirm(`Delete module ${id}?`)) return;
    try { await api.adminDeleteModule(id); setMsg("✓ Deleted"); load(); }
    catch (err) { setMsg("✗ " + (err?.response?.data?.detail || "Error")); }
  };

  return (
    <div className="space-y-5">
      {msg && <div className="text-sm text-text-muted bg-surface-2 rounded-xl px-4 py-2">{msg}</div>}

      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="text-sm font-bold text-text-main mb-4">{editing ? `Edit ${editing}` : "New Module"}</h3>
        <form onSubmit={save} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ["id", "ID (e.g. QA101)"], ["week", "Week"], ["date", "Date"], ["day", "Day"],
            ["start_time", "Start Time"], ["shift", "Shift (AM/PM)"],
            ["length_hrs", "Length (hrs)"], ["format", "Format"], ["channel", "Channel"],
            ["module", "Module Name"], ["instructor", "Instructor"], ["status", "Status"],
          ].map(([field, placeholder]) => (
            <input key={field} placeholder={placeholder} value={form[field]}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              required={field === "id" || field === "module"}
              className="px-3 py-2 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          ))}
          <div className="col-span-2 md:col-span-3 flex gap-3">
            <button type="submit" className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition">
              {editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(BLANK); }}
                className="px-5 py-2 bg-white border border-border text-sm font-semibold rounded-xl text-text-muted hover:text-text-main transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules..."
        className="w-full max-w-sm px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                {["ID", "Module", "Channel", "Instructor", "Date", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map(m => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-surface-2/50">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary font-semibold">{m.id}</td>
                  <td className="px-4 py-2.5 text-text-main max-w-[200px] truncate">{m.module}</td>
                  <td className="px-4 py-2.5 text-text-muted">{m.channel}</td>
                  <td className="px-4 py-2.5 text-text-muted max-w-[120px] truncate">{m.instructor}</td>
                  <td className="px-4 py-2.5 text-text-muted">{m.date}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.status === "Presented" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(m.id); setForm({ ...BLANK, ...m }); }}
                        className="text-xs text-primary hover:underline font-semibold">Edit</button>
                      <button onClick={() => del(m.id)}
                        className="text-xs text-danger hover:underline font-semibold">Del</button>
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

// ─── STUDENTS CRUD ───
function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", country: "", student_id: "" });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  const load = () => api.getStudents().then(setStudents);
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.adminUpdateStudent(editing, form);
        setMsg("✓ Student updated");
      } else {
        await api.adminCreateStudent(form);
        setMsg("✓ Student created");
      }
      setEditing(null); setForm({ name: "", role: "", country: "", student_id: "" }); load();
    } catch (err) { setMsg("✗ " + (err?.response?.data?.detail || "Error")); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete student?")) return;
    try { await api.adminDeleteStudent(id); setMsg("✓ Deleted"); load(); }
    catch (err) { setMsg("✗ " + (err?.response?.data?.detail || "Error")); }
  };

  return (
    <div className="space-y-5">
      {msg && <div className="text-sm text-text-muted bg-surface-2 rounded-xl px-4 py-2">{msg}</div>}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="text-sm font-bold text-text-main mb-4">{editing ? "Edit Student" : "New Student"}</h3>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          {[["name", "Full Name"], ["role", "Role"], ["country", "Country"], ["student_id", "Student ID"]].map(([f, p]) => (
            <input key={f} placeholder={p} value={form[f]} onChange={e => setForm(x => ({ ...x, [f]: e.target.value }))} required
              className="px-3 py-2 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          ))}
          <div className="col-span-2 flex gap-3">
            <button type="submit" className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition">
              {editing ? "Update" : "Create"}
            </button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", role: "", country: "", student_id: "" }); }}
              className="px-5 py-2 bg-white border border-border text-sm font-semibold rounded-xl text-text-muted hover:text-text-main transition">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 border-b border-border">
            <tr>
              {["Name", "Role", "Country", "ID", "Progress", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.student_id || s.name} className="border-b border-border/50 hover:bg-surface-2/50">
                <td className="px-4 py-2.5 font-medium text-text-main">{s.name}</td>
                <td className="px-4 py-2.5 text-text-muted">{s.role}</td>
                <td className="px-4 py-2.5 text-text-muted">{s.country}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{s.student_id}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${s.academic_progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-text-muted">{s.academic_progress || 0}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(s.student_id); setForm({ name: s.name, role: s.role, country: s.country, student_id: s.student_id }); }}
                      className="text-xs text-primary hover:underline font-semibold">Edit</button>
                    <button onClick={() => del(s.student_id)}
                      className="text-xs text-danger hover:underline font-semibold">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("users");

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-main font-cabinet">Admin Panel</h1>
        <p className="text-text-muted text-sm mt-0.5">Manage users, modules, and students</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <TabBtn active={tab === "users"} onClick={() => setTab("users")}>Users</TabBtn>
        <TabBtn active={tab === "modules"} onClick={() => setTab("modules")}>Modules</TabBtn>
        <TabBtn active={tab === "students"} onClick={() => setTab("students")}>Students</TabBtn>
      </div>

      {tab === "users" && <UsersPanel />}
      {tab === "modules" && <ModulesPanel />}
      {tab === "students" && <StudentsPanel />}
    </div>
  );
}
