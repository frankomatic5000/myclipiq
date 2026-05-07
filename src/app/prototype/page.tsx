"use client";

import { useState } from "react";
import { BarChart3, Film, Loader2 } from "lucide-react";
import StatCard from "@/components/prototype/StatCard";
import ProjectCard from "@/components/prototype/ProjectCard";
import { mockProjects, dashboardStats, pipelineStages } from "@/lib/mock/data";
import type { ProjectStatus } from "@/lib/mock/data";

/* ── Skeleton components ─────────────────────────────────────── */

function SkeletonStatCard() {
  return (
    <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-24 h-3 rounded bg-surface-700" />
        <div className="w-10 h-10 rounded-lg bg-surface-700" />
      </div>
      <div className="w-16 h-8 rounded bg-surface-700" />
    </div>
  );
}

function SkeletonProjectCard() {
  return (
    <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-hidden animate-pulse">
      <div className="aspect-video w-full bg-surface-700" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-4 rounded bg-surface-700" />
            <div className="w-1/2 h-3 rounded bg-surface-700" />
          </div>
          <div className="w-16 h-6 rounded-full bg-surface-700" />
        </div>
        <div className="flex items-center justify-between">
          <div className="w-16 h-3 rounded bg-surface-700" />
          <div className="w-6 h-6 rounded-full bg-surface-700" />
        </div>
      </div>
    </div>
  );
}

function SkeletonPipeline() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-surface-700" />
          <div className="w-24 h-3 rounded bg-surface-700" />
          <div className="w-6 h-4 rounded bg-surface-700 ml-auto" />
        </div>
      ))}
    </div>
  );
}

/* ── Empty states ──────────────────────────────────────────── */

function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-[fadeUp_400ms_ease-out]">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
        <Film className="w-8 h-8 text-surface-600" />
      </div>
      <h3 className="text-lg font-semibold text-surface-200 mb-1">No projects yet</h3>
      <p className="text-sm text-surface-400 max-w-xs">
        Upload your first video to get started with your content pipeline.
      </p>
    </div>
  );
}

function EmptyPipeline() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <BarChart3 className="w-8 h-8 text-surface-600 mb-3" />
      <h3 className="text-sm font-semibold text-surface-200 mb-1">No activity yet</h3>
      <p className="text-xs text-surface-400">
        Your pipeline will fill up as projects move forward.
      </p>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */

export default function PrototypeDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  // Toggle for demo purposes
  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const data = showEmpty ? [] : mockProjects;

  return (
    <div className="space-y-8">
      {/* Debug toggles (prototype only) */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={toggleLoading}
          className="px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-300 hover:text-surface-100 transition"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> : null}
          Toggle Loading
        </button>
        <button
          onClick={() => setShowEmpty((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-300 hover:text-surface-100 transition"
        >
          Toggle Empty
        </button>
      </div>

      {/* Stat Cards */}
      <section>
        <h2 className="text-lg font-semibold text-surface-200 mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            : dashboardStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
        </div>
      </section>

      {/* Two-column: Projects + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-200">Recent Projects</h2>
            <button className="text-xs text-brand-400 hover:text-brand-300 transition">
              View all →
            </button>
          </div>

          {data.length === 0 && !loading ? (
            <EmptyProjects />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonProjectCard key={i} />)
                : data.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          )}
        </section>

        {/* Pipeline Overview */}
        <section>
          <h2 className="text-lg font-semibold text-surface-200 mb-4">Pipeline</h2>
          <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-5">
            {loading ? (
              <SkeletonPipeline />
            ) : pipelineStages.every((s) => s.count === 0) ? (
              <EmptyPipeline />
            ) : (
              <div className="space-y-4">
                {pipelineStages.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <StatusDot status={stage.status} />
                    <span className="text-sm text-surface-200 flex-1">{stage.label}</span>
                    <span className="text-sm font-medium text-surface-300">{stage.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* CSS animations (scoped) */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Pipeline dot helper ───────────────────────────────────── */

function StatusDot({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, string> = {
    intake:   "bg-amber-400",
    editing:  "bg-blue-400",
    analysis: "bg-purple-400",
    review:   "bg-yellow-400",
    approved: "bg-green-400",
    posted:   "bg-teal-400",
    archived: "bg-slate-400",
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${map[status]}`} />;
}
