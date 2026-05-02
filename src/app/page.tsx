import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 flex items-center justify-center px-8">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Hero headline */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="gradient-text">AI intelligence</span>
            <br />
            for every video you edit.
          </h1>
          <p className="text-xl text-surface-300 max-w-lg mx-auto">
            MyClipIQ analyzes your clips and automatically optimizes them for each
            social platform — so your content reaches the right audience, every time.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-8 py-3.5 rounded-xl gradient-accent text-white font-semibold text-lg hover:opacity-90 transition"
          >
            Start now — it&apos;s free
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-200 font-medium text-lg hover:bg-surface-700 transition"
          >
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-sm text-surface-400">
          AI-powered content intelligence for creators. No credit card required.
        </p>
      </div>
    </div>
  );
}