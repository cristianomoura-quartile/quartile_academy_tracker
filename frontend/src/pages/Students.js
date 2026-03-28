import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MagnifyingGlass, GraduationCap, ChartLineUp, ArrowRight } from "@phosphor-icons/react";
import StudentDetailModal from "@/components/StudentDetailModal";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const params = search ? { search } : {};
    api.getStudents(params).then(d => { setStudents(d); setLoading(false); }).catch(() => setLoading(false));
  }, [search]);

  const avgProgress = students.length > 0 ? Math.round(students.reduce((s, st) => s + (st.academic_progress || 0), 0) / students.length) : 0;
  const totalSessions = students.reduce((s, st) => s + (st.sessions || 0), 0);

  return (
    <div className="p-8 max-w-[1400px]" data-testid="students-page">
      <div className="mb-6 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6E13] mb-1">Cohort</p>
        <h1 className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Students</h1>
        <p className="text-[#7A6F69] mt-1">Tracking progress across the Q2 cohort. Click any student to view detailed KPIs.</p>
      </div>

      {/* Summary + Search */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="bg-white border border-[#EBE5DB] rounded-xl px-5 py-3 flex items-center gap-3">
          <GraduationCap size={22} weight="duotone" className="text-[#FF6E13]" />
          <div>
            <p className="text-2xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>{students.length}</p>
            <p className="text-xs text-[#7A6F69]">Active Students</p>
          </div>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl px-5 py-3 flex items-center gap-3">
          <ChartLineUp size={22} weight="duotone" className="text-[#2E7D32]" />
          <div>
            <p className="text-2xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>{avgProgress}%</p>
            <p className="text-xs text-[#7A6F69]">Avg. Progress</p>
          </div>
        </div>
        <div className="flex-1 max-w-sm flex items-center gap-2 bg-white border border-[#EBE5DB] rounded-xl px-4 py-2.5">
          <MagnifyingGlass size={18} className="text-[#7A6F69]" />
          <input
            data-testid="student-search"
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#2D241E] placeholder-[#7A6F69] outline-none w-full"
          />
        </div>
      </div>

      {/* Student Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {students.map((s, i) => (
            <div
              key={i}
              data-testid={`student-card-${i}`}
              onClick={() => setSelectedStudent(s.student_id)}
              className="bg-white border border-[#EBE5DB] rounded-xl p-6 hover:shadow-md hover:border-[#FF6E13]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#FFF0E6] flex items-center justify-center text-[#FF6E13] font-bold text-xl shrink-0" style={{ fontFamily: 'Cabinet Grotesk' }}>
                  {s.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[#7A6F69]">ID: {s.student_id}</p>
                  <h3 className="text-base font-bold text-[#2D241E] mt-0.5" style={{ fontFamily: 'Cabinet Grotesk' }}>{s.name}</h3>
                  <p className="text-xs text-[#7A6F69]">{s.role}</p>
                  <p className="text-xs font-medium text-[#FF6E13] mt-0.5">{s.country}</p>
                </div>
                <ArrowRight size={16} className="text-[#7A6F69] opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
              </div>

              <div className="space-y-3">
                {/* Academic Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Attendance</span>
                    <span className="text-sm font-bold text-[#2D241E]">{s.academic_progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#FFECE0] rounded-full">
                    <div className="h-full bg-[#FF6E13] rounded-full transition-all" style={{ width: `${s.academic_progress || 0}%` }} />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EBE5DB]">
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#2D241E]">{s.sessions || 0}</p>
                    <p className="text-[9px] text-[#7A6F69] uppercase font-semibold">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#2D241E]">{(s.total_hours || 0).toFixed(1)}h</p>
                    <p className="text-[9px] text-[#7A6F69] uppercase font-semibold">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#FF6E13]">{s.overall_score || 0}/10</p>
                    <p className="text-[9px] text-[#7A6F69] uppercase font-semibold">Score</p>
                  </div>
                </div>

                {/* Skill mini-bars (top 3 if available) */}
                {s.skills && Object.values(s.skills).some(v => v > 0) && (
                  <div className="pt-2 border-t border-[#EBE5DB] space-y-1.5">
                    {Object.entries(s.skills)
                      .filter(([_, v]) => v > 0)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[9px] text-[#7A6F69] uppercase w-20 truncate">{key.replace(/_/g, ' ')}</span>
                          <div className="flex-1 h-1.5 bg-[#F5F2EB] rounded-full">
                            <div className="h-full bg-[#FF6E13] rounded-full" style={{ width: `${val * 10}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-[#2D241E]">{val}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          studentId={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
