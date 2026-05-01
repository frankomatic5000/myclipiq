export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          🎬 MyClipIQ
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered content intelligence for creators
        </p>
        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Get Started
          </a>
          <a
            href="https://github.com/frankomatic5000/myclipiq"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
