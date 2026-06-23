export default function PublicProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-5 pb-8">
      <div className="rounded-2xl border border-muted bg-gradient-to-br from-muted/30 to-muted/10 p-6">
        <div className="flex gap-4">
          <div className="h-24 w-24 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-8 w-48 rounded-lg bg-muted" />
            <div className="h-4 w-64 max-w-full rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-7 w-20 rounded-full bg-muted" />
              <div className="h-7 w-24 rounded-full bg-muted" />
              <div className="h-7 w-16 rounded-full bg-muted" />
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted sm:col-span-2 xl:col-span-1" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-56 rounded-2xl bg-muted" />
        <div className="h-56 rounded-2xl bg-muted" />
      </div>
      <div className="h-64 rounded-2xl bg-muted" />
      <div className="h-48 rounded-2xl bg-muted" />
    </div>
  );
}
