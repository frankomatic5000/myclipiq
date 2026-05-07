"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  Upload,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Film,
} from "lucide-react";
import { sidebarNav, type NavItem } from "@/lib/mock/data";

const lucideMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  FolderOpen,
  Upload,
  Users,
  Settings,
};

function NavItemComponent({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = lucideMap[item.icon] || Film;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-out ${
        isActive
          ? "bg-brand-500/15 text-brand-400"
          : "text-surface-300 hover:bg-surface-800 hover:text-surface-100"
      } ${collapsed ? "justify-center" : ""}`}
      title={item.label}
    >
      <div className="relative">
        <Icon className="w-5 h-5 shrink-0" />
        {item.badge && collapsed && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-400" />
        )}
      </div>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex flex-col h-screen bg-surface-900 border-r border-surface-700/50 sticky top-0 shrink-0 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-surface-700/50 h-16 shrink-0 ${
          collapsed ? "justify-center px-2" : "px-5 gap-3"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
          <Film className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-surface-100 whitespace-nowrap">
              MyClipIQ
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarNav.map((item) => (
          <NavItemComponent
            key={item.id}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-surface-700/50">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-all duration-150 text-xs font-medium"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
