import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  X, Books, Clock, Crosshair, Users, Trophy, ChartPolar,
  Handshake, ChatCircle, Lightning, Target, Brain, Presentation,
  UserCircle, MapPin, ArrowRight
} from "@phosphor-icons/react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from "recharts";

const SKILL_META = {
  objection_handling: { label: "Objection Handling", icon: Crosshair, color: "#C62828" },
  negotiation: { label: "Negotiation", icon: Handshake, color: "#FF6E13" },
  data_analysis: { label: "Data Analysis", icon: ChartPolar, color: "#1565C0" },
  communication: { label: "Communication", icon: ChatCircle, color: "#2E7D32" },
  presentation: { label: "Presentation", icon: Presentation, color: "#7B61FF" },
  analytical_thinking: { label: "Analytical Thinking", icon: Brain, color: "#00809D" },
  campaign_management: { label: "Campaign Mgt.", icon: Target, color: "#FF9900" },
  client_management: { label: "Client Mgt.", icon: Users, color: "#D97706" },
};

const CHANNEL_COLORS = {
  AMZ: "#FF9900", Google: "#4285F4", "Google Ads": "#4285F4", Quartile: "#FF6E13",
  Walmart: "#0071DC", Portal: "#7B61FF", Meta: "#0081FB", "Soft Skills": "#2E7D32",
  Bing: "#00809D", DTC: "#8B5CF6", Tech: "#6B7280", Excel: "#217346",
  Sciene: "#9333EA", ChatGPT: "#10A37F", Claude: "#CC785C", Multichannel: "#D97706",
  TikTok: "#000000", MC: "#D97706",
};

export default function StudentDetailModal({ studentId, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    setLoading(true);
    api.getStudentDetail(studentId)
      .then(d => { setStudent(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="w-12 h-12 border-3 border-[#FF6E13] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!student) return null;

  const skills = student.skills || {};
  const channelHrs = student.channel_hours || {};
  const modules = student.modules_attended || [];
  const hasData = modules.length > 0;

  // Radar data for channel knowledge
  const radarData = Object.entries(channelHrs).map(([ch, hrs]) => ({
    subject: ch, hours: hrs, fullMark: Math.max(10, ...Object.values(channelHrs)),
  }));

  // Skills bar data
  const skillsData = Object.entries(SKILL_META).map(([key, meta]) => ({
    key, label: meta.label, value: skills[key] || 0, color: meta.color,
  }));

  // Channel hours for bar chart
  const channelBarData = Object.entries(channelHrs)
    .sort((a, b) => b[1] - a[1])
    .map(([ch, hrs]) => ({ channel: ch, hours: hrs, color: CHANNEL_COLORS[ch] || "#7A6F69" }));

  const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "skills", label: "Skills" },
    { id: "modules", label: "Modules" },
    { id: "qa", label: "Q&A History" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose} data-testid="student-detail-modal">
      <div className="bg-[#FDFBF7] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white border-b border-[#EBE5DB] px-6 py-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#FFF0E6] flex items-center justify-center text-[#FF6E13] font-bold text-2xl shrink-0" style={{ fontFamily: 'Cabinet Grotesk' }}>
              {student.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>{student.name}</h2>
                <span className="px-2 py-0.5 bg-[#F5F2EB] text-[#7A6F69] text-[10px] font-bold rounded-full font-mono">{student.student_id}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-[#7A6F69]">{student.role}</span>
                <span className="flex items-center gap-1 text-xs text-[#FF6E13] font-medium">
                  <MapPin size={12} weight="bold" /> {student.country}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} data-testid="student-modal-close" className="p-2 hover:bg-[#F5F2EB] rounded-lg transition-colors">
            <X size={20} className="text-[#7A6F69]" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-[#EBE5DB] px-6 flex gap-6 bg-white shrink-0">
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              data-testid={`student-section-${sec.id}`}
              onClick={() => setActiveSection(sec.id)}
              className={`py-3 text-sm font-medium transition-all border-b-2
                ${activeSection === sec.id
                  ? "border-[#FF6E13] text-[#FF6E13]"
                  : "border-transparent text-[#7A6F69] hover:text-[#2D241E]"}`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "overview" && <OverviewSection student={student} hasData={hasData} radarData={radarData} channelBarData={channelBarData} skillsData={skillsData} />}
          {activeSection === "skills" && <SkillsSection skills={skills} skillsData={skillsData} hasData={hasData} />}
          {activeSection === "modules" && <ModulesSection modules={modules} />}
          {activeSection === "qa" && <QASection qaHistory={student.qa_history || []} />}
        </div>
      </div>
    </div>
  );
}

/* ─── OVERVIEW SECTION ─────────────────────────────────────────────────── */

function OverviewSection({ student, hasData, radarData, channelBarData, skillsData }) {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="student-kpi-row">
        <KpiCard label="Modules Attended" value={student.modules_attended?.length || 0} icon={Books} />
        <KpiCard label="Total Hours" value={`${(student.total_hours || 0).toFixed(1)}h`} icon={Clock} />
        <KpiCard label="Avg. Score" value={`${student.overall_score || 0}/10`} icon={Trophy} accent />
        <KpiCard label="Shadow Calls" value={student.shadow_calls || 0} icon={Users} />
        <KpiCard label="Buddy Tasks" value={student.buddy_tasks || 0} icon={Handshake} />
        <KpiCard label="Attendance" value={`${student.attendance_rate || 0}%`} icon={Target} />
      </div>

      {!hasData ? (
        <EmptyKPI />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Knowledge Radar */}
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5" data-testid="channel-knowledge-chart">
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-4">Channel Knowledge Distribution</p>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#EBE5DB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#2D241E', fontWeight: 600 }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: '#7A6F69' }} />
                  <Radar name="Hours" dataKey="hours" stroke="#FF6E13" fill="#FF6E13" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#7A6F69] text-center py-8">No channel data yet</p>
            )}
          </div>

          {/* Channel Hours Bar */}
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5" data-testid="channel-hours-bar">
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-4">Hours Per Channel</p>
            {channelBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={channelBarData} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#7A6F69' }} />
                  <YAxis dataKey="channel" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#2D241E', fontWeight: 500 }} width={80} />
                  <Tooltip
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-white border border-[#EBE5DB] rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-xs font-bold text-[#2D241E]">{payload[0].payload.channel}</p>
                        <p className="text-sm text-[#FF6E13] font-bold">{payload[0].value}h</p>
                      </div>
                    ) : null}
                  />
                  <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={20}>
                    {channelBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#7A6F69] text-center py-8">No channel data yet</p>
            )}
          </div>

          {/* Skills Snapshot (top 4) */}
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5" data-testid="skills-snapshot">
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-4">Skills Snapshot</p>
            <div className="space-y-3">
              {skillsData.slice(0, 4).map(s => (
                <SkillBar key={s.key} label={s.label} value={s.value} color={s.color} />
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 space-y-4">
            {student.strengths_summary && (
              <div>
                <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-2">Strengths</p>
                <p className="text-sm text-[#2D241E] leading-relaxed">{student.strengths_summary}</p>
              </div>
            )}
            {student.improvement_areas && (
              <div>
                <p className="text-xs font-bold text-[#C62828] uppercase tracking-wider mb-2">Areas for Improvement</p>
                <p className="text-sm text-[#2D241E] leading-relaxed">{student.improvement_areas}</p>
              </div>
            )}
            {student.assessment_scores?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-2">Assessment Scores</p>
                <div className="space-y-2">
                  {student.assessment_scores.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[#F5F2EB] rounded-lg">
                      <span className="text-xs font-medium text-[#2D241E]">{a.title}</span>
                      <span className="text-sm font-bold text-[#FF6E13]">{a.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!student.strengths_summary && !student.improvement_areas && (
              <div className="text-center py-4">
                <p className="text-sm text-[#7A6F69]">Summary data builds as more transcripts are ingested.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SKILLS SECTION ───────────────────────────────────────────────────── */

function SkillsSection({ skills, skillsData, hasData }) {
  if (!hasData) return <EmptyKPI />;

  // Radar of all skills
  const skillRadar = skillsData.map(s => ({ subject: s.label, value: s.value, fullMark: 10 }));

  return (
    <div className="space-y-6" data-testid="skills-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Radar */}
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-4">Skills Web Chart</p>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={skillRadar} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="#EBE5DB" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#2D241E', fontWeight: 500 }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: '#7A6F69' }} domain={[0, 10]} />
              <Radar name="Score" dataKey="value" stroke="#FF6E13" fill="#FF6E13" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#FF6E13', r: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* All Skills Bars */}
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-4">Detailed Skills Breakdown</p>
          <div className="space-y-4">
            {skillsData.map(s => {
              const Icon = SKILL_META[s.key]?.icon || Target;
              return (
                <div key={s.key} className="group" data-testid={`skill-${s.key}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={16} weight="duotone" style={{ color: s.color }} />
                      <span className="text-sm font-medium text-[#2D241E]">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: s.value >= 7 ? '#2E7D32' : s.value >= 4 ? '#B34700' : '#C62828' }}>
                      {s.value}/10
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F5F2EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.value * 10}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Skills Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["objection_handling", "negotiation", "communication", "campaign_management"].map(key => {
          const meta = SKILL_META[key];
          const Icon = meta.icon;
          const val = skills[key] || 0;
          return (
            <div key={key} className="bg-white border border-[#EBE5DB] rounded-xl p-4 text-center" data-testid={`skill-card-${key}`}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
                <Icon size={22} weight="duotone" style={{ color: meta.color }} />
              </div>
              <p className="text-2xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>{val}</p>
              <p className="text-[10px] font-semibold text-[#7A6F69] uppercase tracking-wider mt-0.5">{meta.label}</p>
              <div className="w-full h-1.5 bg-[#F5F2EB] rounded-full mt-2">
                <div className="h-full rounded-full" style={{ width: `${val * 10}%`, backgroundColor: meta.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── MODULES SECTION ──────────────────────────────────────────────────── */

function ModulesSection({ modules }) {
  if (!modules.length) return <EmptyKPI />;

  return (
    <div className="space-y-4" data-testid="modules-section">
      <div className="bg-white border border-[#EBE5DB] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F2EB]">
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">ID</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Module</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Date</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Channel</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Hours</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Score</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#7A6F69] px-4 py-3">Interactions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m, i) => (
              <tr key={i} className="border-b border-[#EBE5DB] hover:bg-[#FDFBF7] transition-colors">
                <td className="px-4 py-3 text-xs font-semibold text-[#FF6E13]">{m.module_id}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#2D241E] max-w-[200px] truncate">{m.module}</td>
                <td className="px-4 py-3 text-xs text-[#7A6F69]">{m.date}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full text-white" style={{ backgroundColor: CHANNEL_COLORS[m.channel] || '#7A6F69' }}>
                    {m.channel}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-[#2D241E]">{m.hrs}h</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-bold ${m.score >= 7 ? 'text-[#2E7D32]' : m.score >= 5 ? 'text-[#B34700]' : 'text-[#C62828]'}`}>
                    {m.score}/10
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#7A6F69]">{m.interactions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Q&A SECTION ──────────────────────────────────────────────────────── */

function QASection({ qaHistory }) {
  if (!qaHistory.length) {
    return <EmptyKPI text="Q&A contributions will appear as transcripts are analyzed." />;
  }

  return (
    <div className="space-y-3" data-testid="qa-section">
      {qaHistory.map((qa, i) => (
        <div key={i} className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ChatCircle size={16} weight="duotone" className="text-[#FF6E13]" />
            <span className="text-xs font-bold text-[#FF6E13]">{qa.module}</span>
            {qa.section && <span className="text-[10px] text-[#7A6F69] bg-[#F5F2EB] px-2 py-0.5 rounded-full">{qa.section}</span>}
          </div>
          <p className="text-sm font-medium text-[#2D241E] mb-1">Q: {qa.question}</p>
          <p className="text-sm text-[#7A6F69]">A: {qa.answer}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── SHARED COMPONENTS ────────────────────────────────────────────────── */

function KpiCard({ label, value, icon: Icon, accent }) {
  return (
    <div className={`${accent ? 'bg-[#2D241E]' : 'bg-white'} border border-[#EBE5DB] rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} weight="duotone" className={accent ? "text-[#FF6E13]" : "text-[#7A6F69]"} />
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${accent ? 'text-[#7A6F69]' : 'text-[#7A6F69]'}`}>{label}</p>
      </div>
      <p className={`text-xl font-bold ${accent ? 'text-white' : 'text-[#2D241E]'}`} style={{ fontFamily: 'Cabinet Grotesk' }}>{value}</p>
    </div>
  );
}

function SkillBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[#2D241E]">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}/10</span>
      </div>
      <div className="w-full h-2 bg-[#F5F2EB] rounded-full">
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 10}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function EmptyKPI({ text = "KPI data builds automatically as transcripts are ingested. Upload module transcripts to see student analytics." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#FFF0E6] flex items-center justify-center mb-3">
        <Lightning size={28} weight="duotone" className="text-[#FF6E13]" />
      </div>
      <p className="text-sm font-semibold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>No data yet</p>
      <p className="text-xs text-[#7A6F69] mt-1 max-w-sm text-center">{text}</p>
    </div>
  );
}
