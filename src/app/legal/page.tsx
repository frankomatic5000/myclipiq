import Header from "../components/Header";

const contracts = [
  { customer: "TechStartup Inc.", type: "Media Rights Agreement", status: "Signed", statusColor: "green", sent: "Apr 12, 2026", signed: "Apr 14, 2026", initial: "TS", bg: "bg-blue-500" },
  { customer: "Fitness Coach Pro", type: "Content License", status: "Pending", statusColor: "amber", sent: "Apr 28, 2026", signed: "—", initial: "FC", bg: "bg-emerald-500" },
  { customer: "Local Bakery Co.", type: "Media Rights Agreement", status: "Signed", statusColor: "green", sent: "Mar 15, 2026", signed: "Mar 18, 2026", initial: "LB", bg: "bg-orange-500" },
  { customer: "Real Estate Group", type: "Content License", status: "Expired", statusColor: "red", sent: "Jan 5, 2026", signed: "Jan 7, 2026", initial: "RE", bg: "bg-purple-500" },
];

export default function LegalPage() {
  return (
    <>
      <Header
        title="Legal & Contracts"
        subtitle="Content licensing & media rights agreements"
        actions={
          <>
            <div className="flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
              <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">Admin</button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Editor</button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Viewer</button>
            </div>
            <button className="px-4 py-2 text-sm rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Contract
            </button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Contracts", value: "12", sub: "+3 this month", color: "brand", icon: "doc" },
            { label: "Pending", value: "3", sub: "Awaiting signature", color: "amber", icon: "clock" },
            { label: "Signed", value: "8", sub: "+2 this week", color: "green", icon: "check" },
            { label: "Expired", value: "1", sub: "Needs renewal", color: "red", icon: "x" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-900 rounded-xl p-5 border border-surface-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 flex items-center justify-center`}>
                  <svg className={`w-4 h-4 text-${s.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className={`text-xs mt-1 text-${s.color === "amber" || s.color === "red" ? s.color : "surface"}-${s.color === "green" ? "400" : "300"}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Contracts Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Contracts</h3>
            <select className="px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-700/50 text-sm text-surface-100">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  {["Customer", "Contract Type", "Status", "Sent Date", "Signed Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.customer} className="border-b border-surface-700/30 hover:bg-surface-800/50 cursor-pointer transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center text-white font-bold text-sm`}>{c.initial}</div>
                        <div>
                          <p className="font-medium text-sm">{c.customer}</p>
                          <p className="text-xs text-surface-300">Media Rights</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm">{c.type}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${c.statusColor}-500/10 text-${c.statusColor}-400 border border-${c.statusColor}-500/20`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-surface-300">{c.sent}</td>
                    <td className="px-5 py-4 text-sm text-surface-300">{c.signed}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-surface-700 transition">
                          <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button className="p-1.5 rounded hover:bg-surface-700 transition">
                          <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content License Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content License Template</h3>
          <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-6 text-sm text-surface-300 space-y-4">
            <div className="space-y-2">
              <p className="font-medium text-surface-100">Section 1 — Grant of Rights</p>
              <p>Licensor grants Licensee a <span className="contract-variable">non-exclusive</span>, worldwide license to use the Licensed Content for the purpose of <span className="contract-variable">social media marketing</span>.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-surface-100">Section 2 — Term</p>
              <p>This Agreement shall commence on <span className="contract-variable">[Effective Date]</span> and continue for a period of <span className="contract-variable">12 months</span>, unless terminated earlier.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-surface-100">Section 3 — Compensation</p>
              <p>Licensee shall pay Licensor <span className="contract-variable">$[Amount]</span> per <span className="contract-variable">[Period]</span>, payable within <span className="contract-variable">30 days</span> of invoice.</p>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 text-sm rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition">Generate Digital Contract</button>
            </div>
          </div>
        </div>


      </div>
    </>
  );
}