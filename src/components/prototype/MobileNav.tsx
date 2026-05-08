"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  Upload,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/prototype", label: "Home", icon: Home },
  { href: "/prototype/projects", label: "Projects", icon: FolderOpen },
  { href: "/prototype/upload", label: "Upload", icon: Upload },
  { href: "/prototype/team", label: "Team", icon: Users },
  { href: "/prototype/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav className="fixed top-0 left-0 bottom-0 w-72 bg-surface-900 border-r border-surface-700/50 z-50 flex flex-col lg:hidden">
            <div className="flex items-center justify-between p-4 border-b border-surface-700/50">
              <span className="text-lg font-bold text-brand-400">MyClipIQ</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-500/10 text-brand-400"
                        : "text-surface-300 hover:bg-surface-800 hover:text-surface-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
