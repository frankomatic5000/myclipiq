"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
]);

interface AnalysisItem {
  id: string;
  status: string;
  engagementScore: number | null;
  clipSuggestions: { start: number; end: number; platform: string; hook_text: string }[] | null;
  results?: { summary?: string; sentiment?: string; pacing?: string; key_moments?: string[] } | null;
  filename?: string;
  createdAt: string;
}

export default function AIAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "analyzing" | "polling" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisItem | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRecent = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from("ai_analyses")
      .select("id, status, engagement_score, clip_suggestions, created_at, video_uploads(filename)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error || !data) return;
    const mapped: AnalysisItem[] = data.map((d: any) => ({
      id: d.id,
      status: d.status,
      engagementScore: d.engagement_score,
      clipSuggestions: d.clip_suggestions,
      filename: d.video_uploads?.filename || "Unknown",
      createdAt: d.created_at,
    }));
    setRecentAnalyses(mapped);
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.has(f.type)) return "Unsupported file type. Use MP4, MOV, WEBM, or AVI.";
    if (f.size > MAX_FILE_SIZE) return "File exceeds 2GB limit.";
    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validateFile(f);
    if (err) {
      setError(err);
      setPhase("error");
      return;
    }
    setFile(f);
    setError(null);
    setPhase("idle");
    setAnalysisResult(null);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    []
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setError(null);
    setPhase("uploading");
    setUploadProgress(0);

    try {
      // 1. Presign
      const presignRes = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presignRes.ok) {
        const body = await presignRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to get upload URL");
      }
      const { url, key, uploadId } = await presignRes.json();

      // 2. Upload to R2
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`R2 upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("R2 upload network error")));
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. Start analysis
      setPhase("analyzing");
      const analyzeRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, r2Key: key, filename: file.name }),
      });
      if (!analyzeRes.ok) {
        const body = await analyzeRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to start analysis");
      }
      const { analysisId, status } = await analyzeRes.json();

      // 4. Poll
      setPhase("polling");
      pollTimerRef.current = setInterval(async () => {
        const pollRes = await fetch(`/api/ai/analyses/${analysisId}`);
        if (!pollRes.ok) return;
        const pollData = await pollRes.json();
        if (pollData.status === "completed") {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setAnalysisResult(pollData);
          setPhase("done");
          fetchRecent();
        } else if (pollData.status === "failed") {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          throw new Error("Analysis failed on server");
        }
      }, 3000);
    } catch (err: any) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setError(err?.message || "Something went wrong");
      setPhase("error");
    }
  };

  const reset = () => {
    setFile(null);
    setPhase("idle");
    setError(null);
    setUploadProgress(0);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "green";
    if (score >= 40) return "amber";
    return "red";
  };

  const scoreLabel = (score: number) => {
    if (score >= 70) return "High Potential";
    if (score >= 40) return "Medium";
    return "Low Engagement";
  };

  return (
    <>
      <Header
        title="AI Content Analysis"
        subtitle="Upload videos for AI-powered engagement predictions"
        actions={
          <div className="flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
            <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">Admin</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Editor</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Viewer</button>
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Video</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
              className="hidden"
              onChange={onFileInputChange}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={[
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition min-h-[200px] flex flex-col items-center justify-center",
                isDragging
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-surface-700 hover:border-brand-500 hover:bg-brand-500/5",
                phase === "error" ? "border-red-500 bg-red-500/5" : "",
              ].join(" ")}
            >
              {phase === "uploading" || phase === "analyzing" || phase === "polling" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin" />
                  <p className="font-medium">
                    {phase === "uploading" && `Uploading… ${uploadProgress}%`}
                    {phase === "analyzing" && "Starting analysis…"}
                    {phase === "polling" && "Analyzing video…"}
                  </p>
                  {phase === "uploading" && (
                    <div className="w-48 h-2 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-medium mb-2">
                    {file ? file.name : "Drag and drop your video here"}
                  </p>
                  <p className="text-sm text-surface-300">or click to browse</p>
                  <p className="text-xs text-surface-300 mt-2">MP4, MOV, AVI • Max 2GB</p>
                </>
              )}
            </div>
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analysis Options</h3>
            <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <select className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-100">
                  <option>Short-form Social (15-60s)</option>
                  <option>Long-form Content (5-20min)</option>
                  <option>Podcast / Interview</option>
                  <option>Educational / Tutorial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn"].map((p, i) => (
                    <label key={p} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 cursor-pointer hover:border-brand-500/50 transition">
                      <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded bg-surface-700 border-surface-600 accent-brand-500" />
                      <span className="text-sm">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Analysis Depth</label>
                <select className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-100" defaultValue="Standard Analysis (2min)">
                  <option>Quick Analysis (30s)</option>
                  <option>Standard Analysis (2min)</option>
                  <option>Deep Analysis (5min)</option>
                </select>
              </div>
              <div className="flex gap-3">
                {phase === "done" ? (
                  <button
                    onClick={reset}
                    className="w-full py-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 font-medium hover:bg-surface-700 transition"
                  >
                    Analyze Another
                  </button>
                ) : (
                  <button
                    onClick={startAnalysis}
                    disabled={!file || phase !== "idle"}
                    className="w-full py-3 rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Start Analysis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {analysisResult && analysisResult.engagementScore != null && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analysis Result</h3>
            <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-${scoreColor(analysisResult.engagementScore)}-500/20 flex items-center justify-center`}>
                  <span className={`text-lg font-bold text-${scoreColor(analysisResult.engagementScore)}-400`}>
                    {analysisResult.engagementScore}
                  </span>
                </div>
                <div>
                  <p className="font-medium">Engagement Score</p>
                  <p className={`text-sm text-${scoreColor(analysisResult.engagementScore)}-400`}>
                    {scoreLabel(analysisResult.engagementScore)}
                  </p>
                </div>
              </div>
              {analysisResult.results?.summary && (
                <div>
                  <p className="text-sm font-medium mb-1">Summary</p>
                  <p className="text-sm text-surface-300">{analysisResult.results.summary}</p>
                </div>
              )}
              {Array.isArray(analysisResult.clipSuggestions) && analysisResult.clipSuggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Clip Suggestions</p>
                  <div className="space-y-2">
                    {analysisResult.clipSuggestions.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-surface-800 border border-surface-700/50 px-3 py-2">
                        <div className="text-sm">
                          <span className="font-medium">{c.platform}</span>
                          <span className="text-surface-400 ml-2">{c.start}s – {c.end}s</span>
                        </div>
                        <span className="text-xs text-surface-400">{c.hook_text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Analyses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Analyses</h3>
            <button
              onClick={fetchRecent}
              className="px-4 py-2 text-sm rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 transition"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAnalyses.length === 0 && (
              <div className="col-span-full text-sm text-surface-400">No analyses yet.</div>
            )}
            {recentAnalyses.map((r) => {
              const score = r.engagementScore ?? 0;
              const color = scoreColor(score);
              const clips = Array.isArray(r.clipSuggestions) ? r.clipSuggestions.length : 0;
              return (
                <div key={r.id} className="bg-surface-900 rounded-xl border border-surface-700/50 p-4 card-hover">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-${color === "green" ? "brand" : color}-500/20 flex items-center justify-center`}>
                      <svg className={`w-5 h-5 text-${color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.filename || "Unknown"}</p>
                      <p className="text-xs text-surface-300">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-300">TikTok Score</span>
                      <span className={`font-medium text-${color}-400`}>{score}/100</span>
                    </div>
                    <div className="w-full bg-surface-800 rounded-full h-1.5">
                      <div className={`bg-${color === "green" ? "brand" : color}-500 h-1.5 rounded-full`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] bg-${color}-500/10 text-${color}-400`}>
                      {scoreLabel(score)}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-surface-700 text-surface-300">{clips} clips</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
