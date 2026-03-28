import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Books, Clock, Chalkboard, ChartBar, Lightning, ArrowRight } from "@phosphor-icons/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function KpiCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <div
      data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`}
      className="bg-white border border-[#EBE5DB] rounded-xl p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7A6F69] mb-2">{label}</p>
          <p className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>{value}</p>
          {sub && <p className="text-sm text-[#7A6F69] mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] flex items-center justify-center">
          <Icon size={22} weight="duotone" className="text-[#FF6E13]" />
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#EBE5DB] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-semibold text-[#2D241E]">{label}</p>
        <p className="text-sm text-[#FF6E13] font-bold">{payload[0].value}% completed</p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-[#7A6F69]">Failed to load dashboard data.</div>;

  const chartData = data.weekly_progress.map(w => ({
    name: w.week.replace("Week ", "W"),
    pct: w.pct,
  }));

  return (
    <div className="p-8 max-w-[1400px]" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6E13] mb-1">Dashboard</p>
        <h1 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>
          Institutional Overview
        </h1>
        <p className="text-[#7A6F69] mt-1">Quartile Academy Q2 cohort progress and analytics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard icon={Books} label="Modules Delivered" value={data.modules_delivered} sub={`of ${data.total_modules} total`} delay={0} />
        <KpiCard icon={Clock} label="Total Hours" value={`${data.total_hrs}h`} sub={`${data.presented_hrs}h delivered`} delay={50} />
        <KpiCard icon={Chalkboard} label="Active Instructors" value={data.active_instructors} sub="Across all channels" delay={100} />
        <KpiCard icon={ChartBar} label="Modules Analyzed" value={data.modules_analyzed} sub="AI transcript insights" delay={150} />
      </div>

      {/* Chart + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Progress Chart */}
        <div className="lg:col-span-2 bg-white border border-[#EBE5DB] rounded-xl p-6 animate-slide-up" data-testid="weekly-progress-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7A6F69]">Weekly Progress</p>
              <h3 className="text-lg font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>Module Completion by Week</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7A6F69]">
              <div className="w-3 h-3 rounded-full bg-[#FF6E13]" />
              Completion %
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6E13" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FF6E13" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7A6F69' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7A6F69' }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" stroke="#FF6E13" strokeWidth={2.5} fill="url(#colorPct)" dot={{ fill: '#FF6E13', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#FF6E13' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Modules */}
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }} data-testid="upcoming-modules">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7A6F69]">Coming Up</p>
              <h3 className="text-lg font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>Upcoming Modules</h3>
            </div>
            <Lightning size={20} weight="duotone" className="text-[#FF6E13]" />
          </div>
          <div className="space-y-3">
            {data.upcoming_modules.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F5F2EB] transition-colors cursor-pointer group" data-testid={`upcoming-${m.id}`}>
                <div className="w-1 h-10 rounded-full bg-[#FF6E13] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2D241E] truncate">{m.module}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#7A6F69]">{m.channel}</span>
                    <span className="text-xs text-[#7A6F69]">&#183;</span>
                    <span className="text-xs text-[#FF6E13] font-medium">{m.date} {m.start_time}</span>
                  </div>
                  <p className="text-xs text-[#7A6F69] mt-0.5">{m.instructor}</p>
                </div>
                <ArrowRight size={16} className="text-[#7A6F69] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
