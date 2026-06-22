export default function EvolutionLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="h-28 rounded-2xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-muted" />
        <div className="h-72 rounded-2xl bg-muted" />
      </div>
      <div className="h-96 rounded-2xl bg-muted" />
      <div className="h-64 rounded-2xl bg-muted" />
    </div>
  );
}
