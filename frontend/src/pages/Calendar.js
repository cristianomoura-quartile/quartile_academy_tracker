import React, { useEffect, useState } from "react";
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

export default function Calendar() {
  const [modules, setModules] = useState([]);
  const [filters, setFilters] = useState({ weeks: [] });
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
      </div>
    </div>
  );
}
