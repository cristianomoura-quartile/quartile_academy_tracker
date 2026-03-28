import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { MagnifyingGlass, Funnel, Circle, Upload } from "@phosphor-icons/react";
import ModuleDetailModal from "@/components/ModuleDetailModal";

const STATUS_COLORS = {
  Presented: "bg-[#2E7D32]",
  Scheduled: "bg-[#FF6E13]",
  "In Progress": "bg-[#B34700]",
};

const FORMAT_STYLES = {
  Live: "bg-[#FFF0E6] text-[#B34700]",
  OnDemand: "bg-[#F5F2EB] text-[#7A6F69]",
  Assessment: "bg-[#E8F5E9] text-[#2E7D32]",
  "On-Site": "bg-[#E3F2FD] text-[#1565C0]",
};

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [filters, setFilters] = useState({ weeks: [], channels: [] });
  const [activeWeek, setActiveWeek] = useState("");
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    const params = {};
    if (activeWeek) params.week = activeWeek;
    if (search) params.search = search;
    const data = await api.getModules(params);
    setModules(data);
  }, [activeWeek, search]);

  useEffect(() => {
    api.getFilters().then(f => setFilters(f));
    fetchModules().then(() => setLoading(false));
  }, [fetchModules]);

  const totalHrs = modules.reduce((sum, m) => sum + (m.length_hrs || 0), 0);
  const presented = modules.filter(m => m.status === "Presented").length;

  return (
    <div className="p-8 max-w-[1400px]" data-testid="modules-page">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6E13] mb-1">Modules</p>
        <h1 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Academy Modules</h1>
        <p className="text-[#7A6F69] mt-1">Full curriculum for the Q2 cohort. Click any module to view details or ingest a transcript.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7A6F69]">Cohort Progress</p>
          <p className="text-3xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>
            {modules.length > 0 ? Math.round(presented / modules.length * 100) : 0}%
          </p>
          <div className="w-full h-1 bg-[#EBE5DB] rounded-full mt-2">
            <div className="h-full bg-[#FF6E13] rounded-full transition-all" style={{ width: `${modules.length > 0 ? (presented / modules.length * 100) : 0}%` }} />
          </div>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7A6F69]">Total Hours</p>
          <p className="text-3xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>{totalHrs.toFixed(1)}</p>
          <p className="text-xs text-[#7A6F69] mt-1">Across {modules.length} modules</p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7A6F69]">Modules Delivered</p>
          <p className="text-3xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>{presented}</p>
          <p className="text-xs text-[#7A6F69] mt-1">of {modules.length} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-[#EBE5DB] rounded-xl px-4 py-2.5 flex-1 max-w-sm">
          <MagnifyingGlass size={18} className="text-[#7A6F69]" />
          <input
            data-testid="module-search"
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#2D241E] placeholder-[#7A6F69] outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            data-testid="filter-all"
            onClick={() => setActiveWeek("")}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all
              ${!activeWeek ? "bg-[#FF6E13] text-white" : "bg-white border border-[#EBE5DB] text-[#7A6F69] hover:bg-[#F5F2EB]"}`}
          >
            All
          </button>
          {filters.weeks.map(w => (
            <button
              key={w}
              data-testid={`filter-${w.replace(' ', '-').toLowerCase()}`}
              onClick={() => setActiveWeek(w === activeWeek ? "" : w)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all
                ${activeWeek === w ? "bg-[#FF6E13] text-white" : "bg-white border border-[#EBE5DB] text-[#7A6F69] hover:bg-[#F5F2EB]"}`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#EBE5DB] rounded-xl overflow-hidden" data-testid="modules-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F2EB]">
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">ID</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Module Name</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Date</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Time</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Week</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Channel</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Format</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Hrs</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Instructor</th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-8 text-[#7A6F69]">Loading...</td></tr>
              ) : modules.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-[#7A6F69]">No modules found</td></tr>
              ) : modules.map((m, i) => (
                <tr
                  key={m.id}
                  data-testid={`module-row-${m.id}`}
                  onClick={() => setSelectedModule(m.id)}
                  className="border-b border-[#EBE5DB] hover:bg-[#FDFBF7] transition-colors cursor-pointer"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <td className="px-4 py-3 text-xs font-semibold text-[#FF6E13]">{m.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#2D241E] max-w-[200px] truncate">
                    {m.module}
                    {m.analyzed && (
                      <span className="ml-2 px-1.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-[9px] font-semibold rounded-full">Analyzed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#7A6F69]">{m.date}</td>
                  <td className="px-4 py-3 text-xs text-[#7A6F69]">{m.start_time}</td>
                  <td className="px-4 py-3 text-xs text-[#7A6F69]">{m.week}</td>
                  <td className="px-4 py-3 text-xs font-medium text-[#2D241E]">{m.channel}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${FORMAT_STYLES[m.format] || "bg-[#F5F2EB] text-[#7A6F69]"}`}>
                      {m.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-[#2D241E]">{m.length_hrs}h</td>
                  <td className="px-4 py-3 text-xs text-[#7A6F69] max-w-[140px] truncate">{m.instructor}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[m.status] || "bg-[#7A6F69]"}`} />
                      <span className="text-xs text-[#7A6F69]">{m.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <ModuleDetailModal
          moduleId={selectedModule}
          onClose={() => setSelectedModule(null)}
          onIngested={fetchModules}
        />
      )}
    </div>
  );
}
