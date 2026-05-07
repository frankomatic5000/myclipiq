"use client";

import { useState } from "react";
import Sidebar from "@/components/prototype/Sidebar";
import MobileNav from "@/components/prototype/MobileNav";
import LanguageSwitcher from "@/components/prototype/LanguageSwitcher";
import { Search, Bell, User } from "lucide-react";

export default function PrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-950">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 h-16 bg-surface-900/80 backdrop-blur-md border-b border-surface-700/50 flex items-center justify-between px-4 md:px-6">
          {/* Left: Mobile hamburger + page context */}
          <div className="flex items-center gap-3">
            <MobileNav />
            <h2 className="text-sm font-semibold text-surface-200 hidden sm:block">
              Prototype Dashboard
            </h2>
          </div>

          {/* Right: Search + Language + Bell + Avatar */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search (visual only) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-400 text-xs">
              <Search className="w-3.5 h-3.5" />
              <span>Search projects...</span>
            </div>

            {/* Language switcher */}
            <LanguageSwitcher
              activeLocale="en"
              onChange={() => {}}
            />

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-400" />
            </button>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
