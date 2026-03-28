import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const STATUS_COLORS = {
  Presented: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Assessment: "bg-purple-100 text-purple-700",
};

const FORMAT_COLORS = {
  Live: "bg-orange-100 text-orange-700",
  OnDemand: "bg-teal-100 text-teal-700",
  "On-Site": "bg-yellow-100 text-yellow-700",
  Assessment: "bg-purple-100 text-purple-700",
};

function Badge({ text, colorMap }) {
  const cls = colorMap[text] || "bg-gray-100 text-gray-600";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{text}</span>;
}

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [filters, setFilters] = useState({ weeks: [], channels: [] });
  const [week, setWeek] = useState("");
  const [channel, setChannel] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFilters().then(setFilters);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getModules({ week: week || undefined, channel: channel || undefined, search: search || undefined })
      .then(setModules)
      .finally(() => setLoading(false));
  }, [week, channel, search]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-main font-cabinet">Modules</h1>
        <p className="text-text-muted text-sm mt-0.5">{modules.length} modules</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search modules or instructors..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <select
          value={week}
          onChange={e => setWeek(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Weeks</option>
          {filters.weeks.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select
          value={channel}
          onChange={e => setChannel(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Channels</option>
          {filters.channels.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Module</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Channel</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Instructor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Format</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Hrs</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-surface-2 transition">
                    <td className="py-3 px-4">
                      <Link to={`/modules/${m.id}`} className="font-mono text-xs text-primary hover:underline font-semibold">{m.id}</Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/modules/${m.id}`} className="font-medium text-text-main hover:text-primary transition truncate max-w-[280px] block">
                        {m.module}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-text-muted">{m.channel}</td>
                    <td className="py-3 px-4 text-text-muted truncate max-w-[160px]">{m.instructor}</td>
                    <td className="py-3 px-4 text-text-muted whitespace-nowrap">{m.date}</td>
                    <td className="py-3 px-4"><Badge text={m.format} colorMap={FORMAT_COLORS} /></td>
                    <td className="py-3 px-4 text-text-muted">{m.length_hrs}h</td>
                    <td className="py-3 px-4"><Badge text={m.status} colorMap={STATUS_COLORS} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {modules.length === 0 && (
              <p className="text-center py-10 text-text-muted text-sm">No modules found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
