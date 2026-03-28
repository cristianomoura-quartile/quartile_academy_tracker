import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

const SKILLS = [
  "objection_handling", "negotiation", "data_analysis", "communication",
  "presentation", "analytical_thinking", "campaign_management", "client_management"
];

function SkillBar({ label, value }) {
  const pct = (value / 10) * 100;
  const color = value >= 8 ? "#2E7D32" : value >= 5 ? "#FF6E13" : "#C62828";
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-text-muted capitalize">{label.replace(/_/g, " ")}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function StudentCard({ student }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div
        className="p-5 cursor-pointer hover:bg-surface-2/50 transition"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{student.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-text-main text-sm">{student.name}</p>
              <p className="text-xs text-text-muted">{student.role} · {student.country}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-lg font-bold font-cabinet text-primary">{student.overall_score || 0}</p>
              <p className="text-xs text-text-muted">score</p>
            </div>
            <span className="text-text-muted text-sm">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-sm font-bold text-text-main">{student.academic_progress || 0}%</p>
            <p className="text-xs text-text-muted">Progress</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text-main">{student.sessions || 0}</p>
            <p className="text-xs text-text-muted">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text-main">{student.total_hours || 0}h</p>
            <p className="text-xs text-text-muted">Hours</p>
          </div>
        </div>

        <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${student.academic_progress || 0}%` }}
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-5 bg-surface-2/30 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Skills</p>
              <div className="space-y-2.5">
                {SKILLS.map(k => (
                  <SkillBar key={k} label={k} value={student.skills?.[k] || 0} />
                ))}
              </div>
            </div>

            {/* Modules attended */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Recent Modules ({(student.modules_attended || []).length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(student.modules_attended || []).slice(-5).reverse().map((m, i) => (
                  <div key={i} className="rounded-xl bg-white border border-border p-3">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-medium text-text-main truncate">{m.module}</p>
                      <span className="text-xs font-bold text-primary shrink-0">{m.score}/10</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{m.channel} · {m.date}</p>
                  </div>
                ))}
                {(student.modules_attended || []).length === 0 && (
                  <p className="text-xs text-text-muted">No modules attended yet.</p>
                )}
              </div>

              {/* Assessments */}
              {(student.assessment_scores || []).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Assessments</p>
                  <div className="space-y-1.5">
                    {student.assessment_scores.map((a, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-text-muted truncate">{a.title}</span>
                        <span className="font-bold text-primary ml-2">{a.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strengths/Improvement */}
          {(student.strengths_summary || student.improvement_areas) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.strengths_summary && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3">
                  <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">Strengths</p>
                  <p className="text-xs text-text-main">{Array.isArray(student.strengths_summary) ? student.strengths_summary.join(", ") : student.strengths_summary}</p>
                </div>
              )}
              {student.improvement_areas && (
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-3">
                  <p className="text-xs font-semibold text-warning uppercase tracking-wide mb-1">Areas for Improvement</p>
                  <p className="text-xs text-text-main">{Array.isArray(student.improvement_areas) ? student.improvement_areas.join(", ") : student.improvement_areas}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudents().then(setStudents).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-main font-cabinet">Students</h1>
        <p className="text-text-muted text-sm mt-0.5">{students.length} students enrolled</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search students..."
        className="w-full max-w-sm px-4 py-2 rounded-xl border border-border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(s => <StudentCard key={s.student_id || s.name} student={s} />)}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-text-muted text-sm">No students found.</div>
          )}
        </div>
      )}
    </div>
  );
}
