import Header from "../components/Header";
import Link from "next/link";

const customers = [
  { initials: "IM", name: "Imigrou", email: "Internal Brand", projects: 3, revenue: "$2,400", status: "Active", statusColor: "green", contract: "N/A", lastContact: "Today" },
  { initials: "TS", name: "TechStartup Inc.", email: "contact@techstartup.io", projects: 2, revenue: "$3,600", status: "Active", statusColor: "green", contract: "Signed", lastContact: "2 days ago" },
  { initials: "RX", name: "RestaurantX", email: "maria@restaurantx.com", projects: 1, revenue: "$800", status: "Pending", statusColor: "amber", contract: "Pending", lastContact: "5 days ago" },
  { initials: "VP", name: "Vaptlux", email: "hello@vaptlux.com", projects: 4, revenue: "$5,200", status: "Active", statusColor: "green", contract: "Signed", lastContact: "Yesterday" },
  { initials: "GB", name: "GrowBiz Studios", email: "karine@growbiz.com", projects: 6, revenue: "N/A", status: "Active", statusColor: "green", contract: "N/A", lastContact: "Today" },
];

const statusBadgeClass: Record<string, string> = {
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CustomersPage() {
  return (
    <>
      <Header
        title="Customers"
        subtitle="Client relationship management"
        actions={
          <>
            <div className="hidden sm:flex items-center bg-surface-900 rounded-lg border border-surface-700/50 p-0.5">
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium bg-brand-500/20 text-brand-400">Admin</button>
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Editor</button>
              <button className="role-btn px-3 py-1.5 rounded-md text-xs font-medium text-surface-300 hover:text-surface-100">Viewer</button>
            </div>
            <div className="relative w-full sm:w-auto">
              <input type="text" placeholder="Search customers..." className="pl-10 pr-4 py-2 rounded-lg bg-surface-900 border border-surface-700/50 text-sm text-surface-100 placeholder-surface-300/50 focus:outline-none focus:border-brand-500 w-full sm:w-64" />
              <svg className="w-4 h-4 text-surface-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button className="admin-only px-4 py-2 text-sm rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Customer
            </button>
          </>
        }
      />

      <div className="p-4 md:p-6">
        {/* Customer Table */}
        <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Projects</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Revenue</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Contract</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Last Contact</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-surface-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, idx) => (
                <tr key={idx} className="border-b border-surface-700/30 hover:bg-surface-800/50 cursor-pointer transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-${customer.statusColor}-500 flex items-center justify-center text-white font-bold text-sm`}>{customer.initials}</div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-surface-300">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">{customer.projects}</td>
                  <td className="px-5 py-4 text-sm">{customer.revenue}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClass[customer.statusColor]}`}>{customer.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${customer.contract === "N/A" ? "bg-surface-700 text-surface-300 border-surface-600" : statusBadgeClass[customer.statusColor]}`}>{customer.contract}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-300">{customer.lastContact}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded hover:bg-surface-700 transition" title="WhatsApp">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                      </button>
                      <button className="p-1.5 rounded hover:bg-surface-700 transition" title="Invoice">
                        <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
