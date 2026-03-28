import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
<<<<<<< Updated upstream

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
=======
import { MagnifyingGlass, Clock, Books } from "@phosphor-icons/react";

const CHANNEL_COLORS = {
  AMZ: "#FF9900", Google: "#4285F4", "Google Ads": "#4285F4", Quartile: "#FF6E13",
  Walmart: "#0071DC", Portal: "#7B61FF", Meta: "#0081FB", TikTok: "#000000",
  "Soft Skills": "#2E7D32", Bing: "#00809D", DTC: "#8B5CF6", Tech: "#6B7280",
};

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [filters, setFilters] = useState({ channels: [] });
  const [activeChannel, setActiveChannel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFilters().then(f => setFilters(f));
    api.getInstructors().then(d => { setInstructors(d); setLoading(false); });
  }, []);

  useEffect(() => {
    const params = activeChannel ? { channel: activeChannel } : {};
    api.getInstructors(params).then(setInstructors);
  }, [activeChannel]);

  return (
    <div className="p-8 max-w-[1400px]" data-testid="instructors-page">
      <div className="mb-6 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6E13] mb-1">Faculty</p>
        <h1 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Instructors</h1>
        <p className="text-[#7A6F69] mt-1">{instructors.length} specialists across all channels</p>
      </div>

      {/* Channel Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          data-testid="instructor-filter-all"
          onClick={() => setActiveChannel("")}
          className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all
            ${!activeChannel ? "bg-[#FF6E13] text-white" : "bg-white border border-[#EBE5DB] text-[#7A6F69] hover:bg-[#F5F2EB]"}`}
        >
          All
        </button>
        {filters.channels.map(ch => (
          <button
            key={ch}
            data-testid={`instructor-filter-${ch.toLowerCase()}`}
            onClick={() => setActiveChannel(ch === activeChannel ? "" : ch)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all
              ${activeChannel === ch ? "bg-[#FF6E13] text-white" : "bg-white border border-[#EBE5DB] text-[#7A6F69] hover:bg-[#F5F2EB]"}`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Instructor Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {instructors.map((inst, i) => (
            <div
              key={i}
              data-testid={`instructor-card-${i}`}
              className="bg-white border border-[#EBE5DB] rounded-xl p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF0E6] flex items-center justify-center text-[#FF6E13] font-bold text-lg shrink-0" style={{ fontFamily: 'Cabinet Grotesk' }}>
                  {inst.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#2D241E] truncate">{inst.name}</h3>
                  <p className="text-xs text-[#7A6F69]">{inst.role}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {inst.channels.map((ch, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 text-[9px] font-bold rounded-full text-white"
                        style={{ backgroundColor: CHANNEL_COLORS[ch] || '#7A6F69' }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EBE5DB]">
                <div className="flex items-center gap-4 text-xs text-[#7A6F69]">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{inst.total_hrs}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Books size={14} />
                    <span>{inst.modules.length} modules</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {inst.modules.slice(0, 3).map((mod, j) => (
                    <span key={j} className="text-[10px] text-[#7A6F69] bg-[#F5F2EB] px-2 py-0.5 rounded-full truncate max-w-[150px]">{mod}</span>
                  ))}
                  {inst.modules.length > 3 && (
                    <span className="text-[10px] text-[#FF6E13] font-medium">+{inst.modules.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}
