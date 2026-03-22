import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Score } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { CheckCircle2, HelpCircle, XCircle, MinusCircle, Edit2 } from 'lucide-react';

interface ScoringPanelProps {
  stepInstruction: string;
  automatedScore: Score | null;
  onScoreSubmit: (score: Score) => void;
  onSkip?: () => void;
  allowOverride?: boolean;
  hints?: string[];
  simpleMode?: boolean;
}

const scoreOptions: {
  value: Score;
  label: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    value: 2,
    label: 'Independent',
    description: 'Completed without assistance',
    icon: CheckCircle2,
    colorClass: 'border-success text-success hover:bg-success/10',
    bgClass: 'text-success',
  },
  {
    value: 1,
    label: 'With Help',
    description: 'Needed verbal or physical help',
    icon: HelpCircle,
    colorClass: 'border-warning text-warning hover:bg-warning/10',
    bgClass: 'text-warning',
  },
  {
    value: 0,
    label: 'Unable',
    description: 'Could not complete even with help',
    icon: XCircle,
    colorClass: 'border-destructive text-destructive hover:bg-destructive/10',
    bgClass: 'text-destructive',
  },
  {
    value: 'N/A',
    label: 'N/A',
    description: 'Does not apply',
    icon: MinusCircle,
    colorClass: 'border-muted-foreground text-muted-foreground hover:bg-muted',
    bgClass: 'text-muted-foreground',
  },
];

export const ScoringPanel: React.FC<ScoringPanelProps> = ({
  automatedScore,
  onScoreSubmit,
  allowOverride = true,
  simpleMode = true,
}) => {
  const [showOverride, setShowOverride] = useState(false);

  // Automated score detected — show accept + optional override
  if (automatedScore !== null && !showOverride) {
    const detected = scoreOptions.find((o) => o.value === automatedScore);
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
        <div className="rounded-lg bg-muted/50 border px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Auto-detected score</p>
            <p className={cn('font-semibold', detected?.bgClass)}>
              {detected?.label ?? String(automatedScore)}
            </p>
          </div>
          {detected && <detected.icon className={cn('h-6 w-6', detected.bgClass)} />}
        </div>

        <Button onClick={() => onScoreSubmit(automatedScore)} className="w-full" size="lg">
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

  // Manual scoring or override — tap a button = immediate advance
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {showOverride ? 'Select the correct score:' : 'How did the patient do?'}
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
        {scoreOptions.map((option) => (
          <button
            key={String(option.value)}
            onClick={() => onScoreSubmit(option.value)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all touch-target active:scale-95',
              option.colorClass,
            )}
          >
            <option.icon className="h-7 w-7" />
            <span className="font-semibold text-sm">{option.label}</span>
            {!simpleMode && (
              <span className="text-xs opacity-75 text-center leading-tight">
                {option.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
