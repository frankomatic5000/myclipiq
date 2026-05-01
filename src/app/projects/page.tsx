import Header from "../components/Header";
import Link from "next/link";

const pipelineStages = [
  { id: "brief", label: "Brief", color: "bg-surface-300", count: 3 },
  { id: "research", label: "Research", color: "bg-amber-400", count: 2 },
  { id: "script", label: "Script", color: "bg-brand-400", count: 4 },
  { id: "review", label: "Review", color: "bg-emerald-400", count: 2 },
  { id: "publish", label: "Publish", color: "bg-brand-500", count: 1 },
];

const projects = [
  {
    id: "brief",
    items: [
      { title: "Pernas Cruzadas S2", desc: "Travel series — 6 episodes", initials: "K", color: "bg-brand-500", date: "May 20" },
      { title: "Client: TechStartup", desc: "Product demo videos — 4 clips", initials: "R", color: "bg-blue-500", date: "May 22" },
      { title: "GrowBiz Services SEO", desc: "Local SEO content batch", initials: "A", color: "bg-amber-500", date: "Jun 1" },
    ],
  },
  {
    id: "research",
    items: [
      { title: "Magazine Issue #12", desc: "Monthly digital — 24 pages", initials: "K", color: "bg-brand-500", date: "Jun 1" },
      { title: "Imigrou YouTube Series", desc: "Immigration guide — 10 eps", initials: "K,R", color: "bg-brand-500", date: "Jun 15" },
    ],
  },
  {
    id: "script",
    items: [
      { title: "Imigrou Brand Refresh", desc: "Editorial series — 8 episodes", initials: "K,R", color: "bg-brand-500", date: "May 15" },
      { title: "Vaptlux Product Demo", desc: "SaaS walkthrough video", initials: "R", color: "bg-blue-500", date: "May 18" },
      { title: "GrowBiz Studio Portfolio", desc: "Showcase reel — 2 min", initials: "A", color: "bg-amber-500", date: "May 20" },
      { title: "Client: TechStartup Q2", desc: "Social clips batch", initials: "R", color: "bg-blue-500", date: "May 25" },
    ],
  },
  {
    id: "review",
    items: [
      { title: "Vaptlux Product Demo", desc: "SaaS walkthrough — 3 clips", initials: "R", color: "bg-blue-500", date: "May 18" },
      { title: "GrowBiz Studio Portfolio", desc: "Showcase reel — 2 min", initials: "A", color: "bg-amber-500", date: "May 20" },
    ],
  },
  {
    id: "publish",
    items: [
      { title: "Imigrou Episode 1", desc: "Travel vlog — 12 min", initials: "K,R", color: "bg-brand-500", date: "Done" },
    ],
  },
];

export default function ProjectsPage() {
  return (
    <>
      <Header
        title="Projects"
        subtitle="Manage your content pipelines"
        actions={
          <>
            <div className="flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
              <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">List</button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Grid</button>
            </div>
            <div className="flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">Admin</button>
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Editor</button>
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Viewer</button>
            </div>
            <button className="px-4 py-2 text-sm rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Project
            </button>
          </>
        }
      />

      <div className="p-6">
        {/* Pipeline Filter */}
        <div className="flex items-center gap-2 mb-8">
          <button className="pipeline-filter px-3 py-1.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">All (12)</button>
          {pipelineStages.map((stage) => (
            <button key={stage.id} className="pipeline-filter px-3 py-1.5 rounded-full text-xs font-medium bg-surface-800 text-surface-300 border border-surface-700/50 hover:border-brand-500/30">
              {stage.label} ({stage.count})
            </button>
          ))}
        </div>

        {/* Kanban Pipeline View */}
        <div className="grid grid-cols-5 gap-4">
          {projects.map((stage) => (
            <div key={stage.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${pipelineStages.find((s) => s.id === stage.id)?.color}`}></div>
                <h3 className="text-sm font-semibold text-surface-300 capitalize">{stage.id}</h3>
                <span className="text-xs text-surface-300 bg-surface-800 px-2 py-0.5 rounded-full">{stage.items.length}</span>
              </div>
              <div className="space-y-3">
                {stage.items.map((item, idx) => (
                  <div key={idx} className="pipeline-stage bg-surface-900 rounded-xl p-4 border border-surface-700/50 cursor-pointer">
                    <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                    <p className="text-xs text-surface-300 mb-3">{item.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {item.initials.split(",").map((init, i) => (
                          <div key={i} className={`w-5 h-5 rounded-full ${item.color} border border-surface-900 text-[8px] text-white flex items-center justify-center font-bold`}>{init}</div>
                        ))}
                      </div>
                      <span className="text-[10px] text-surface-300">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}