export default function EvolutionLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-5 pb-8">
      <div className="h-9 w-40 rounded-full bg-muted" />
      <div className="rounded-2xl border border-muted bg-gradient-to-br from-muted/30 to-muted/10 p-6">
        <div className="flex gap-4">
          <div className="h-24 w-24 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-8 w-56 rounded-lg bg-muted" />
            <div className="h-4 w-72 max-w-full rounded bg-muted" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="h-24 rounded-2xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-muted" />
        <div className="h-72 rounded-2xl bg-muted" />
      </div>
      <div className="h-96 rounded-2xl bg-muted" />
    </div>
  );
}
