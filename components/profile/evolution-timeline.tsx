import { Brain, Target, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvolutionEvent } from "@/lib/mock/types";

const iconMap = {
  user: User,
  brain: Brain,
  target: Target,
};

type EvolutionTimelineProps = {
  events: EvolutionEvent[];
};

export function EvolutionTimeline({ events }: EvolutionTimelineProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold">Evolution Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-6 border-l-2 border-hoolclone-green-100 pl-6">
          {events.map((event) => {
            const Icon = iconMap[event.icon];
            return (
              <li key={event.day} className="relative">
                <span className="absolute -left-[31px] flex h-8 w-8 items-center justify-center rounded-full bg-hoolclone-green-100">
                  <Icon className="h-4 w-4 text-hoolclone-green-700" />
                </span>
                <p className="text-xs font-medium text-muted-foreground">
                  Day {event.day}
                </p>
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
