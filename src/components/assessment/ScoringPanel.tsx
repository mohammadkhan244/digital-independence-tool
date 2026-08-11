import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Score, CueLevel } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  HelpCircle,
  Eye,
  XCircle,
  Edit2,
} from 'lucide-react';

interface ScoringPanelProps {
  stepInstruction: string;
  automatedScore: Score | null;
  onScoreSubmit: (score: Score, cueLevel?: CueLevel, cueLabel?: string) => void;
  onSkip?: () => void;
  allowOverride?: boolean;
  hints?: string[];
  simpleMode?: boolean;
}

// 0–3 cue hierarchy — each maps to a legacy Score for backward compat
const cueOptions: {
  cueLevel: CueLevel;
  cueLabel: string;
  description: string;
  score: Score;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    cueLevel: 3,
    cueLabel: 'Independent',
    description: 'Completed without any assistance',
    score: 2,
    icon: CheckCircle2,
    colorClass: 'border-success text-success hover:bg-success/10',
    bgClass: 'text-success',
  },
  {
    cueLevel: 2,
    cueLabel: 'Verbal/Visual Cue',
    description: 'Completed after a hint or prompt',
    score: 1,
    icon: HelpCircle,
    colorClass: 'border-chart-1 text-chart-1 hover:bg-chart-1/10',
    bgClass: 'text-chart-1',
  },
  {
    cueLevel: 1,
    cueLabel: 'Demonstration',
    description: 'Completed after being shown how',
    score: 1,
    icon: Eye,
    colorClass: 'border-warning text-warning hover:bg-warning/10',
    bgClass: 'text-warning',
  },
  {
    cueLevel: 0,
    cueLabel: 'Unable',
    description: 'Could not complete, incorrect, or abandoned',
    score: 0,
    icon: XCircle,
    colorClass: 'border-destructive text-destructive hover:bg-destructive/10',
    bgClass: 'text-destructive',
  },
];

// Infer the default cue level from an auto-detected Score
const inferCueFromScore = (
  score: Score,
): { level: CueLevel; label: string } | null => {
  if (score === 2) return { level: 3, label: 'Independent' };
  if (score === 1) return { level: 2, label: 'Verbal/Visual Cue' };
  if (score === 0) return { level: 0, label: 'Unable' };
  return null; // N/A
};

export const ScoringPanel: React.FC<ScoringPanelProps> = ({
  automatedScore,
  onScoreSubmit,
  allowOverride = true,
  simpleMode = true,
}) => {
  const [showOverride, setShowOverride] = useState(false);

  // Auto-detected score — show accept + optional override
  if (automatedScore !== null && !showOverride) {
    const detectedCue = inferCueFromScore(automatedScore);

    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
        <div className="rounded-lg bg-muted/50 border px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Auto-detected</p>
            <div className="flex items-center gap-2">
              {detectedCue && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold flex-shrink-0">
                  {detectedCue.level}
                </span>
              )}
              <p className={cn('font-semibold', detectedCue ? 'text-success' : 'text-muted-foreground')}>
                {detectedCue?.label ?? (automatedScore === 'N/A' ? 'N/A' : String(automatedScore))}
              </p>
            </div>
          </div>
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>

        <Button
          onClick={() =>
            onScoreSubmit(automatedScore, detectedCue?.level, detectedCue?.label)
          }
          className="w-full"
          size="lg"
        >
          Accept &amp; Continue
        </Button>

        {allowOverride && (
          <Button
            variant="outline"
            onClick={() => setShowOverride(true)}
            className="w-full"
            size="sm"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Override Score
          </Button>
        )}
      </div>
    );
  }

  // Manual scoring or override — 4 cue-level cards
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {showOverride ? 'Select the correct cue level:' : 'How did the patient do?'}
        </p>
        {showOverride && (
          <button
            onClick={() => setShowOverride(false)}
            className="text-xs text-primary hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cueOptions.map((option) => (
          <button
            key={option.cueLevel}
            onClick={() => onScoreSubmit(option.score, option.cueLevel, option.cueLabel)}
            className={cn(
              'flex flex-col items-start gap-1.5 rounded-lg border-2 p-4 transition-all touch-target active:scale-95 text-left',
              option.colorClass,
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-current/20 text-sm font-bold flex-shrink-0">
                {option.cueLevel}
              </span>
              <option.icon className="h-5 w-5 opacity-70" />
            </div>
            <span className="font-semibold text-sm leading-tight">{option.cueLabel}</span>
            {!simpleMode && (
              <span className="text-xs opacity-70 leading-tight">
                {option.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
