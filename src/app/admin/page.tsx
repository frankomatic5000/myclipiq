"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "editor" | "viewer" | null;
  created_at: string;
};

const ROLES: Array<"admin" | "editor" | "viewer"> = ["admin", "editor", "viewer"];

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const supabase = getSupabaseBrowser();

  // Load users + verify current user is admin
  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!me || me.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Admin] Failed to load users:", error.message);
        setToast({ message: error.message, type: "error" });
      } else {
        setUsers((data as UserProfile[]) || []);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function updateRole(userId: string, newRole: string) {
    setSavingId(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    setSavingId(null);
    if (error) {
      console.error("[Admin] Role update failed:", error.message);
      setToast({ message: error.message, type: "error" });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      setToast({ message: "Role updated", type: "success" });
    }
  }

  async function createTestUser() {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
      console.error("[Admin] Create test user failed:", error);
      setToast({ message: error || "Failed to create user", type: "error" });
      return;
    }

    const data = await res.json();

    if (data.id) {
      // Refresh list
      const { data: refreshed } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });

      setUsers((refreshed as UserProfile[]) || []);
      setToast({
        message: `Created ${data.email} / viewer`,
        type: "success",
      });
    }
  }

  // ---- Loading state ----
  if (loading) {
    return (
      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-surface-700 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  // ---- Access denied ----
  if (isAdmin === false) {
    return (
      <main className="p-6 md:p-10 max-w-6xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
        <p className="text-surface-300">
          You need admin privileges to view this page.
        </p>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
            Admin Panel
          </h1>
          <p className="text-surface-300 text-sm">
            Manage users, roles, and access for the MyClipIQ team.
          </p>
        </div>
        <button
          onClick={createTestUser}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Test User
        </button>
      </div>

      {/* Mobile create button */}
      <button
        onClick={createTestUser}
        className="md:hidden w-full mb-6 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Test User
      </button>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length },
          { label: "Editors", value: users.filter((u) => u.role === "editor").length },
          { label: "Viewers", value: users.filter((u) => u.role === "viewer").length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-900 border border-surface-700/50 rounded-xl p-4 card-hover"
          >
            <p className="text-surface-300 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-surface-900 border border-surface-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-800/50 border-b border-surface-700/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-surface-200">Email</th>
                <th className="px-4 py-3 font-semibold text-surface-200">Full Name</th>
                <th className="px-4 py-3 font-semibold text-surface-200">Role</th>
                <th className="px-4 py-3 font-semibold text-surface-200">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/30">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-800/30 transition">
                  <td className="px-4 py-3 text-white font-medium">{user.email}</td>
                  <td className="px-4 py-3 text-surface-300">
                    {user.full_name || (
                      <span className="text-surface-500 italic">Unnamed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={user.role || "viewer"}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        disabled={savingId === user.id}
                        className={`appearance-none bg-surface-800 border border-surface-700 text-white text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
                          savingId === user.id ? "opacity-50 cursor-wait" : "cursor-pointer"
                        }`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-surface-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-surface-400">{formatDate(user.created_at)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-surface-400">
                    No users found. Create a test user to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
