import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInstructors().then(setInstructors).finally(() => setLoading(false));
  }, []);

  const filtered = instructors.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.channels?.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-main font-cabinet">Instructors</h1>
        <p className="text-text-muted text-sm mt-0.5">{instructors.length} instructors in the program</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search instructors or channels..."
        className="w-full max-w-sm px-4 py-2 rounded-xl border border-border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inst) => (
            <div key={inst.name} className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{inst.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-text-main text-sm">{inst.name}</p>
                  <p className="text-xs text-text-muted">{inst.role || "COE Specialist"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-text-muted">Total Hours</span>
                <span className="font-bold text-primary">{inst.total_hrs}h</span>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Channels</p>
                <div className="flex flex-wrap gap-1">
                  {(inst.channels || []).map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-muted font-medium">{c}</span>
                  ))}
                </div>
              </div>

              {(inst.modules || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                    Modules ({inst.modules.length})
                  </p>
                  <ul className="space-y-0.5">
                    {inst.modules.slice(0, 3).map((m, i) => (
                      <li key={i} className="text-xs text-text-muted truncate">• {m}</li>
                    ))}
                    {inst.modules.length > 3 && (
                      <li className="text-xs text-primary font-medium">+{inst.modules.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-10 text-text-muted text-sm">No instructors found.</div>
          )}
        </div>
      )}
    </div>
  );
}
