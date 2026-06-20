"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BiasAxis } from "@/lib/mock/types";

type BiasRadarChartProps = {
  data: BiasAxis[];
  title?: string;
  description?: string;
  showLegend?: boolean;
  showStats?: boolean;
};

export function BiasRadarChart({
  data,
  title = "YOUR BIAS RADAR",
  description = "Computed from real predictions, memories, and clone behavior.",
  showLegend = true,
  showStats = true,
}: BiasRadarChartProps) {
  const chartData = data.map((d) => ({
    axis: d.label,
    you: d.you,
    clone: d.clone,
  }));

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wider">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div
          className="mx-auto h-72 min-h-[288px] w-full max-w-lg"
          role="img"
          aria-label={`Bias radar chart comparing you and your clone across ${data.map((d) => `${d.label}: you ${d.you}, clone ${d.clone}`).join("; ")}`}
        >
          <ResponsiveContainer width="100%" height={288}>
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="You"
                dataKey="you"
                stroke="#1a6b4a"
                fill="#1a6b4a"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Your clone"
                dataKey="clone"
                stroke="#1a6b4a"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {showStats && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {data.map((d) => (
              <div
                key={d.label}
                className="rounded-lg bg-hoolclone-gray-50 px-3 py-2 text-center"
              >
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-sm font-bold">
                  {d.you}/10
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
