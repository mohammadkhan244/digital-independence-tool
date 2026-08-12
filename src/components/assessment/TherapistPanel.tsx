import React from 'react';
import { cn } from '@/lib/utils';
import { CueLevel } from '@/types/assessment';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

export const CUE_SEQUENCE = [
  { cueLabel: 'Verbal Cue',        buttonText: 'Give Verbal Cue' },
  { cueLabel: 'Visual Highlight',  buttonText: 'Give Visual Highlight' },
  { cueLabel: 'Demonstration',     buttonText: 'Show Demonstration' },
  { cueLabel: 'Step-by-Step',      buttonText: 'Show Step-by-Step' },
] as const;

export const computeRehabCueResult = (cueCount: number): { level: CueLevel; label: string } => {
  if (cueCount === 0) return { level: 3, label: 'Independent' };
  if (cueCount <= 2) return { level: 2, label: 'Verbal/Visual Cue' };
  return { level: 1, label: 'Demonstration' };
};

interface TherapistPanelProps {
  cueCount: number;
  taskCompleted: boolean;
  onGiveNextCue: () => void;
  onConfirmCompleted: () => void;
  onMarkUnable: () => void;
}

export const TherapistPanel: React.FC<TherapistPanelProps> = ({
  cueCount,
  taskCompleted,
  onGiveNextCue,
  onConfirmCompleted,
  onMarkUnable,
}) => {
  const allCuesGiven = cueCount >= CUE_SEQUENCE.length;
  const { label: cueLabel } = computeRehabCueResult(cueCount);
  const givenLabels = CUE_SEQUENCE.slice(0, cueCount).map(c => c.cueLabel);

  return (
    <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 text-white">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Therapist Controls
        </span>
        {cueCount > 0 && (
          <span className="text-xs text-gray-400 truncate ml-2">
            {givenLabels.join(' → ')}
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        {taskCompleted ? (
          <div className="space-y-2.5">
            <p className="text-sm text-gray-300">
              Task done — cue level:{' '}
              <span className="font-semibold text-white">{cueLabel}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={onConfirmCompleted}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </button>
              <button
                onClick={onMarkUnable}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800"
              >
                <XCircle className="h-4 w-4" />
                Unable
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm', cueCount === 0 ? 'text-gray-500' : 'text-gray-300')}>
                {cueCount === 0
                  ? 'No cues given yet'
                  : `${cueCount} cue${cueCount !== 1 ? 's' : ''} given`}
              </p>
            </div>
            {allCuesGiven ? (
              <button
                onClick={onMarkUnable}
                className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Mark Unable
              </button>
            ) : (
              <button
                onClick={onGiveNextCue}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                {CUE_SEQUENCE[cueCount]?.buttonText ?? 'Give Next Cue'}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
