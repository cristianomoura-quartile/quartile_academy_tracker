import React, { useEffect, useState } from "react";
<<<<<<< Updated upstream
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const CHANNEL_COLORS = {
  AMZ: "#FF9900",
  "Google Ads": "#4285F4",
  Google: "#4285F4",
  Walmart: "#0071CE",
  Meta: "#1877F2",
  TikTok: "#010101",
  Bing: "#008272",
  Portal: "#6B46C1",
  Quartile: "#FF6E13",
  "Soft Skills": "#2E7D32",
  DTC: "#C2185B",
  Tech: "#00796B",
  Sciene: "#5D4037",
  Excel: "#217346",
  ChatGPT: "#10A37F",
  Multichannel: "#455A64",
  MC: "#455A64",
  Claude: "#7C3AED",
};

function getColor(channel) {
  return CHANNEL_COLORS[channel] || "#7A6F69";
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
=======
import { api } from "@/lib/api";
import { Clock, Circle } from "@phosphor-icons/react";

const CHANNEL_DOT_COLORS = {
  AMZ: "#FF9900", Google: "#4285F4", "Google Ads": "#4285F4", Quartile: "#FF6E13",
  Walmart: "#0071DC", Portal: "#7B61FF", Meta: "#0081FB", "Soft Skills": "#2E7D32",
  Bing: "#00809D", DTC: "#8B5CF6", Assessment: "#2D241E", TikTok: "#000",
  Tech: "#6B7280", Excel: "#217346", Sciene: "#9333EA", ChatGPT: "#10A37F",
  Claude: "#CC785C", Multichannel: "#D97706", MC: "#D97706",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

function parseTime(timeStr) {
  if (!timeStr) return 9;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 9;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h + m / 60;
}
>>>>>>> Stashed changes

export default function Calendar() {
  const [modules, setModules] = useState([]);
  const [filters, setFilters] = useState({ weeks: [] });
<<<<<<< Updated upstream
  const [week, setWeek] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFilters().then(d => {
      setFilters(d);
      if (d.weeks?.length) setWeek(d.weeks[0]);
    });
  }, []);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    api.getCalendar({ week }).then(setModules).finally(() => setLoading(false));
  }, [week]);

  // Group by day
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = modules.filter(m => m.day === d);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main font-cabinet">Calendar</h1>
          <p className="text-text-muted text-sm mt-0.5">Weekly schedule view</p>
        </div>
        <div className="flex gap-2">
          {filters.weeks.map(w => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition
                ${week === w
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-text-muted hover:text-text-main"
                }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DAYS.map(day => (
            <div key={day} className="space-y-2">
              <div className="text-center py-2 rounded-xl bg-white border border-border">
                <p className="text-xs font-bold text-text-main uppercase tracking-wide">{day}</p>
                {byDay[day]?.[0] && (
                  <p className="text-xs text-text-muted mt-0.5">{byDay[day][0].date}</p>
                )}
              </div>
              <div className="space-y-2">
                {byDay[day].length === 0 && (
                  <div className="rounded-xl bg-surface-2 border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-text-muted">No sessions</p>
                  </div>
                )}
                {byDay[day].map(m => (
                  <Link
                    key={m.id}
                    to={`/modules/${m.id}`}
                    className="block rounded-xl border p-3 hover:shadow-sm transition bg-white"
                    style={{ borderLeftWidth: 3, borderLeftColor: getColor(m.channel) }}
                  >
                    <p className="text-xs font-bold truncate" style={{ color: getColor(m.channel) }}>
                      {m.channel}
                    </p>
                    <p className="text-xs font-semibold text-text-main mt-0.5 leading-tight">{m.module}</p>
                    <p className="text-xs text-text-muted mt-1">{m.start_time} · {m.length_hrs}h</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                        ${m.status === "Presented" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {m.status}
                      </span>
                      <span className="text-xs text-text-muted">{m.format}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Channel Colors</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(CHANNEL_COLORS).map(([ch, col]) => (
            <div key={ch} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col }} />
              <span className="text-xs text-text-muted">{ch}</span>
            </div>
          ))}
        </div>
=======
  const [activeWeek, setActiveWeek] = useState("Week 1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFilters().then(f => setFilters(f));
  }, []);

  useEffect(() => {
    api.getCalendar({ week: activeWeek }).then(d => { setModules(d); setLoading(false); });
  }, [activeWeek]);

  const totalHrs = modules.reduce((s, m) => s + (m.length_hrs || 0), 0);
  const uniqueChannels = [...new Set(modules.map(m => m.channel))];

  const dayModules = {};
  DAYS.forEach(d => { dayModules[d] = modules.filter(m => m.day === d); });

  return (
    <div className="p-8 max-w-[1400px]" data-testid="calendar-page">
      <div className="mb-6 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6E13] mb-1">Schedule</p>
        <h1 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Modules Calendar</h1>
        <p className="text-[#7A6F69] mt-1">Weekly academic schedule. High priority modules marked in orange.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Total Hours</p>
          <p className="text-2xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>{totalHrs.toFixed(1)}</p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Modules</p>
          <p className="text-2xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>{modules.length}</p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Channels</p>
          <p className="text-2xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>{uniqueChannels.length}</p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Completion</p>
          <p className="text-2xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>
            {modules.length > 0 ? Math.round(modules.filter(m => m.status === "Presented").length / modules.length * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Week Filter */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {filters.weeks.map(w => (
          <button
            key={w}
            data-testid={`cal-filter-${w.replace(' ', '-').toLowerCase()}`}
            onClick={() => setActiveWeek(w)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all
              ${activeWeek === w ? "bg-[#FF6E13] text-white" : "bg-white border border-[#EBE5DB] text-[#7A6F69] hover:bg-[#F5F2EB]"}`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-[#EBE5DB] rounded-xl overflow-hidden" data-testid="calendar-grid">
        {/* Day Headers */}
        <div className="grid grid-cols-5 border-b border-[#EBE5DB]">
          {DAYS.map(d => {
            const dayMods = dayModules[d] || [];
            const hrs = dayMods.reduce((s, m) => s + (m.length_hrs || 0), 0);
            return (
              <div key={d} className="p-3 text-center border-r border-[#EBE5DB] last:border-r-0 bg-[#F5F2EB]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6F69]">{d.substring(0, 3)}</p>
                <p className="text-[10px] text-[#7A6F69]">{dayMods.length} modules · {hrs.toFixed(1)}h</p>
              </div>
            );
          })}
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-5 min-h-[500px]">
          {DAYS.map(d => {
            const dayMods = (dayModules[d] || []).sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));
            return (
              <div key={d} className="border-r border-[#EBE5DB] last:border-r-0 p-2 space-y-1.5">
                {dayMods.map((m, i) => {
                  const channelColor = CHANNEL_DOT_COLORS[m.channel] || '#7A6F69';
                  const isLive = m.format === "Live";
                  return (
                    <div
                      key={i}
                      data-testid={`cal-event-${m.id}`}
                      className={`rounded-lg p-2.5 text-xs transition-all cursor-pointer hover:shadow-sm
                        ${isLive ? 'bg-[#FFF0E6] border-l-[3px]' : 'bg-[#F5F2EB] border-l-[3px]'}`}
                      style={{ borderLeftColor: channelColor }}
                    >
                      <p className="text-[10px] font-medium text-[#7A6F69]">{m.start_time} · {m.length_hrs}h</p>
                      <p className="font-semibold text-[#2D241E] mt-0.5 leading-tight truncate">{m.module}</p>
                      <p className="text-[10px] text-[#7A6F69] mt-0.5 truncate">{m.instructor}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className="px-1.5 py-0.5 text-[8px] font-bold rounded-full text-white"
                          style={{ backgroundColor: channelColor }}
                        >
                          {m.channel}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full
                          ${isLive ? 'bg-[#FF6E13] text-white' : 'bg-[#EBE5DB] text-[#7A6F69]'}`}>
                          {m.format}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {dayMods.length === 0 && (
                  <div className="text-[10px] text-[#7A6F69] text-center py-8">No modules</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        {uniqueChannels.map(ch => (
          <div key={ch} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHANNEL_DOT_COLORS[ch] || '#7A6F69' }} />
            <span className="text-[10px] font-medium text-[#7A6F69] uppercase">{ch}</span>
          </div>
        ))}
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
