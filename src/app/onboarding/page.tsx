import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="bg-surface-950 text-surface-100 min-h-screen">
      {/* Step Navigation */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-700/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-lg font-bold gradient-text">MyClipIQ</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer ${n === 1 ? "gradient-accent text-white" : "bg-surface-800 text-surface-400"}`}>{n}</div>
                {n < 4 && <div className="w-8 h-0.5 bg-surface-700" />}
              </div>
            ))}
          </div>
          <div className="text-sm text-surface-300">Step 1 of 4</div>
        </div>
      </div>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          {/* Step 1: Signup */}
          <div>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-surface-300">Start building your content intelligence pipeline</p>
            </div>

            <div className="space-y-4 mb-6">
              {[
                {
                  label: "Continue with Google",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  ),
                },
                {
                  label: "Continue with Apple",
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.23-.69.87-1.83 1.56-2.94 1.46-.15-1.15.41-2.35 1.04-3.19" />
                    </svg>
                  ),
                },
              ].map((p) => (
                <button key={p.label} className="w-full flex items-center gap-4 p-4 rounded-xl border border-surface-700/50 bg-surface-900 hover:bg-surface-800 transition">
                  {p.icon}
                  <span className="font-medium">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-700" /></div>
              <div className="relative flex justify-center"><span className="bg-surface-950 px-4 text-sm text-surface-300">or</span></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input type="text" placeholder="Rod Rezende" className="w-full px-4 py-3 rounded-lg bg-surface-900 border border-surface-700/50 text-surface-100 placeholder-surface-300/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" placeholder="rod@growbiz.com" className="w-full px-4 py-3 rounded-lg bg-surface-900 border border-surface-700/50 text-surface-100 placeholder-surface-300/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-lg bg-surface-900 border border-surface-700/50 text-surface-100 placeholder-surface-300/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              <button className="w-full py-3 rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition">Create Account</button>
            </div>

            <p className="text-center text-xs text-surface-300 mt-6">
              By signing up, you agree to our <Link href="/legal" className="text-brand-400 hover:underline">Terms</Link> and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}