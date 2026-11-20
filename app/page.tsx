import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md p-8 border border-ash rounded-cards bg-canvas-white shadow-subtle text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-tags bg-paper-mist border border-ash text-caption text-graphite font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-electric-blue"></span>
          km-scrum internal workspace
        </div>
        
        <h1 className="text-2xl font-medium text-charcoal tracking-tight mb-2">
          Team Management & Task Tracker
        </h1>
        <p className="text-sm text-steel mb-8">
          Internal workflow management for Manager, Scrum Master, and Developer teams.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-midnight-ink hover:bg-charcoal text-white text-sm font-medium rounded-buttons transition-colors flex items-center justify-center shadow-subtle"
          >
            Sign in to Workspace
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-fog">
        Restricted internal platform &bull; Authorized personnel only
      </p>
    </div>
  );
}
