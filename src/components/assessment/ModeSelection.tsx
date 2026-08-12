import React from 'react';
import { cn } from '@/lib/utils';
import { AssessmentMode } from '@/types/assessment';
import { ClipboardCheck, Activity, RefreshCw, ArrowRight } from 'lucide-react';

interface ModeSelectionProps {
  onSelect: (mode: AssessmentMode) => void;
}

const MODES: {
  id: AssessmentMode;
  title: string;
  description: string;
  Icon: React.ElementType;
  border: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'assessment',
    title: 'Assessment Mode',
    description: 'Standardized evaluation. No hints or assistance.',
    Icon: ClipboardCheck,
    border: 'border-primary hover:bg-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    id: 'rehabilitation',
    title: 'Rehabilitation Mode',
    description: 'Guided practice with therapist-delivered cues.',
    Icon: Activity,
    border: 'border-chart-1 hover:bg-chart-1/5',
    iconBg: 'bg-chart-1/10',
    iconColor: 'text-chart-1',
  },
  {
    id: 'reassessment',
    title: 'Reassessment Mode',
    description: 'Follow-up evaluation with alternate task content.',
    Icon: RefreshCw,
    border: 'border-chart-2 hover:bg-chart-2/5',
    iconBg: 'bg-chart-2/10',
    iconColor: 'text-chart-2',
  },
];

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelect }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Select Assessment Mode</h1>
          <p className="text-muted-foreground">Choose the mode that matches the clinical context.</p>
        </div>

        <div className="space-y-3">
          {MODES.map(({ id, title, description, Icon, border, iconBg, iconColor }) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={cn(
                'w-full flex items-center gap-4 rounded-xl border-2 bg-card p-5 text-left transition-all active:scale-[0.99]',
                border,
              )}
            >
              <div className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl', iconBg)}>
                <Icon className={cn('h-6 w-6', iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{title}</div>
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
