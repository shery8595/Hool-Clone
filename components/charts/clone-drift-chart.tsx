"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriftComparisonExample } from "@/components/clone/drift-comparison-example";
import type { CloneDriftPoint } from "@/lib/stats/clone-analytics";
import { TrendingUp } from "lucide-react";

type CloneDriftChartProps = {
  data: CloneDriftPoint[];
  title?: string;
};

export function CloneDriftChart({
  data,
  title = "Clone Drift — How much does your clone resemble you?",
}: CloneDriftChartProps) {
  const chartData = data.map((d) => ({
    day: `Day ${d.day}`,
    resemblance: d.resemblancePercent,
    sampleCount: d.sampleCount,
    lowData: d.lowData,
  }));

  const firstExample = data.find((d) => d.example?.difference === "large")?.example;
  const lastExample =
    [...data].reverse().find((d) => d.example?.difference === "small")?.example ??
    data[data.length - 1]?.example;

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-hoolclone-green-700" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Memory shapes clone behavior — resemblance is computed from winner and
          scoreline alignment on shared predictions.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip
                formatter={(value, _name, item) => {
                  const payload = item.payload as {
                    sampleCount?: number;
                    lowData?: boolean;
                  };
                  const suffix =
                    payload.lowData && payload.sampleCount != null
                      ? ` (${payload.sampleCount} match${payload.sampleCount === 1 ? "" : "es"}, low data)`
                      : payload.sampleCount != null
                        ? ` (${payload.sampleCount} match${payload.sampleCount === 1 ? "" : "es"})`
                        : "";
                  return [`${value}%${suffix}`, "Resemblance"];
                }}
              />
              <Line
                type="monotone"
                dataKey="resemblance"
                stroke="var(--hoolclone-green-700, #0a3d2e)"
                strokeWidth={2}
                dot={{ r: 5, fill: "#f5c518" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {firstExample && (
            <DriftComparisonExample
              userPick={firstExample.userPick}
              clonePick={firstExample.clonePick}
              difference={firstExample.difference}
            />
          )}
          {lastExample && lastExample !== firstExample && (
            <DriftComparisonExample
              userPick={lastExample.userPick}
              clonePick={lastExample.clonePick}
              difference={lastExample.difference}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
