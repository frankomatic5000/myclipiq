import Header from "../components/Header";
import Link from "next/link";

const members = [
  { name: "Rod Rezende", email: "rod@growbiz.com", role: "Admin", roleColor: "brand", initial: "R", projects: 12, lastActive: "Online", avatarBg: "gradient-accent" },
  { name: "Karine Rezende", email: "karine@growbiz.com", role: "Admin", roleColor: "brand", initial: "K", projects: 8, lastActive: "Today", avatarBg: "bg-brand-500" },
  { name: "Anna Martinez", email: "anna@studio.com", role: "Editor", roleColor: "blue", initial: "A", projects: 5, lastActive: "Yesterday", avatarBg: "bg-blue-500" },
  { name: "Maria Silva", email: "maria@client.com", role: "Viewer", roleColor: "emerald", initial: "M", projects: 2, lastActive: "3 days ago", avatarBg: "bg-emerald-500" },
];

export default function TeamPage() {
  return (
    <>
      <Header
        title="Team Management"
        subtitle="Manage team members and permissions"
        actions={
          <>
            <div className="hidden sm:flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
              <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">Admin</button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Editor</button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Viewer</button>
            </div>
            <Link href="/onboarding" className="px-4 py-2 text-sm rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Invite Member
            </Link>
          </>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Members", value: "8", sub: "+2 pending invites", icon: "users", color: "brand" },
            { label: "Admins", value: "2", sub: "Rod, Karine", icon: "shield", color: "red" },
            { label: "Editors", value: "4", sub: "Content creators", icon: "edit", color: "blue" },
            { label: "Viewers", value: "2", sub: "Clients", icon: "eye", color: "emerald" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-900 rounded-xl p-5 border border-surface-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 flex items-center justify-center`}>
                  <svg className={`w-4 h-4 text-${s.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
                </div>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-surface-300 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-surface-700/50">
                  {["Member", "Role", "Projects", "Last Active", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">{h || "Actions"}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.email} className="border-b border-surface-700/30 hover:bg-surface-800/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${m.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>{m.initial}</div>
                        <div>
                          <p className="font-medium text-sm">{m.name}</p>
                          <p className="text-xs text-surface-300">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${m.roleColor}-500/10 text-${m.roleColor}-400 border border-${m.roleColor}-500/20`}>{m.role}</span>
                    </td>
                    <td className="px-5 py-4 text-sm">{m.projects}</td>
                    <td className="px-5 py-4 text-sm text-surface-300">{m.lastActive}</td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded hover:bg-surface-700 transition" title="Edit">
                        <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Invites */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending Invites</h3>
          <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-surface-700/50">
                  {["Email", "Role", "Sent", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-surface-700/30 hover:bg-surface-800/50 transition">
                  <td className="px-5 py-4 text-sm text-surface-300">john@fitnessapp.co</td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Viewer</span></td>
                  <td className="px-5 py-4 text-sm text-surface-300">2 days ago</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-xs rounded-lg gradient-accent text-white hover:opacity-90 transition">Resend</button>
                      <button className="px-3 py-1 text-xs rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 transition">Revoke</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-4 space-y-3">
            {[
              { action: "Rod added Anna Martinez as Editor", time: "2 hours ago", color: "green" },
              { action: "Karine updated project permissions", time: "Yesterday", color: "blue" },
              { action: "Invitation sent to john@fitnessapp.co", time: "2 days ago", color: "brand" },
              { action: "Maria Silva accepted viewer invitation", time: "1 week ago", color: "emerald" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full bg-${a.color}-400`} />
                <span>{a.action}</span>
                <span className="text-surface-300 ml-auto text-xs">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
