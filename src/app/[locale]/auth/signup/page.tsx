"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Link } from "@/lib/i18n/navigation";

export default function SignupPage() {
  const locale = useLocale();
  const t = useTranslations("auth.signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const sb = getSupabaseBrowser();
    const { error: signUpError } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
  }

  async function handleResendConfirmation(e: React.FormEvent) {
    e.preventDefault();
    setResending(true);
    setResendSuccess(false);

    const sb = getSupabaseBrowser();
    const { error: resendError } = await sb.auth.resend({
      type: "signup",
      email,
    });

    setResending(false);
    if (!resendError) {
      setResendSuccess(true);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface-900 rounded-2xl border border-surface-700/50 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text">{t("checkEmailTitle")}</h1>
            <p className="text-sm text-surface-300">{t("sentTo")}</p>
            <p className="text-sm font-medium text-brand-400">{email}</p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-sm text-surface-300">
              {t("instructions")}
            </p>

            {resendSuccess && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                {t("resent")}
              </div>
            )}

            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              className="w-full py-2.5 rounded-lg border border-surface-700 text-surface-200 font-medium hover:bg-surface-800 transition disabled:opacity-50"
            >
              {resending ? t("resending") : t("resend")}
            </button>
          </div>

          <p className="text-center text-sm text-surface-300">
            {t("alreadyConfirmed")}{" "}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition">
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-900 rounded-2xl border border-surface-700/50 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text">{t("title")}</h1>
          <p className="text-sm text-surface-300">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("fullName")}</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[44px]"
              placeholder={t("namePlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("email")}</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[44px]"
              placeholder={t("emailPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("password")}</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[44px]"
              placeholder={t("passwordPlaceholder")}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>

        <p className="text-center text-sm text-surface-300">
          {t("haveAccount")}{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}