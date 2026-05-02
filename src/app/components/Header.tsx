"use client";

import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-700/50 px-4 md:px-6 py-4">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}
          className="md:hidden p-2 rounded-lg hover:bg-surface-800 text-surface-300"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold truncate">{title}</h2>
          <p className="text-sm text-surface-300 truncate">{subtitle}</p>
        </div>
        {actions && <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
