export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6 pb-8">
      <div className="rounded-2xl border border-muted bg-gradient-to-br from-muted/30 to-muted/10 p-6">
        <div className="space-y-3">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-muted">
        <div className="h-10 border-b border-muted bg-muted/30" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex h-14 items-center gap-4 border-b border-muted/50 px-4 last:border-0"
          >
            <div className="h-4 w-8 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-4 w-10 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
