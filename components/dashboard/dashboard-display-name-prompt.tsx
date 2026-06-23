"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { updateProfile } from "@/lib/api/client";
import { useUser } from "@/components/providers/user-provider";
import { cn } from "@/lib/utils";

type DashboardDisplayNamePromptProps = {
  className?: string;
};

export function DashboardDisplayNamePrompt({
  className,
}: DashboardDisplayNamePromptProps) {
  const { refresh } = useUser();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a name first.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateProfile({ displayName: trimmed });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save name.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-hoolclone-green-800">
          Clone command center
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-hoolclone-green-950 sm:text-3xl">
          What should we call you?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pick a name your clone can shout at you during live goals.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. Marco, GoonerMike, Capitano"
          maxLength={50}
          autoComplete="nickname"
          className="h-11 flex-1 rounded-xl border border-hoolclone-green-200 bg-white px-4 text-sm text-hoolclone-gray-900 shadow-sm outline-none ring-hoolclone-green-700/20 placeholder:text-muted-foreground focus:ring-2"
        />
        <button
          type="submit"
          disabled={saving || !value.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-hoolclone-green-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-hoolclone-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Save name
        </button>
      </form>

      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}
