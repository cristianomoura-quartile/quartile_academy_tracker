import React, { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  X, Upload, User, CalendarBlank, Clock, PlayCircle, File, CheckCircle,
  Warning, Lightning, Star, ChatCircle, Target, ArrowsClockwise, ArrowRight,
  FileDoc, BookOpen, ListChecks, ArrowSquareOut, Exam, Microphone
} from "@phosphor-icons/react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from "recharts";
import StudentDetailModal from "@/components/StudentDetailModal";

function getTabsForRole(role, moduleFormat, moduleName) {
  const isAssessment = (moduleFormat || "").toLowerCase() === "assessment";
  const isRolePlay = /role\s*play|qbr/i.test(moduleName || "");

  if (role === "student") {
    const tabs = ["Overview", "Module Content", "Q&A Log", "Materials"];
    if (isAssessment) tabs.splice(2, 0, "Assessment Score");
    if (isRolePlay) tabs.splice(2, 0, "Role Play Review");
    return tabs;
  }
  // admin and instructor see all
  const tabs = ["Overview", "Module Content", "Content Analysis", "Students", "Q&A Log", "Materials"];
  if (isAssessment) tabs.splice(4, 0, "Assessment Score");
  if (isRolePlay) tabs.splice(4, 0, "Role Play Review");
  return tabs;
}

export default function ModuleDetailModal({ moduleId, onClose, onIngested }) {
  const { user, canEdit } = useAuth();
  const [module, setModule] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState(null);
  const [studentModalId, setStudentModalId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.getModule(moduleId).then(d => { setModule(d); setLoading(false); }).catch(() => setLoading(false));
  }, [moduleId]);

  const handleIngest = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIngesting(true);
    setIngestError(null);
    try {
      const result = await api.ingestTranscript(moduleId, file);
      setModule(prev => ({ ...prev, analyzed: true, analysis: result.analysis }));
      if (onIngested) onIngested();
    } catch (err) {
      setIngestError(err.response?.data?.detail || "Failed to ingest transcript");
    } finally {
      setIngesting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="w-12 h-12 border-3 border-[#FF6E13] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!module) return null;
  const a = module.analysis;
  const tabs = getTabsForRole(user?.role, module.format, module.module);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose} data-testid="module-detail-modal">
      <div className="bg-[#FDFBF7] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-white border-b border-[#EBE5DB] px-6 py-5 flex items-start justify-between shrink-0">
          <div>
            <p className="text-xs font-bold text-[#FF6E13] tracking-wider">{module.id}</p>
            <h2 className="text-xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>{module.module}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {module.format && <span className="px-2 py-0.5 bg-[#FFF0E6] text-[#B34700] text-[10px] font-bold rounded-full">{module.format}</span>}
              <span className="px-2 py-0.5 bg-[#F5F2EB] text-[#7A6F69] text-[10px] font-bold rounded-full">{module.week}</span>
              <span className="px-2 py-0.5 bg-[#F5F2EB] text-[#7A6F69] text-[10px] font-bold rounded-full">{module.channel}</span>
              {module.analyzed && <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle size={12} weight="bold" /> Analyzed</span>}
            </div>
          </div>
          <button onClick={onClose} data-testid="modal-close" className="p-2 hover:bg-[#F5F2EB] rounded-lg transition-colors"><X size={20} className="text-[#7A6F69]" /></button>
        </div>
        <div className="border-b border-[#EBE5DB] px-6 flex gap-4 bg-white shrink-0 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab} data-testid={`tab-${tab.toLowerCase().replace(/\s/g, '-')}`} onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? "border-[#FF6E13] text-[#FF6E13]" : "border-transparent text-[#7A6F69] hover:text-[#2D241E]"}`}>{tab}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "Overview" && <OverviewTab module={module} analysis={a} />}
          {activeTab === "Module Content" && <ModuleContentTab moduleId={moduleId} module={module} canEdit={canEdit} onContentUploaded={() => api.getModule(moduleId).then(d => setModule(d))} />}
          {activeTab === "Content Analysis" && <ContentAnalysisTab analysis={a} hasContent={module?.has_content} ingesting={ingesting} ingestError={ingestError} onUploadClick={() => fileRef.current?.click()} />}
          {activeTab === "Students" && <StudentsTab analysis={a} onStudentClick={setStudentModalId} />}
          {activeTab === "Q&A Log" && <QALogTab analysis={a} />}
          {activeTab === "Materials" && <MaterialsTab module={module} />}
          {activeTab === "Assessment Score" && <AssessmentScoreTab moduleId={moduleId} module={module} canEdit={canEdit} />}
          {activeTab === "Role Play Review" && <RolePlayReviewTab moduleId={moduleId} module={module} canEdit={canEdit} />}
        </div>
        <div className="border-t border-[#EBE5DB] px-6 py-3 flex items-center justify-between bg-white shrink-0">
          <p className="text-[10px] text-[#7A6F69]">{a?.ingested_at ? `Analyzed: ${new Date(a.ingested_at).toLocaleString()}` : "Not yet analyzed"}</p>
          {canEdit && (
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleIngest} data-testid="transcript-file-input" />
              <button data-testid="ingest-transcript-btn" onClick={() => fileRef.current?.click()} disabled={ingesting}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6E13] text-white text-xs font-semibold rounded-full hover:bg-[#E65C0A] transition-all disabled:opacity-50">
                {ingesting ? <><ArrowsClockwise size={14} className="animate-spin" /> Analyzing...</> : <><Upload size={14} /> Ingest Transcript</>}
              </button>
            </div>
          )}
        </div>
        {ingestError && <div className="px-6 py-2 bg-red-50 text-red-700 text-xs border-t border-red-100">{ingestError}</div>}
      </div>
      {studentModalId && <StudentDetailModal studentId={studentModalId} onClose={() => setStudentModalId(null)} />}
    </div>
  );
}

function OverviewTab({ module, analysis }) {
  const a = analysis;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        {/* Module Details */}
        <div className="space-y-3">
          <DetailRow icon={User} label="Instructor" value={module.instructor} sub={module.channel} />
          <DetailRow icon={CalendarBlank} label="Session Date" value={module.date} sub={module.day} />
          <DetailRow icon={Clock} label="Duration" value={a?.actual_duration || `${module.length_hrs}h scheduled`} sub={`${module.length_hrs}h scheduled`} />
          <DetailRow icon={PlayCircle} label="Format" value={module.format} sub={module.shift} />
        </div>

        {/* Learning Objective */}
        {a?.learning_objective && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-2">Learning Objective</p>
            <p className="text-sm text-[#2D241E] leading-relaxed">{a.learning_objective}</p>
          </div>
        )}

        {/* Follow-up Items */}
        {a?.follow_up_items?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-3">Follow-up Items</p>
            <ul className="space-y-2">
              {a.follow_up_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#2D241E]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6E13] mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!a && (
          <div className="bg-[#FFF0E6] border border-[#FFD4B2] rounded-xl p-5 text-center">
            <Upload size={32} className="text-[#FF6E13] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#2D241E]">No analysis yet</p>
            <p className="text-xs text-[#7A6F69] mt-1">Upload a transcript to generate insights for this module.</p>
          </div>
        )}
      </div>

      {/* Right Column - Scores */}
      <div className="space-y-5">
        {a ? (
          <>
            <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-[#FFF0E6] flex items-center justify-center">
                <Star size={28} weight="duotone" className="text-[#FF6E13]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Overall Score</p>
                <p className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>
                  {a.overall_score}/10
                </p>
              </div>
            </div>
            <div className="bg-[#2D241E] border border-[#EBE5DB] rounded-xl p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                <Target size={28} weight="duotone" className="text-[#FF6E13]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Avg. Satisfaction</p>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>
                  {a.avg_satisfaction}/5.0
                </p>
              </div>
            </div>

            {/* Session Sections */}
            {a.session_sections?.length > 0 && (
              <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
                <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-3">Session Sections</p>
                <div className="space-y-2">
                  {a.session_sections.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F5F2EB] transition-colors">
                      <span className="text-[10px] font-mono text-[#7A6F69] mt-0.5 shrink-0">{s.start_time}</span>
                      <div>
                        <p className="text-sm font-medium text-[#2D241E]">{s.title}</p>
                        <p className="text-xs text-[#7A6F69] mt-0.5">{s.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-8 text-center">
            <ChartBarIcon />
            <p className="text-sm text-[#7A6F69] mt-2">Scores will appear after transcript analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartBarIcon() {
  return (
    <div className="w-16 h-16 rounded-xl bg-[#F5F2EB] mx-auto flex items-center justify-center">
      <Star size={28} className="text-[#7A6F69]" />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#F5F2EB] flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#7A6F69]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#2D241E]">{value}</p>
        <p className="text-xs text-[#7A6F69]">{label}{sub ? ` \u00B7 ${sub}` : ''}</p>
      </div>
    </div>
  );
}

/* ─── MODULE CONTENT TAB ───────────────────────────────────────────────── */

function ModuleContentTab({ moduleId, module, onContentUploaded }) {
  const [content, setContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState(null);
  const contentFileRef = React.useRef(null);

  React.useEffect(() => {
    setLoading(true);
    api.getModuleContent(moduleId)
      .then(d => { setContent(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [moduleId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await api.uploadModuleContent(moduleId, file);
      // Re-fetch content
      const newContent = await api.getModuleContent(moduleId);
      setContent(newContent);
      if (onContentUploaded) onContentUploaded();
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Failed to upload module content");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="module-content-empty">
        <div className="w-20 h-20 rounded-2xl bg-[#FFF0E6] flex items-center justify-center mb-4">
          <FileDoc size={36} weight="duotone" className="text-[#FF6E13]" />
        </div>
        <h3 className="text-lg font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Upload Module Content</h3>
        <p className="text-sm text-[#7A6F69] mt-1 max-w-md text-center">Upload the module content document (.docx or .txt) to establish the source of truth. Content Analysis will then score transcripts against this reference.</p>
        <input ref={contentFileRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleUpload} data-testid="content-file-input" />
        <button
          onClick={() => contentFileRef.current?.click()}
          disabled={uploading}
          data-testid="upload-content-btn"
          className="mt-4 px-6 py-2.5 bg-[#FF6E13] text-white text-sm font-semibold rounded-full hover:bg-[#E65C0A] transition-all disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Content Document"}
        </button>
        {uploadError && <p className="text-xs text-[#C62828] mt-2">{uploadError}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="module-content-tab">
      {/* Header info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center">
            <CheckCircle size={22} weight="duotone" className="text-[#2E7D32]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2D241E]">{content.filename}</p>
            <p className="text-xs text-[#7A6F69]">Uploaded {new Date(content.uploaded_at).toLocaleDateString()} &middot; {content.sections?.length || 0} sections</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input ref={contentFileRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleUpload} data-testid="content-file-input" />
          <button
            onClick={() => contentFileRef.current?.click()}
            disabled={uploading}
            data-testid="replace-content-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FF6E13] bg-[#FFF0E6] rounded-full hover:bg-[#FFE0CC] transition-all disabled:opacity-50"
          >
            <Upload size={12} /> {uploading ? "Uploading..." : "Replace"}
          </button>
        </div>
      </div>
      {uploadError && <p className="text-xs text-[#C62828]">{uploadError}</p>}

      {/* Learning Objectives */}
      {content.learning_objectives?.length > 0 && (
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={16} weight="duotone" className="text-[#FF6E13]" />
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider">Learning Objectives</p>
          </div>
          <ul className="space-y-2">
            {content.learning_objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#2D241E]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6E13] mt-2 shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topics */}
      {content.topics?.length > 0 && (
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} weight="duotone" className="text-[#FF6E13]" />
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider">Required Topics</p>
          </div>
          <div className="flex flex-wrap gap-2" data-testid="content-topics">
            {content.topics.map((t, i) => (
              <span key={i} className="px-3 py-1.5 bg-[#F5F2EB] text-[#2D241E] text-xs font-medium rounded-lg border border-[#EBE5DB]">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-[#7A6F69] uppercase tracking-wider">Content Sections</p>
        {content.sections?.map((sec, i) => (
          <div key={i} className="bg-white border border-[#EBE5DB] rounded-xl p-5" data-testid={`content-section-${i}`}>
            <p className="text-sm font-semibold text-[#2D241E] mb-2">{sec.title}</p>
            <p className="text-xs text-[#7A6F69] leading-relaxed whitespace-pre-wrap line-clamp-6">{sec.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CONTENT ANALYSIS TAB ─────────────────────────────────────────────── */

function ContentAnalysisTab({ analysis, hasContent, ingesting, ingestError, onUploadClick }) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-[#FFF0E6] flex items-center justify-center mb-4">
          <Upload size={36} weight="duotone" className="text-[#FF6E13]" />
        </div>
        <h3 className="text-lg font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Ingest a Transcript</h3>
        <p className="text-sm text-[#7A6F69] mt-1 max-w-sm text-center">Upload a transcript (.docx or .txt) to generate AI-powered content analysis, topic coverage, and terminology reviews.</p>
        <button
          onClick={onUploadClick}
          disabled={ingesting}
          data-testid="upload-transcript-cta"
          className="mt-4 px-6 py-2.5 bg-[#FF6E13] text-white text-sm font-semibold rounded-full hover:bg-[#E65C0A] transition-all disabled:opacity-50"
        >
          {ingesting ? "Analyzing..." : "Upload Transcript"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Content Match Score */}
      <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider">Content Match Score</p>
          {analysis.content_matched ? (
            <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-[9px] font-bold rounded-full flex items-center gap-1" data-testid="content-matched-badge">
              <CheckCircle size={10} weight="bold" /> vs Module Content
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#FFF0E6] text-[#B34700] text-[9px] font-bold rounded-full" data-testid="content-unmatched-badge">
              General Analysis
            </span>
          )}
        </div>
        <p className="text-4xl font-bold text-[#2D241E] mb-2" style={{ fontFamily: 'Cabinet Grotesk' }} data-testid="content-match-score">
          {analysis.content_match_score}/10
        </p>
        <div className="w-full h-1.5 bg-[#EBE5DB] rounded-full mb-3">
          <div className="h-full bg-[#FF6E13] rounded-full" style={{ width: `${analysis.content_match_score * 10}%` }} />
        </div>
        <p className="text-xs text-[#7A6F69] leading-relaxed">{analysis.content_match_summary}</p>
        {!analysis.content_matched && hasContent && (
          <p className="text-[10px] text-[#B34700] mt-2 bg-[#FFF0E6] rounded-lg px-2 py-1">Re-ingest the transcript to match against uploaded module content.</p>
        )}
      </div>

      {/* Topics */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-3">Topics Covered</p>
          <div className="flex flex-wrap gap-2" data-testid="topics-covered">
            {analysis.topics_covered?.map((t, i) => (
              <span key={i} className="px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] text-xs font-medium rounded-lg">{t}</span>
            ))}
          </div>
        </div>
        {analysis.topics_missed?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#C62828] uppercase tracking-wider mb-3">Topics Missed / Undercovered</p>
            <div className="flex flex-wrap gap-2" data-testid="topics-missed">
              {analysis.topics_missed.map((t, i) => (
                <span key={i} className="px-3 py-1.5 bg-red-50 text-[#C62828] text-xs font-medium rounded-lg">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Terminology Drifts */}
        {analysis.terminology_drifts?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#B34700] uppercase tracking-wider mb-3">Terminology Drifts</p>
            <div className="space-y-3" data-testid="terminology-drifts">
              {analysis.terminology_drifts.map((d, i) => (
                <div key={i} className="p-3 bg-[#FFF0E6] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#2D241E]">{d.id}</span>
                    {d.severity === "CRITICAL" && (
                      <span className="px-1.5 py-0.5 bg-[#C62828] text-white text-[9px] font-bold rounded-full">CRITICAL</span>
                    )}
                    {d.severity === "MAJOR" && (
                      <span className="px-1.5 py-0.5 bg-[#B34700] text-white text-[9px] font-bold rounded-full">MAJOR</span>
                    )}
                  </div>
                  <p className="text-xs text-[#2D241E] mb-1">{d.issue}</p>
                  <p className="text-xs text-[#7A6F69]"><strong>Rec:</strong> {d.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Shared */}
        {analysis.tips_shared?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-3">Tips Shared During Session</p>
            <div className="space-y-2">
              {analysis.tips_shared.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[#2D241E]">
                  <Lightning size={14} weight="duotone" className="text-[#FF6E13] mt-0.5 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsTab({ analysis, onStudentClick }) {
  const [allStudents, setAllStudents] = React.useState([]);
  React.useEffect(() => {
    api.getStudents().then(setAllStudents).catch(() => {});
  }, []);

  if (!analysis?.student_performance?.length) {
    return <EmptyState text="Student data will appear after transcript analysis." />;
  }

  const students = analysis.student_performance;
  const sorted = [...students].sort((a, b) => b.interactions - a.interactions);
  const most = sorted[0];
  const least = sorted[sorted.length - 1];

  const findStudentId = (name) => {
    const match = allStudents.find(s => s.name?.toLowerCase().includes(name?.split(' ')[0]?.toLowerCase()));
    return match?.student_id;
  };

  return (
    <div className="space-y-6" data-testid="students-tab">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#7A6F69] uppercase tracking-wider">Cohort Avg Score</p>
          <p className="text-3xl font-bold text-[#2D241E] mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>
            {(students.reduce((s, st) => s + st.score, 0) / students.length).toFixed(1)}/10
          </p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider">Most Engaged</p>
          <p className="text-lg font-bold text-[#2D241E] mt-1">{most?.name}</p>
          <p className="text-xs text-[#7A6F69]">{most?.interactions} interactions</p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#C62828] uppercase tracking-wider">Least Engaged</p>
          <p className="text-lg font-bold text-[#2D241E] mt-1">{least?.name}</p>
          <p className="text-xs text-[#7A6F69]">{least?.interactions} interactions</p>
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        {students.map((s, i) => {
          const sid = findStudentId(s.name);
          return (
            <div
              key={i}
              onClick={() => sid && onStudentClick?.(sid)}
              className={`bg-white border border-[#EBE5DB] rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all
                ${sid ? 'cursor-pointer hover:border-[#FF6E13]/30 hover:shadow-sm group' : ''}`}
              data-testid={`student-perf-${i}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#FF6E13] font-bold text-sm shrink-0">
                {s.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#2D241E]">{s.name}</p>
                  {sid && <ArrowRight size={12} className="text-[#7A6F69] opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                <p className="text-xs text-[#7A6F69]">{s.interactions} interactions</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className={`px-3 py-1 rounded-lg text-sm font-bold ${s.score >= 7 ? 'bg-[#E8F5E9] text-[#2E7D32]' : s.score >= 5 ? 'bg-[#FFF0E6] text-[#B34700]' : 'bg-red-50 text-[#C62828]'}`}>
                  {s.score}/10
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#2D241E]"><strong>Strengths:</strong> {s.strengths}</p>
                {s.areas_for_improvement && (
                  <p className="text-xs text-[#7A6F69] mt-0.5"><strong>Improve:</strong> {s.areas_for_improvement}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QALogTab({ analysis }) {
  if (!analysis?.qa_log?.length) {
    return <EmptyState text="Q&A data will appear after transcript analysis." />;
  }
  return (
    <div className="space-y-3" data-testid="qa-log-tab">
      {analysis.qa_log.map((qa, i) => (
        <div key={i} className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ChatCircle size={16} weight="duotone" className="text-[#FF6E13]" />
            <span className="text-xs font-bold text-[#FF6E13]">{qa.student}</span>
            {qa.section && <span className="text-[10px] text-[#7A6F69] bg-[#F5F2EB] px-2 py-0.5 rounded-full">{qa.section}</span>}
          </div>
          <p className="text-sm font-medium text-[#2D241E] mb-1">Q: {qa.question}</p>
          <p className="text-sm text-[#7A6F69]">A: {qa.answer}</p>
        </div>
      ))}
    </div>
  );
}

function MaterialsTab({ module }) {
  return (
    <div className="space-y-4" data-testid="materials-tab">
      <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
          <File size={20} weight="duotone" className="text-[#FF6E13]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D241E]">Session Recording</p>
          <p className="text-xs text-[#7A6F69]">Available after session is presented</p>
        </div>
      </div>
      <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
          <File size={20} weight="duotone" className="text-[#FF6E13]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D241E]">Module Slides</p>
          <p className="text-xs text-[#7A6F69]">{module.module} - Presentation deck</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#F5F2EB] flex items-center justify-center mb-3">
        <Warning size={28} className="text-[#7A6F69]" />
      </div>
      <p className="text-sm text-[#7A6F69]">{text}</p>
    </div>
  );
}

/* ─── ASSESSMENT SCORE TAB ─────────────────────────────────────────────── */

const ASSESSMENT_SKILLS = [
  { key: "knowledge", label: "Knowledge" },
  { key: "data_clarity", label: "Data Clarity" },
  { key: "communication", label: "Communication" },
  { key: "soft_skills", label: "Soft Skills" },
  { key: "critical_thinking", label: "Critical Thinking" },
  { key: "problem_solving", label: "Problem Solving" },
  { key: "technical_accuracy", label: "Technical Accuracy" },
  { key: "time_management", label: "Time Management" },
  { key: "strategic_thinking", label: "Strategic Thinking" },
];

function AssessmentScoreTab({ moduleId, module, canEdit }) {
  const [assessment, setAssessment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    setLoading(true);
    api.getAssessment(moduleId)
      .then(d => { setAssessment(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [moduleId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await api.deliverAssessment(moduleId, file);
      setAssessment(result.assessment);
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Failed to process assessment");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="assessment-empty">
        <div className="w-20 h-20 rounded-2xl bg-[#FFF0E6] flex items-center justify-center mb-4">
          <Exam size={36} weight="duotone" className="text-[#FF6E13]" />
        </div>
        <h3 className="text-lg font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Assessment Score</h3>
        <p className="text-sm text-[#7A6F69] mt-1 max-w-md text-center">Upload the assessment transcript (.docx or .txt) to generate AI-powered grading across knowledge, communication, and analytical dimensions.</p>
        {canEdit && (
          <>
            <input ref={fileRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleUpload} data-testid="assessment-file-input" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="upload-assessment-btn"
              className="mt-4 px-6 py-2.5 bg-[#FF6E13] text-white text-sm font-semibold rounded-full hover:bg-[#E65C0A] transition-all disabled:opacity-50">
              {uploading ? "Analyzing..." : "Upload Assessment"}
            </button>
          </>
        )}
        {uploadError && <p className="text-xs text-[#C62828] mt-2">{uploadError}</p>}
      </div>
    );
  }

  const radarData = ASSESSMENT_SKILLS.filter(s => assessment[s.key]).map(s => ({
    subject: s.label, score: assessment[s.key]?.score || 0, fullMark: 10,
  }));

  return (
    <div className="space-y-6" data-testid="assessment-score-tab">
      {/* Header + Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#FFF0E6] flex items-center justify-center">
            <Exam size={28} weight="duotone" className="text-[#FF6E13]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Overall Score</p>
            <p className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }} data-testid="assessment-overall-score">{assessment.overall_score}/100</p>
          </div>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Student</p>
          <p className="text-lg font-bold text-[#2D241E] mt-1">{assessment.student_name || "—"}</p>
          <p className="text-[10px] text-[#7A6F69]">{assessment.assessed_at ? `Assessed ${new Date(assessment.assessed_at).toLocaleDateString()}` : ""}</p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Module</p>
          <p className="text-sm font-semibold text-[#2D241E] mt-1">{module?.module}</p>
          <p className="text-[10px] text-[#7A6F69]">{module?.channel}</p>
        </div>
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-4">Skill Breakdown</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#EBE5DB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#7A6F69', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#7A6F69', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#FF6E13" fill="#FF6E13" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ASSESSMENT_SKILLS.filter(s => assessment[s.key]).map(s => {
          const data = assessment[s.key];
          const scoreColor = data.score >= 7 ? '#2E7D32' : data.score >= 5 ? '#B34700' : '#C62828';
          return (
            <div key={s.key} className="bg-white border border-[#EBE5DB] rounded-xl p-4" data-testid={`assessment-skill-${s.key}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#2D241E]">{s.label}</p>
                <span className="text-sm font-bold" style={{ color: scoreColor }}>{data.score}/10</span>
              </div>
              <div className="w-full h-1.5 bg-[#EBE5DB] rounded-full mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${data.score * 10}%`, backgroundColor: scoreColor }} />
              </div>
              <p className="text-[11px] text-[#7A6F69] leading-relaxed line-clamp-3">{data.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessment.strengths?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-3">Strengths</p>
            <ul className="space-y-2">
              {assessment.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#2D241E]">
                  <CheckCircle size={14} weight="bold" className="text-[#2E7D32] mt-0.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {assessment.areas_for_improvement?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#B34700] uppercase tracking-wider mb-3">Areas for Improvement</p>
            <ul className="space-y-2">
              {assessment.areas_for_improvement.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#2D241E]">
                  <Warning size={14} weight="bold" className="text-[#B34700] mt-0.5 shrink-0" /> {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Overall Feedback */}
      {assessment.overall_feedback && (
        <div className="bg-[#2D241E] rounded-xl p-5">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-2">Overall Feedback</p>
          <p className="text-sm text-white/90 leading-relaxed">{assessment.overall_feedback}</p>
        </div>
      )}

      {/* Re-upload */}
      {canEdit && (
        <div className="flex justify-end">
          <input ref={fileRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleUpload} data-testid="assessment-reupload-input" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FF6E13] bg-[#FFF0E6] rounded-full hover:bg-[#FFE0CC] transition-all disabled:opacity-50" data-testid="reassess-btn">
            <ArrowsClockwise size={14} /> {uploading ? "Re-analyzing..." : "Re-assess"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── ROLE PLAY REVIEW TAB ─────────────────────────────────────────────── */

const ROLEPLAY_SKILLS = [
  { key: "channel_knowledge", label: "Channel Knowledge" },
  { key: "data_clarity", label: "Data Clarity" },
  { key: "storytelling", label: "Storytelling" },
  { key: "analytical_thinking", label: "Analytical Thinking" },
  { key: "communication", label: "Communication" },
  { key: "soft_skills", label: "Soft Skills" },
  { key: "presentation_design", label: "Presentation Design" },
  { key: "optimization_opportunities", label: "Optimization" },
  { key: "upsell_opportunities", label: "Upsell Opportunities" },
  { key: "negotiation", label: "Negotiation" },
  { key: "objection_handling", label: "Objection Handling" },
  { key: "asking_questions", label: "Asking Questions" },
  { key: "presentation_pacing", label: "Pacing" },
  { key: "presentation_time", label: "Time Management" },
];

function RolePlayReviewTab({ moduleId, module, canEdit }) {
  const [review, setReview] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    setLoading(true);
    api.getRolePlayReview(moduleId)
      .then(d => { setReview(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [moduleId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await api.reviewRolePlay(moduleId, file);
      setReview(result.review);
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Failed to process role play review");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#FF6E13] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="roleplay-empty">
        <div className="w-20 h-20 rounded-2xl bg-[#FFF0E6] flex items-center justify-center mb-4">
          <Microphone size={36} weight="duotone" className="text-[#FF6E13]" />
        </div>
        <h3 className="text-lg font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }}>Role Play Review</h3>
        <p className="text-sm text-[#7A6F69] mt-1 max-w-md text-center">Upload the role play transcript or presentation (.docx or .txt) to generate AI-powered scoring across negotiation, storytelling, and performance dimensions.</p>
        {canEdit && (
          <>
            <input ref={fileRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleUpload} data-testid="roleplay-file-input" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="upload-roleplay-btn"
              className="mt-4 px-6 py-2.5 bg-[#FF6E13] text-white text-sm font-semibold rounded-full hover:bg-[#E65C0A] transition-all disabled:opacity-50">
              {uploading ? "Analyzing..." : "Upload Role Play"}
            </button>
          </>
        )}
        {uploadError && <p className="text-xs text-[#C62828] mt-2">{uploadError}</p>}
      </div>
    );
  }

  const radarData = ROLEPLAY_SKILLS.filter(s => review[s.key]).map(s => ({
    subject: s.label, score: review[s.key]?.score || 0, fullMark: 10,
  }));

  return (
    <div className="space-y-6" data-testid="roleplay-review-tab">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#FFF0E6] flex items-center justify-center">
            <Microphone size={28} weight="duotone" className="text-[#FF6E13]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Overall Score</p>
            <p className="text-3xl font-bold text-[#2D241E]" style={{ fontFamily: 'Cabinet Grotesk' }} data-testid="roleplay-overall-score">{review.overall_score}/100</p>
          </div>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Student</p>
          <p className="text-lg font-bold text-[#2D241E] mt-1">{review.student_name || "—"}</p>
          <p className="text-[10px] text-[#7A6F69]">{review.reviewed_at ? `Reviewed ${new Date(review.reviewed_at).toLocaleDateString()}` : ""}</p>
        </div>
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-semibold text-[#7A6F69] uppercase tracking-wider">Channel</p>
          <p className="text-lg font-bold text-[#2D241E] mt-1">{review.channel || module?.channel}</p>
          <p className="text-[10px] text-[#7A6F69]">{module?.module}</p>
        </div>
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-4">Performance Dimensions</p>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#EBE5DB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#7A6F69', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#7A6F69', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#FF6E13" fill="#FF6E13" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Scores - 2 column grid for 14 skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROLEPLAY_SKILLS.filter(s => review[s.key]).map(s => {
          const data = review[s.key];
          const scoreColor = data.score >= 7 ? '#2E7D32' : data.score >= 5 ? '#B34700' : '#C62828';
          return (
            <div key={s.key} className="bg-white border border-[#EBE5DB] rounded-xl p-4" data-testid={`roleplay-skill-${s.key}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#2D241E]">{s.label}</p>
                <span className="text-sm font-bold" style={{ color: scoreColor }}>{data.score}/10</span>
              </div>
              <div className="w-full h-1.5 bg-[#EBE5DB] rounded-full mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${data.score * 10}%`, backgroundColor: scoreColor }} />
              </div>
              <p className="text-[11px] text-[#7A6F69] leading-relaxed line-clamp-2">{data.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {review.strengths?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-3">Strengths</p>
            <ul className="space-y-2">
              {review.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#2D241E]">
                  <CheckCircle size={14} weight="bold" className="text-[#2E7D32] mt-0.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {review.areas_for_improvement?.length > 0 && (
          <div className="bg-white border border-[#EBE5DB] rounded-xl p-5">
            <p className="text-xs font-bold text-[#B34700] uppercase tracking-wider mb-3">Areas for Improvement</p>
            <ul className="space-y-2">
              {review.areas_for_improvement.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#2D241E]">
                  <Warning size={14} weight="bold" className="text-[#B34700] mt-0.5 shrink-0" /> {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Overall Feedback */}
      {review.overall_feedback && (
        <div className="bg-[#2D241E] rounded-xl p-5">
          <p className="text-xs font-bold text-[#FF6E13] uppercase tracking-wider mb-2">Overall Feedback</p>
          <p className="text-sm text-white/90 leading-relaxed">{review.overall_feedback}</p>
        </div>
      )}

      {/* Re-upload */}
      {canEdit && (
        <div className="flex justify-end">
          <input ref={fileRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleUpload} data-testid="roleplay-reupload-input" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FF6E13] bg-[#FFF0E6] rounded-full hover:bg-[#FFE0CC] transition-all disabled:opacity-50" data-testid="re-review-btn">
            <ArrowsClockwise size={14} /> {uploading ? "Re-analyzing..." : "Re-review"}
          </button>
        </div>
      )}
    </div>
  );
}
