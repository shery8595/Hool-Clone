"use client";

import { useEffect, useMemo, useState } from "react";
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

const CHART_HEIGHT = 224;
const LINE_COLOR = "#1a6b4a";
const DOT_COLOR = "#f5c518";

type CloneDriftChartProps = {
  data: CloneDriftPoint[];
  title?: string;
};

type ChartRow = {
  day: string;
  resemblance: number;
  sampleCount: number;
  lowData: boolean;
};

function DriftTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ChartRow }>;
}) {
  if (!active || !payload?.[0]?.payload) return null;

  const point = payload[0].payload;
  const suffix =
    point.lowData && point.sampleCount != null
      ? ` (${point.sampleCount} match${point.sampleCount === 1 ? "" : "es"}, low data)`
      : point.sampleCount != null
        ? ` (${point.sampleCount} match${point.sampleCount === 1 ? "" : "es"})`
        : "";

  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-hoolclone-gray-900">
        {point.resemblance}% resemblance{suffix}
      </p>
    </div>
  );
}

export function CloneDriftChart({
  data,
  title = "Clone Drift — How much does your clone resemble you?",
}: CloneDriftChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo<ChartRow[]>(
    () =>
      data.map((d) => ({
        day: `Day ${d.day}`,
        resemblance: d.resemblancePercent,
        sampleCount: d.sampleCount,
        lowData: d.lowData,
      })),
    [data],
  );

  const hasDriftData = data.some((d) => d.sampleCount > 0);

  const firstExample = data.find((d) => d.example?.difference === "large")?.example;
  const lastExample =
    [...data].reverse().find((d) => d.example?.difference === "small")?.example ??
    data[data.length - 1]?.example;

  return (
    <Card className="min-w-0 rounded-2xl border-0 shadow-sm">
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
        {!hasDriftData ? (
          <div
            className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground"
            style={{ height: CHART_HEIGHT }}
          >
            Make predictions alongside your clone to unlock the drift chart.
          </div>
        ) : (
          <div
            className="w-full min-w-0"
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label="Clone resemblance over time"
          >
            {mounted ? (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                    unit="%"
                    width={40}
                  />
                  <Tooltip content={<DriftTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="resemblance"
                    stroke={LINE_COLOR}
                    strokeWidth={2}
                    dot={{ r: 4, fill: DOT_COLOR, stroke: LINE_COLOR, strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: DOT_COLOR, stroke: LINE_COLOR, strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full animate-pulse rounded-xl bg-muted/30" />
            )}
          </div>
        )}

        {hasDriftData && (
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
        )}
      </CardContent>
    </Card>
  );
}
