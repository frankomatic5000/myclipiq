import Header from "./components/Header";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back, Rod. Here's what's happening."
        actions={
          <>
            <div className="flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">Admin</button>
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Editor</button>
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Viewer</button>
            </div>
            <Link href="/onboarding" className="admin-only px-3 py-2 md:px-4 md:py-2 text-sm rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 transition flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Invite Team
            </Link>
            <Link href="/projects" className="px-3 py-2 md:px-4 md:py-2 text-sm rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Project
            </Link>
          </>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">Active Projects</span>
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-green-400 mt-1">+3 this week</p>
          </div>

          <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">Team Members</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-green-400 mt-1">+2 pending invites</p>
          </div>

          <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">Content Analyzed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold">47</p>
            <p className="text-xs text-surface-300 mt-1">12 videos this week</p>
          </div>

          <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">Revenue MTD</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold admin-only">$4,280</p>
            <p className="text-xs text-green-400 mt-1">+18% vs last month</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Projects */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Projects</h3>
              <Link href="/projects" className="text-sm text-brand-400 hover:text-brand-300 transition">View all →</Link>
            </div>

            <div className="space-y-3">
              {/* Project Card 1 */}
              <Link href="/projects" className="block bg-surface-900 rounded-xl p-4 border border-surface-700/50 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Imigrou Brand Refresh</h4>
                      <p className="text-xs text-surface-300">Karine's editorial series — 8 episodes</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Script</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500/30"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700"></div>
                </div>
                <div className="flex items-center justify-between text-xs text-surface-300">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-500 border-2 border-surface-900 flex items-center justify-center text-[9px] text-white font-bold">K</div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-surface-900 flex items-center justify-center text-[9px] text-white font-bold">R</div>
                    </div>
                    <span>60% complete</span>
                  </div>
                  <span>Due May 15</span>
                </div>
              </Link>

              {/* Project Card 2 */}
              <Link href="/projects" className="block bg-surface-900 rounded-xl p-4 border border-surface-700/50 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Vaptlux Product Demo</h4>
                      <p className="text-xs text-surface-300">SaaS walkthrough — 3 clips</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Review</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500/30"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700"></div>
                </div>
                <div className="flex items-center justify-between text-xs text-surface-300">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-surface-900 flex items-center justify-center text-[9px] text-white font-bold">R</div>
                    </div>
                    <span>80% complete</span>
                  </div>
                  <span>Due May 18</span>
                </div>
              </Link>

              {/* Project Card 3 */}
              <Link href="/projects" className="block bg-surface-900 rounded-xl p-4 border border-surface-700/50 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-medium">GrowBiz Magazine May</h4>
                      <p className="text-xs text-surface-300">Digital issue — 24 pages</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Research</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-brand-500/30"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700"></div>
                </div>
                <div className="flex items-center justify-between text-xs text-surface-300">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-500 border-2 border-surface-900 flex items-center justify-center text-[9px] text-white font-bold">K</div>
                    </div>
                    <span>25% complete</span>
                  </div>
                  <span>Due Jun 1</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50">
              <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/ai-analysis" className="flex items-center gap-3 p-3 rounded-lg bg-surface-800 hover:bg-surface-700 transition">
                  <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <span className="text-sm font-medium">Analyze Video</span>
                </Link>
                <Link href="/projects" className="flex items-center gap-3 p-3 rounded-lg bg-surface-800 hover:bg-surface-700 transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-sm font-medium">New Project</span>
                </Link>
                <Link href="/customers" className="flex items-center gap-3 p-3 rounded-lg bg-surface-800 hover:bg-surface-700 transition">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  </div>
                  <span className="text-sm font-medium">Add Customer</span>
                </Link>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-surface-900 rounded-xl p-5 border border-surface-700/50">
              <h3 className="text-sm font-semibold mb-4">AI Insights</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-brand-500/5 border border-brand-500/20">
                  <p className="text-sm font-medium text-brand-400">Best posting time</p>
                  <p className="text-xs text-surface-300 mt-1">Wed & Fri, 2–4 PM EST</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-sm font-medium text-green-400">Trending topics</p>
                  <p className="text-xs text-surface-300 mt-1">Immigration tips + travel vlogs</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-sm font-medium text-amber-400">Attention</p>
                  <p className="text-xs text-surface-300 mt-1">2 videos need re-editing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
