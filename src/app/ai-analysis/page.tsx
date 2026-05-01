import Header from "../components/Header";
import Link from "next/link";

export default function AIAnalysisPage() {
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

      <div className="p-6 space-y-6">
        {/* Upload Section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Video</h3>
            <div className="border-2 border-dashed border-surface-700 hover:border-brand-500 hover:bg-brand-500/5 rounded-xl p-8 text-center cursor-pointer transition">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="font-medium mb-2">Drag and drop your video here</p>
              <p className="text-sm text-surface-300">or click to browse</p>
              <p className="text-xs text-surface-300 mt-2">MP4, MOV, AVI • Max 2GB</p>
            </div>
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
              <button className="w-full py-3 rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Start Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Analyses</h3>
            <button className="px-4 py-2 text-sm rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 transition">View All</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "Imigrou E1", date: "2 days ago", score: 87, level: "High Potential", color: "green", clips: 4 },
              { name: "Vaptlux Demo", date: "5 days ago", score: 62, level: "Medium", color: "amber", clips: 6 },
              { name: "Magazine #12", date: "1 week ago", score: 34, level: "Low Engagement", color: "red", clips: 2 },
            ].map((r) => (
              <div key={r.name} className="bg-surface-900 rounded-xl border border-surface-700/50 p-4 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${r.color === "green" ? "brand" : r.color}-500/20 flex items-center justify-center`}>
                    <svg className={`w-5 h-5 text-${r.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-surface-300">{r.date}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-300">TikTok Score</span>
                    <span className={`font-medium text-${r.color}-400`}>{r.score}/100</span>
                  </div>
                  <div className="w-full bg-surface-800 rounded-full h-1.5">
                    <div className={`bg-${r.color}-500 h-1.5 rounded-full`} style={{ width: `${r.score}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] bg-${r.color}-500/10 text-${r.color}-400`}>{r.level}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-surface-700 text-surface-300">{r.clips} clips</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}