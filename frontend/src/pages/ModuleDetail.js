import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function ScoreBar({ label, score, max = 10 }) {
  const pct = (score / max) * 100;
  const color = score >= 8 ? "#2E7D32" : score >= 6 ? "#FF6E13" : "#C62828";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-muted w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-sm font-bold text-text-main font-cabinet mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ModuleDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [contentUploading, setContentUploading] = useState(false);
  const [contentMsg, setContentMsg] = useState("");
  const transcriptRef = useRef();
  const contentRef = useRef();

  const load = () => {
    setLoading(true);
    api.getModule(id).then(setMod).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleTranscript = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("Analyzing transcript with AI...");
    try {
      await api.ingestTranscript(id, file);
      setUploadMsg("✓ Transcript analyzed successfully!");
      load();
    } catch (err) {
      setUploadMsg("✗ " + (err?.response?.data?.detail || "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleContent = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setContentUploading(true);
    setContentMsg("Uploading module content...");
    try {
      await api.uploadModuleContent(id, file);
      setContentMsg("✓ Content uploaded!");
      load();
    } catch (err) {
      setContentMsg("✗ " + (err?.response?.data?.detail || "Upload failed"));
    } finally {
      setContentUploading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!mod) return <div className="text-text-muted">Module not found.</div>;

  const analysis = mod.analysis;
  const assessment = mod.assessment;
  const roleplay = mod.roleplay;

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      {/* Back */}
      <Link to="/modules" className="text-sm text-text-muted hover:text-primary transition flex items-center gap-1">
        ← Back to Modules
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-mono text-primary font-bold mb-1">{mod.id}</p>
            <h1 className="text-xl font-bold text-text-main font-cabinet">{mod.module}</h1>
            <p className="text-sm text-text-muted mt-1">{mod.channel} · {mod.date} {mod.start_time} · {mod.instructor}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${mod.status === "Presented" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
              {mod.status}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">{mod.format}</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-2 text-text-muted">{mod.length_hrs}h</span>
          </div>
        </div>

        {/* Upload actions */}
        <div className="mt-5 flex flex-wrap gap-3">
          <input ref={contentRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleContent} />
          <button
            onClick={() => contentRef.current?.click()}
            disabled={contentUploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-border bg-surface-2 text-text-main hover:bg-border transition disabled:opacity-60"
          >
            {contentUploading ? "Uploading..." : mod.has_content ? "✓ Content Uploaded" : "Upload Module Content"}
          </button>

          <input ref={transcriptRef} type="file" accept=".docx,.txt" className="hidden" onChange={handleTranscript} />
          <button
            onClick={() => transcriptRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover transition disabled:opacity-60"
          >
            {uploading ? "Analyzing..." : analysis ? "Re-analyze Transcript" : "Upload & Analyze Transcript"}
          </button>
        </div>
        {contentMsg && <p className="text-xs mt-2 text-text-muted">{contentMsg}</p>}
        {uploadMsg && <p className="text-xs mt-1 text-text-muted">{uploadMsg}</p>}
      </div>

      {/* Analysis */}
      {analysis && (
        <>
          {/* Overview scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Overall Score", value: analysis.overall_score, color: "#FF6E13" },
              { label: "Content Match", value: analysis.content_match_score, color: "#2E7D32" },
              { label: "Avg Satisfaction", value: analysis.avg_satisfaction, color: "#1565C0" },
              { label: "Participants", value: (analysis.participants || []).length, color: "#B34700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-border p-5">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold font-cabinet mt-1" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <Section title="Session Summary">
            <p className="text-sm text-text-main leading-relaxed mb-3">{analysis.learning_objective}</p>
            {analysis.content_match_summary && (
              <p className="text-sm text-text-muted leading-relaxed">{analysis.content_match_summary}</p>
            )}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-success uppercase tracking-wide mb-2">Topics Covered</p>
                <ul className="space-y-1">
                  {(analysis.topics_covered || []).map((t, i) => (
                    <li key={i} className="text-xs text-text-main flex items-start gap-1.5">
                      <span className="text-success mt-0.5">✓</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-danger uppercase tracking-wide mb-2">Topics Missed</p>
                <ul className="space-y-1">
                  {(analysis.topics_missed || []).length === 0 && <li className="text-xs text-text-muted">None</li>}
                  {(analysis.topics_missed || []).map((t, i) => (
                    <li key={i} className="text-xs text-text-main flex items-start gap-1.5">
                      <span className="text-danger mt-0.5">✗</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Terminology drifts */}
          {(analysis.terminology_drifts || []).length > 0 && (
            <Section title="Terminology Corrections">
              <div className="space-y-3">
                {analysis.terminology_drifts.map((d, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${d.severity === "CRITICAL" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.severity === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{d.severity}</span>
                      <span className="text-xs font-semibold text-text-muted">{d.id}</span>
                    </div>
                    <p className="text-sm text-text-main">{d.issue}</p>
                    <p className="text-xs text-text-muted mt-1">→ {d.recommendation}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Tips + Follow-ups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(analysis.tips_shared || []).length > 0 && (
              <Section title="Tips Shared">
                <ul className="space-y-1.5">
                  {analysis.tips_shared.map((t, i) => (
                    <li key={i} className="text-sm text-text-main flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {(analysis.follow_up_items || []).length > 0 && (
              <Section title="Follow-up Items">
                <ul className="space-y-1.5">
                  {analysis.follow_up_items.map((t, i) => (
                    <li key={i} className="text-sm text-text-main flex items-start gap-2">
                      <span className="text-warning mt-0.5">→</span>{t}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          {/* Q&A Log */}
          {(analysis.qa_log || []).length > 0 && (
            <Section title={`Q&A Log (${analysis.qa_log.length} entries)`}>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {analysis.qa_log.map((qa, i) => (
                  <div key={i} className="rounded-xl bg-surface-2 p-3">
                    <p className="text-xs font-semibold text-primary mb-0.5">{qa.student}</p>
                    <p className="text-sm font-medium text-text-main">{qa.question}</p>
                    <p className="text-xs text-text-muted mt-1">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Student Performance */}
          {(analysis.student_performance || []).length > 0 && (
            <Section title="Student Performance">
              <div className="space-y-5">
                {analysis.student_performance.map((sp, i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-text-main text-sm">{sp.name}</p>
                        <p className="text-xs text-text-muted">{sp.interactions} interactions</p>
                      </div>
                      <span className="text-2xl font-bold font-cabinet text-primary">{sp.score}</span>
                    </div>
                    {sp.skills && (
                      <div className="space-y-2">
                        {Object.entries(sp.skills).map(([k, v]) => (
                          <ScoreBar key={k} label={k.replace(/_/g, " ")} score={v} />
                        ))}
                      </div>
                    )}
                    {sp.strengths && <p className="text-xs text-success mt-3">✓ {sp.strengths}</p>}
                    {sp.areas_for_improvement && <p className="text-xs text-warning mt-1">→ {sp.areas_for_improvement}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {!analysis && (
        <div className="bg-surface-2 rounded-2xl border border-border p-10 text-center">
          <p className="text-text-muted text-sm">No transcript analysis yet. Upload a transcript to see AI-powered insights.</p>
        </div>
      )}
    </div>
  );
}
