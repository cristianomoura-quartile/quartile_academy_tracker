import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
<<<<<<< Updated upstream
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StatCard({ label, value, sub, color = "#FF6E13" }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-1">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold font-cabinet" style={{ color }}>{value}</span>
      {sub && <span className="text-xs text-text-muted">{sub}</span>}
=======
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
>>>>>>> Stashed changes
    </div>
  );
}

<<<<<<< Updated upstream
function StatusBadge({ status }) {
  const colors = {
    Presented: "bg-green-100 text-green-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Assessment: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
=======
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
>>>>>>> Stashed changes
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< Updated upstream
    api.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const chartData = {
    labels: data.weekly_progress.map(w => w.week),
    datasets: [
      {
        label: "Presented",
        data: data.weekly_progress.map(w => w.presented),
        backgroundColor: "#FF6E13",
        borderRadius: 6,
      },
      {
        label: "Total",
        data: data.weekly_progress.map(w => w.total),
        backgroundColor: "#EBE5DB",
        borderRadius: 6,
      },
    ],
  };

  const pct = data.total_modules > 0
    ? Math.round((data.modules_delivered / data.total_modules) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-main font-cabinet">Dashboard</h1>
        <p className="text-text-muted text-sm mt-0.5">Quartile Academy program overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Modules Delivered" value={data.modules_delivered} sub={`of ${data.total_modules} total`} />
        <StatCard label="Hours Presented" value={`${data.presented_hrs}h`} sub={`of ${data.total_hrs}h total`} color="#2E7D32" />
        <StatCard label="Active Instructors" value={data.active_instructors} color="#1565C0" />
        <StatCard label="Program Progress" value={`${pct}%`} sub="modules delivered" color="#B34700" />
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-text-main">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text-main font-cabinet mb-4">Weekly Progress</h2>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "bottom" } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }}
          />
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text-main font-cabinet mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            {data.upcoming_modules.length === 0 && (
              <p className="text-sm text-text-muted">No upcoming sessions.</p>
            )}
            {data.upcoming_modules.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-surface-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-main truncate">{m.module}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {m.date} · {m.start_time} · {m.instructor}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <StatusBadge status={m.status} />
                  <span className="text-xs text-text-muted">{m.length_hrs}h</span>
                </div>
=======
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
>>>>>>> Stashed changes
              </div>
            ))}
          </div>
        </div>
      </div>
<<<<<<< Updated upstream

      {/* Weekly breakdown table */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text-main font-cabinet mb-4">Weekly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Week</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Presented</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Total</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Progress</th>
              </tr>
            </thead>
            <tbody>
              {data.weekly_progress.map((w) => (
                <tr key={w.week} className="border-b border-border/50 hover:bg-surface-2 transition">
                  <td className="py-2.5 px-3 font-medium text-text-main">{w.week}</td>
                  <td className="py-2.5 px-3 text-right text-primary font-bold">{w.presented}</td>
                  <td className="py-2.5 px-3 text-right text-text-muted">{w.total}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${w.pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-text-muted w-8">{w.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
=======
>>>>>>> Stashed changes
    </div>
  );
}
