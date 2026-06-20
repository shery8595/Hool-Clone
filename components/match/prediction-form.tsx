"use client";

import { useState } from "react";
import { User, Zap, Smile, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { EmotionState, Match } from "@/lib/mock/types";
import { Check } from "lucide-react";
import { TeamFlag } from "./team-flag";

type PredictionFormProps = {
  match: Match;
  initialWinner?: string;
  initialHomeScore?: number;
  initialAwayScore?: number;
  initialConfidence?: number;
  initialReasoning?: string;
  initialEmotion?: EmotionState;
  locked?: boolean;
  submitting?: boolean;
  onSubmit?: (input: {
    winner: string;
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning: string;
    emotion: EmotionState;
  }) => void | Promise<void>;
};

const emotions: { id: EmotionState; label: string; icon: React.ReactNode }[] =
  [
    { id: "calm", label: "Calm", icon: <Smile className="h-4 w-4" /> },
    { id: "nervous", label: "Nervous", icon: null },
    { id: "hyped", label: "Hyped", icon: <Zap className="h-4 w-4" /> },
  ];

type PlayableMatch = Match & {
  homeTeam: NonNullable<Match["homeTeam"]>;
  awayTeam: NonNullable<Match["awayTeam"]>;
};

export function PredictionForm(props: PredictionFormProps) {
  const { match } = props;
  if (!match.homeTeam || !match.awayTeam) return null;
  return (
    <PredictionFormInner
      {...props}
      match={{ ...match, homeTeam: match.homeTeam, awayTeam: match.awayTeam }}
    />
  );
}

function PredictionFormInner({
  match,
  initialWinner,
  initialHomeScore = 1,
  initialAwayScore = 2,
  initialConfidence = 65,
  initialReasoning = "",
  initialEmotion = "hyped",
  locked = false,
  submitting = false,
  onSubmit,
}: PredictionFormProps & { match: PlayableMatch }) {
  const teams = [match.homeTeam, match.awayTeam];
  const [winner, setWinner] = useState(initialWinner ?? match.homeTeam.code);
  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [confidence, setConfidence] = useState(initialConfidence);
  const [reasoning, setReasoning] = useState(
    initialReasoning ||
      "Argentina's midfield control wins tight games.",
  );
  const [emotion, setEmotion] = useState<EmotionState>(initialEmotion);

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-hoolclone-green-700" />
          Your Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <fieldset disabled={locked} className="space-y-6">
          <div>
            <legend className="mb-3 text-sm font-semibold">
              Q1: Who will win?
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {teams.map((team) => (
                <button
                  key={team.code}
                  type="button"
                  onClick={() => setWinner(team.code)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition-colors",
                    winner === team.code
                      ? "border-hoolclone-green-700 bg-hoolclone-green-100"
                      : "border-border hover:border-hoolclone-green-700/50",
                  )}
                >
                  <TeamFlag team={team} size="md" />
                  {team.name}
                  {winner === team.code && (
                    <Check className="h-4 w-4 text-hoolclone-green-700" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <legend className="mb-3 text-sm font-semibold">
              Q2: What&apos;s the score?
            </legend>
            <div className="flex items-center gap-3">
              <ScoreInput
                label={match.homeTeam.name}
                value={homeScore}
                onChange={setHomeScore}
              />
              <span className="text-muted-foreground">—</span>
              <ScoreInput
                label={match.awayTeam.name}
                value={awayScore}
                onChange={setAwayScore}
              />
            </div>
          </div>

          <div>
            <legend className="mb-3 text-sm font-semibold">
              Q3: How confident are you?
            </legend>
            <div className="space-y-2">
              <Slider
                value={[confidence]}
                onValueChange={(v) => {
                  const next = Array.isArray(v) ? v[0] : v;
                  if (typeof next === "number") setConfidence(next);
                }}
                max={100}
                step={5}
                aria-label="Prediction confidence"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-bold text-foreground">{confidence}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div>
            <legend className="mb-3 text-sm font-semibold">
              Q4: Why do you think this will happen?
            </legend>
            <Textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              maxLength={200}
              rows={3}
              aria-label="Prediction reasoning"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {reasoning.length}/200
            </p>
          </div>

          <div>
            <legend className="mb-3 text-sm font-semibold">
              Q5: How are you feeling about this match?
            </legend>
            <div className="flex flex-wrap gap-2">
              {emotions.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEmotion(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    emotion === id
                      ? "bg-hoolclone-yellow-500 text-hoolclone-gray-900"
                      : "border border-border bg-white hover:bg-hoolclone-gray-50",
                  )}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        {!locked && (
          <Button
            className="w-full"
            disabled={submitting}
            onClick={() =>
              void onSubmit?.({
                winner,
                homeScore,
                awayScore,
                confidence,
                reasoning,
                emotion,
              })
            }
          >
            <Shield className="mr-2 h-4 w-4" />
            {submitting ? "Saving..." : "Lock In Prediction"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1">
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <input
        type="number"
        min={0}
        max={9}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-center text-lg font-bold"
        aria-label={`${label} score`}
      />
    </div>
  );
}
