import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
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
    </div>
  );
}

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
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  );
}
