"use client";

import { useTranslations } from "next-intl";
import Header from "../../components/Header";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");

  return (
    <>
      <Header title={t("title")} subtitle={t("subtitle")} />

      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold mb-2">{t("comingSoon.title")}</h3>
          <p className="text-sm text-surface-300 max-w-sm mb-8">
            {t("comingSoon.description")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
            {(t.raw("comingSoon.features") as string[]).map((feature: string, idx: number) => (
              <div
                key={idx}
                className="bg-surface-900 rounded-xl p-4 border border-surface-700/50 text-center"
              >
                <p className="text-sm font-medium text-surface-200">{feature}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800 border border-surface-700/50 text-xs text-surface-400">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            {t("comingSoon.phase")}
          </div>
        </div>
      </div>
    </>
  );
}
