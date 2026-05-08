"use client";

import { useState } from "react";

const locales = ["en", "pt", "es"] as const;
type Locale = (typeof locales)[number];

interface LanguageSwitcherProps {
  activeLocale?: Locale;
  onChange?: (locale: Locale) => void;
}

export default function LanguageSwitcher({
  activeLocale = "en",
  onChange,
}: LanguageSwitcherProps) {
  const [current, setCurrent] = useState<Locale>(activeLocale);

  const handleChange = (newLocale: Locale) => {
    setCurrent(newLocale);
    onChange?.(newLocale);
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-surface-700/50 bg-surface-800 p-0.5">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all duration-150 ${
            current === loc
              ? "bg-brand-500/15 text-brand-400"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-700/50"
          }`}
          aria-pressed={current === loc}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
