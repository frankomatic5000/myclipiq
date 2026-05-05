'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { routing } from '@/lib/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const t = useTranslations('languageSwitcher');

  const handleLocaleChange = (newLocale: string) => {
    setOpen(false);
    startTransition(() => {
      // Replace the locale segment in the pathname
      const segments = pathname.split('/');
      segments[1] = newLocale;
      router.push(segments.join('/'));
    });
  };

  const displayNames: Record<string, string> = {
    en: t('en'),
    pt: t('pt'),
    es: t('es'),
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-surface-800 border border-surface-700/50 text-surface-200 hover:bg-surface-700 transition disabled:opacity-50"
        aria-label={t('label')}
      >
        <span className="uppercase font-bold">{locale}</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-surface-700/50 bg-surface-900 shadow-lg z-20 overflow-hidden">
            {routing.locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full text-left px-4 py-2.5 text-sm transition ${
                  locale === loc
                    ? 'bg-brand-500/15 text-brand-400 font-medium'
                    : 'text-surface-200 hover:bg-surface-800'
                }`}
              >
                {displayNames[loc] || loc}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
