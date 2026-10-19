import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadAllSessions } from '@/hooks/useAssessmentPersistence';
import { computeAnalytics } from '@/hooks/useAssessment';

interface BaselineSessionPickerProps {
  onConfirm: (baselineSessionId: string | null) => void;
  onCancel: () => void;
}

export const BaselineSessionPicker: React.FC<BaselineSessionPickerProps> = ({ onConfirm, onCancel }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const sessions = useMemo(() => {
    return loadAllSessions()
      .filter(s => (s.assessmentMode === 'assessment' || s.assessmentMode === 'reassessment') && !!s.endTime)
      .sort((a, b) => b.startTime - a.startTime);
  }, []);

  const sessionAnalytics = useMemo(() => {
    return sessions.map(s => ({ session: s, analytics: computeAnalytics(s) }));
  }, [sessions]);

  const scorePillColor = (pct: number) =>
    pct < 50
      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
      : pct <= 75
      ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800'
      : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800';

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatDuration = (ms: number) => {
    const mins = Math.round(ms / 60000);
    return mins < 1 ? '<1 min' : `${mins} min`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Personalize This Session</h1>
            <p className="text-sm text-muted-foreground">Link to a past assessment to focus on weak areas.</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center">
            <BarChart2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground mb-1">No completed assessments found</p>
            <p className="text-sm text-muted-foreground mb-5">
              Complete an assessment first to enable personalized rehab sessions.
            </p>
            <Button variant="outline" className="w-full" onClick={() => onConfirm(null)}>
              Continue without baseline
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-5 max-h-[55vh] overflow-y-auto pr-1">
              {sessionAnalytics.map(({ session, analytics }) => {
                const isSelected = selected === session.id;
                const overallPct = analytics ? Math.round(analytics.scorePercentage) : null;
                const duration = session.endTime ? session.endTime - session.startTime : null;

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelected(isSelected ? null : session.id)}
                    className={cn(
                      'w-full rounded-xl border-2 bg-card p-4 text-left transition-all',
                      isSelected
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {session.assessmentMode} · {session.difficultyMode} mode
                          </span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatDate(session.startTime)}</p>
                        {duration && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDuration(duration)}
                          </div>
                        )}
                      </div>
                      {overallPct !== null && (
                        <div className={cn('rounded-full border px-2.5 py-1 text-sm font-bold flex-shrink-0', scorePillColor(overallPct))}>
                          {overallPct}%
                        </div>
                      )}
                    </div>

                    {analytics && analytics.moduleScores.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analytics.moduleScores.map(ms => (
                          <div
                            key={ms.moduleId}
                            className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', scorePillColor(ms.percentage))}
                          >
                            {ms.moduleName}: {Math.round(ms.percentage)}%
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={!selected}
                onClick={() => onConfirm(selected)}
              >
                Use as Baseline
              </Button>
              <Button variant="outline" className="w-full" onClick={() => onConfirm(null)}>
                Skip / No Baseline
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
