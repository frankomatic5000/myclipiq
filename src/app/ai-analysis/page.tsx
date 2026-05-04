"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Header from "../components/Header";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

type ClipSuggestion = {
  start_seconds?: number;
  end_seconds?: number;
  platform?: string;
  hook_text?: string;
};

type AnalysisResult = {
  id: string;
  status: AnalysisStatus;
  engagementScore: number | null;
  clipSuggestions: ClipSuggestion[] | null;
  results: {
    summary?: string;
    sentiment?: string;
    pacing?: string;
    key_moments?: string[];
  } | null;
  createdAt: string;
};

type RecentAnalysis = {
  id: string;
  status: AnalysisStatus;
  engagement_score: number | null;
  clip_suggestions: ClipSuggestion[] | null;
  results: Record<string, unknown> | null;
  created_at: string;
  video_uploads?: { filename?: string | null } | { filename?: string | null }[] | null;
};

const maxFileSize = 2 * 1024 * 1024 * 1024;
const acceptedVideoTypes = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"]);

function getFilename(analysis: RecentAnalysis) {
  const upload = Array.isArray(analysis.video_uploads) ? analysis.video_uploads[0] : analysis.video_uploads;
  return upload?.filename || `Analysis ${analysis.id.slice(0, 8)}`;
}

function scoreMeta(score: number | null | undefined) {
  if (typeof score !== "number") {
    return {
      label: "Pending",
      textClass: "text-surface-300",
      bgClass: "bg-surface-700",
      badgeClass: "bg-surface-700 text-surface-300",
      iconClass: "bg-brand-500/20 text-brand-400",
      width: "0%",
    };
  }

  if (score >= 75) {
    return {
      label: "High Potential",
      textClass: "text-green-400",
      bgClass: "bg-green-500",
      badgeClass: "bg-green-500/10 text-green-400",
      iconClass: "bg-brand-500/20 text-brand-400",
      width: `${score}%`,
    };
  }

  if (score >= 50) {
    return {
      label: "Medium",
      textClass: "text-amber-400",
      bgClass: "bg-amber-500",
      badgeClass: "bg-amber-500/10 text-amber-400",
      iconClass: "bg-amber-500/20 text-amber-400",
      width: `${score}%`,
    };
  }

  return {
    label: "Low Engagement",
    textClass: "text-red-400",
    bgClass: "bg-red-500",
    badgeClass: "bg-red-500/10 text-red-400",
    iconClass: "bg-red-500/20 text-red-400",
    width: `${score}%`,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

async function getApiError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export default function AIAnalysisPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);

  const fetchRecent = useCallback(async () => {
    setIsLoadingRecent(true);

    try {
      const supabase = getSupabaseBrowser();
      const { data, error: recentError } = await supabase
        .from("ai_analyses")
        .select("id, status, engagement_score, clip_suggestions, results, created_at, video_uploads(filename)")
        .order("created_at", { ascending: false })
        .limit(6);

      if (recentError) {
        setError(recentError.message || "Unable to load recent analyses.");
        setRecentAnalyses([]);
        return;
      }

      setRecentAnalyses((data || []) as RecentAnalysis[]);
    } catch {
      setError("Unable to load recent analyses.");
      setRecentAnalyses([]);
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [fetchRecent]);

  const handleFiles = useCallback((files: FileList | null) => {
    const selected = files?.[0];
    if (!selected) return;

    if (!acceptedVideoTypes.has(selected.type)) {
      setFile(null);
      setError("Unsupported file type. Use MP4, MOV, WebM, or AVI.");
      return;
    }

    if (selected.size > maxFileSize) {
      setFile(null);
      setError("File exceeds the 2GB limit.");
      return;
    }

    setFile(selected);
    setError(null);
    setMessage(null);
    setAnalysisResult(null);
  }, []);

  const pollAnalysis = useCallback(
    async (analysisId: string) => {
      try {
        const response = await fetch(`/api/ai/analyses/${analysisId}`);

        if (!response.ok) {
          throw new Error(await getApiError(response, "Unable to refresh analysis status."));
        }

        const result = (await response.json()) as AnalysisResult;
        setAnalysisResult(result);

        if (result.status === "completed") {
          setIsAnalyzing(false);
          setMessage("Analysis completed.");
          await fetchRecent();
          return;
        }

        if (result.status === "failed") {
          setIsAnalyzing(false);
          setError("Analysis failed. Please try another upload.");
          await fetchRecent();
          return;
        }

        pollTimerRef.current = setTimeout(() => pollAnalysis(analysisId), 3000);
      } catch (pollError) {
        setIsAnalyzing(false);
        setError(pollError instanceof Error ? pollError.message : "Unable to refresh analysis status.");
      }
    },
    [fetchRecent]
  );

  const startAnalysis = useCallback(async () => {
    if (!file || isUploading || isAnalyzing) return;

    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);

    setError(null);
    setMessage(null);
    setAnalysisResult(null);
    setIsUploading(true);

    try {
      const presignResponse = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!presignResponse.ok) {
        throw new Error(await getApiError(presignResponse, "Failed to get upload URL."));
      }

      const { url, key, uploadId } = (await presignResponse.json()) as {
        url: string;
        key: string;
        uploadId: string;
      };

      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload to storage failed. Please try again.");
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, r2Key: key, filename: file.name }),
      });

      if (!analyzeResponse.ok) {
        throw new Error(await getApiError(analyzeResponse, "Failed to start analysis."));
      }

      const { analysisId, status } = (await analyzeResponse.json()) as {
        analysisId: string;
        status: AnalysisStatus;
      };

      setAnalysisResult({
        id: analysisId,
        status,
        engagementScore: null,
        clipSuggestions: [],
        results: null,
        createdAt: new Date().toISOString(),
      });

      pollTimerRef.current = setTimeout(() => pollAnalysis(analysisId), 3000);
      await fetchRecent();
    } catch (startError) {
      setIsUploading(false);
      setIsAnalyzing(false);
      setError(startError instanceof Error ? startError.message : "Something went wrong.");
    }
  }, [fetchRecent, file, isAnalyzing, isUploading, pollAnalysis]);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files);
    },
    [handleFiles]
  );

  const reset = useCallback(() => {
    setFile(null);
    setError(null);
    setMessage(null);
    setAnalysisResult(null);
    setIsUploading(false);
    setIsAnalyzing(false);
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const isBusy = isUploading || isAnalyzing;

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

      {isAnalyzing && analysisResult?.status === "pending" && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <div className="w-4 h-4 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin" />
          <span>Waiting in queue…</span>
        </div>
      )}
      {isAnalyzing && analysisResult?.status === "processing" && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-500/20 bg-brand-500/10 px-4 py-3 text-sm text-brand-300">
          <div className="w-4 h-4 rounded-full border-2 border-brand-500/40 border-t-brand-500 animate-spin" />
          <span>AI is analyzing your video…</span>
        </div>
      )}
      <div className="p-4 md:p-6 space-y-6">
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
              role="button"
              tabIndex={0}
              aria-label="Upload a video for AI analysis"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDrop={onDrop}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition min-h-[200px] flex flex-col items-center justify-center ${
                isDragging ? "border-brand-500 bg-brand-500/10" : "border-surface-700 hover:border-brand-500 hover:bg-brand-500/5"
              } ${error ? "border-red-500 bg-red-500/5" : ""}`}
            >
              {isBusy ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin" />
                  <p className="font-medium">{isUploading ? "Uploading video..." : "Analyzing video..."}</p>
                  <p className="text-sm text-surface-300">This can take a few minutes.</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-medium mb-2">{file ? file.name : "Drag and drop your video here"}</p>
                  <p className="text-sm text-surface-300">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB selected` : "or click to browse"}</p>
                  <p className="text-xs text-surface-300 mt-2">MP4, MOV, WebM, AVI • Max 2GB</p>
                </>
              )}
            </div>
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300" role="status">
                {message}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analysis Options</h3>
            <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <select disabled={isBusy} className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-100">
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
                      <input type="checkbox" defaultChecked={i < 2} disabled={isBusy} className="w-4 h-4 rounded bg-surface-700 border-surface-600 accent-brand-500" />
                      <span className="text-sm">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Analysis Depth</label>
                <select disabled={isBusy} className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-100" defaultValue="Standard Analysis (2min)">
                  <option>Quick Analysis (30s)</option>
                  <option>Standard Analysis (2min)</option>
                  <option>Deep Analysis (5min)</option>
                </select>
              </div>
              {analysisResult && (
                <div className="rounded-lg border border-surface-700/50 bg-surface-800 px-4 py-3 text-sm text-surface-300">
                  Current analysis: <span className="font-medium text-surface-100">{analysisResult.status}</span>
                </div>
              )}
              <div className="flex gap-3">
                {analysisResult?.status === "completed" ? (
                  <button onClick={reset} className="w-full py-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 font-medium hover:bg-surface-700 transition">
                    Analyze Another
                  </button>
                ) : (
                  <button
                    onClick={startAnalysis}
                    disabled={!file || isBusy}
                    className="w-full py-3 rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className={`w-5 h-5 ${isBusy ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isUploading ? "Uploading..." : isAnalyzing ? "Analyzing..." : "Start Analysis"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {analysisResult?.status === "completed" && analysisResult.engagementScore != null && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analysis Result</h3>
            <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${scoreMeta(analysisResult.engagementScore).iconClass} flex items-center justify-center`}>
                  <span className="text-lg font-bold">{analysisResult.engagementScore}</span>
                </div>
                <div>
                  <p className="font-medium">Engagement Score</p>
                  <p className={`text-sm ${scoreMeta(analysisResult.engagementScore).textClass}`}>{scoreMeta(analysisResult.engagementScore).label}</p>
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
                    {analysisResult.clipSuggestions.map((clip, index) => (
                      <div key={`${clip.platform}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg bg-surface-800 border border-surface-700/50 px-3 py-2">
                        <div className="text-sm">
                          <span className="font-medium">{clip.platform || "Social"}</span>
                          <span className="text-surface-400 ml-2">{clip.start_seconds ?? 0}s - {clip.end_seconds ?? 0}s</span>
                        </div>
                        <span className="text-xs text-surface-400">{clip.hook_text || "Suggested clip"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Analyses</h3>
            <button onClick={fetchRecent} disabled={isLoadingRecent} className="px-4 py-2 text-sm rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 transition disabled:opacity-50">
              {isLoadingRecent ? "Loading" : "Refresh"}
            </button>
          </div>
          {isLoadingRecent ? (
            <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-6 text-sm text-surface-300">Loading recent analyses...</div>
          ) : recentAnalyses.length === 0 ? (
            <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-6 text-sm text-surface-300">No analyses yet. Upload a video to start one.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAnalyses.map((analysis) => {
                const score = analysis.engagement_score;
                const meta = scoreMeta(score);
                const clips = Array.isArray(analysis.clip_suggestions) ? analysis.clip_suggestions.length : 0;

                return (
                  <div key={analysis.id} className="bg-surface-900 rounded-xl border border-surface-700/50 p-4 card-hover">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${meta.iconClass} flex items-center justify-center`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{getFilename(analysis)}</p>
                        <p className="text-xs text-surface-300">{formatDate(analysis.created_at)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-300">Engagement Score</span>
                        <span className={`font-medium ${meta.textClass}`}>{typeof score === "number" ? `${score}/100` : "--"}</span>
                      </div>
                      <div className="w-full bg-surface-800 rounded-full h-1.5">
                        <div className={`${meta.bgClass} h-1.5 rounded-full`} style={{ width: meta.width }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${meta.badgeClass}`}>{analysis.status === "completed" ? meta.label : analysis.status}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-surface-700 text-surface-300">{clips} clips</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
