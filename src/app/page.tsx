"use client";

import Link from "next/link";

/* ── SVG icon helpers ────────────────────────────────────────── */

function CpuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21" />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ═══════════════════ Ambient background ═══════════════════ */}

      {/* Deep base */}
      <div className="absolute inset-0 bg-surface-950" />

      {/* Cinematic gradient orbs — slow, oversized, purposeful */}
      <div
        className="pointer-events-none absolute -top-[40%] -left-[20%] h-[80vw] w-[80vw] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle at center, rgba(124,58,237,0.35) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[30%] -right-[25%] h-[70vw] w-[70vw] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle at center, rgba(59,130,246,0.30) 0%, transparent 60%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[30%] left-[20%] h-[60vw] w-[60vw] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle at center, rgba(167,139,250,0.25) 0%, transparent 55%)",
          filter: "blur(100px)",
        }}
      />

      {/* Subtle star / noise texture via CSS */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px), radial-gradient(circle at 50% 90%, white 1px, transparent 1px)",
          backgroundSize: "400px 400px",
        }}
      />

      {/* Top edge glow */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      {/* ═══════════════════ Content ══════════════════════════════ */}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 sm:px-8">
        <div className="max-w-4xl w-full text-center space-y-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-300 text-xs font-medium uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
            </span>
            AI-Powered Video Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Your editing just got
            <br />
            <span className="relative">
              <span className="gradient-text">an AI co-pilot</span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-brand-500/30"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 8 Q75 0 150 8 T300 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-surface-300 max-w-2xl mx-auto leading-relaxed">
            MyClipIQ analyzes every clip and automatically optimizes
            framing, pacing, and format for each social platform.
            Stop guessing which cut goes where — let AI decide.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/signup"
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-accent text-white font-semibold text-lg overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10">Start editing smarter</span>
              <svg
                className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              {/* Shine sweep */}
              <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Link>

            <button className="group inline-flex items-center gap-2.5 px-6 py-4 rounded-xl border border-surface-700/60 bg-surface-900/60 text-surface-200 font-medium text-lg backdrop-blur-sm hover:bg-surface-800/80 hover:border-surface-600 transition-all">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-700/80 group-hover:bg-brand-500/20 group-hover:text-brand-300 transition-colors">
                <PlayIcon className="w-3 h-3 ml-0.5" />
              </span>
              See how it works
            </button>
          </div>

          {/* Mini feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 max-w-3xl mx-auto">
            {[
              {
                icon: CpuIcon,
                label: "Smart Analysis",
                desc: "Frame-level AI understanding",
              },
              {
                icon: ZapIcon,
                label: "Instant Optimization",
                desc: "Auto-format per platform",
              },
              {
                icon: GlobeIcon,
                label: "Multi-Platform",
                desc: "Reels · Shorts · TikTok · LinkedIn",
              },
            ].map((f) => (
              <div
                key={f.label}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-surface-800 bg-surface-900/40 backdrop-blur-sm hover:border-brand-500/30 hover:bg-surface-800/50 transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 group-hover:text-brand-300 group-hover:bg-brand-500/15 transition-colors">
                  <f.icon className="w-5 h-5" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-sm font-semibold text-surface-200">{f.label}</p>
                  <p className="text-xs text-surface-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust microcopy */}
          <p className="text-xs text-surface-500 pt-2">
            No credit card required · Free tier available · Built for editors, not just creators
          </p>
        </div>
      </div>

      {/* ═══════════════════ CSS keyframes (scoped) ═══════════════ */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </main>
  );
}
