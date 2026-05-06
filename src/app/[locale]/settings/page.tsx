"use client";

import { useTranslations, useLocale } from "next-intl";
import Header from "../../components/Header";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();

  return (
    <>
      <Header title={t("title")} subtitle={t("subtitle")} />
      <div className="p-4 md:p-6">
        <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">{t("languageTitle")}</h3>
          <p className="text-sm text-surface-300 mb-4">{t("languageDesc")}</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-300">{t("currentLanguage")}</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase">
              {locale}
            </span>
          </div>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
