"use client";

import { useTranslations } from "next-intl";
import Header from "../../components/Header";
import { Link } from "@/lib/i18n/navigation";

const quickStats = [
  { labelKey: "stats.projects", value: "12", subKey: "stats.projectsSub", icon: "projects", color: "brand" },
  { labelKey: "stats.customers", value: "5", subKey: "stats.customersSub", icon: "customers", color: "blue" },
  { labelKey: "stats.clips", value: "47", subKey: "stats.clipsSub", icon: "clips", color: "emerald" },
  { labelKey: "stats.analyses", value: "8", subKey: "stats.analysesSub", icon: "ai", color: "purple" },
];

const recentProjects = [
  { title: "Pernas Cruzadas S2", status: "editing", initials: "K", color: "bg-surface-600", date: "May 20" },
  { title: "TechStartup Product Demo", status: "review", initials: "R", color: "bg-surface-600", date: "May 18" },
  { title: "Vaptlux SaaS Walkthrough", status: "approved", initials: "R", color: "bg-surface-600", date: "May 15" },
  { title: "GrowBiz SEO Batch", status: "intake", initials: "A", color: "bg-surface-600", date: "Jun 1" },
];

const statusOrder: Record<string, number> = {
  intake: 0,
  editing: 1,
  analysis: 2,
  review: 3,
  approved: 4,
  posted: 5,
  archived: 6,
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("status");

  const sortedProjects = [...recentProjects].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <>
      <Header title={t("title")} subtitle={t("subtitle")} />

      <div className="p-4 md:p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((s) => (
            <div
              key={s.labelKey}
              className="bg-surface-900 rounded-xl p-5 border border-surface-700/50 transition-colors duration-150 hover:bg-surface-800 hover:border-surface-600/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">
                  {t(s.labelKey)}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 flex items-center justify-center`}
                >
                  <QuickStatIcon icon={s.icon} color={s.color} />
                </div>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-surface-300 mt-1">{t(s.subKey)}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-surface-900 rounded-xl border border-surface-700/50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700/50">
              <h3 className="text-sm font-semibold">{t("recentProjects")}</h3>
              <Link
                href="/projects"
                className="text-xs text-brand-400 hover:text-brand-300 transition"
              >
                {t("viewAll")} →
              </Link>
            </div>
            <div className="divide-y divide-surface-700/30">
              {sortedProjects.map((project, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-800/40 transition"
                >
                  <div
                    className={`w-9 h-9 rounded-full ${project.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {project.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {project.date}
                    </p>
                  </div>
                  <StatusBadge
                    status={project.status}
                    label={tStatus(project.status)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Overview */}
          <div className="bg-surface-900 rounded-xl border border-surface-700/50">
            <div className="px-5 py-4 border-b border-surface-700/50">
              <h3 className="text-sm font-semibold">{t("pipelineOverview")}</h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { status: "intake", count: 3 },
                { status: "editing", count: 4 },
                { status: "analysis", count: 2 },
                { status: "review", count: 2 },
                { status: "approved", count: 1 },
                { status: "posted", count: 0 },
                { status: "archived", count: 0 },
              ].map((stage) => (
                <div key={stage.status} className="flex items-center gap-3">
                  <StatusDot status={stage.status} />
                  <span className="text-sm flex-1">
                    {tStatus(stage.status)}
                  </span>
                  <span className="text-sm font-medium text-surface-300">
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function QuickStatIcon({ icon, color }: { icon: string; color: string }) {
  const cls = `w-4 h-4 text-${color}-400`;
  if (icon === "projects") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    );
  }
  if (icon === "customers") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0a3 3 0 005.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2m0 0a3 3 0 015.356-1.857M12 14a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    );
  }
  if (icon === "clips") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const map: Record<string, string> = {
    intake: "bg-surface-600/20 text-surface-300 border-surface-500/20",
    editing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    analysis: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    posted: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    archived: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${map[status] || map.intake}`}
    >
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    intake: "bg-surface-400",
    editing: "bg-blue-400",
    analysis: "bg-purple-400",
    review: "bg-yellow-400",
    approved: "bg-green-400",
    posted: "bg-teal-400",
    archived: "bg-slate-400",
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${map[status] || map.intake}`} />;
}
