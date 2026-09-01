import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PerformanceAnalytics, CueLevel } from '@/types/assessment';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { HomeScreen } from '@/components/phone/HomeScreen';
import { MessagesApp } from '@/components/phone/MessagesApp';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import {
  Play,
  ArrowRight,
  RotateCcw,
  Download,
  CheckCircle2,
  SkipForward,
} from 'lucide-react';

type DemoPhase = 'idle' | 'task' | 'results';
type DemoPhone = 'home' | 'messages';

const OVERRIDE_THRESHOLD = 5;

function buildAnalytics(
  navErrors: number,
  targetErrors: number,
  elapsed: number,
  usedOverride: boolean,
): PerformanceAnalytics {
  const totalMisclicks = navErrors + targetErrors;

  let cueLevel: CueLevel;
  let cueLabel: string;
  if (usedOverride) {
    cueLevel = 0; cueLabel = 'Unable';
  } else if (totalMisclicks === 0) {
    cueLevel = 3; cueLabel = 'Independent';
  } else if (totalMisclicks <= 2) {
    cueLevel = 2; cueLabel = 'Verbal/Visual Cue';
  } else {
    cueLevel = 1; cueLabel = 'Demonstration';
  }

  return {
    totalAssessmentTime: elapsed,
    totalMisclicks,
    totalBacktracks: 0,
    abandonedSteps: 0,
    averageTimePerStep: elapsed,
    errorProfile: {
      navigation: navErrors,
      targeting: targetErrors,
      sequencing: 0,
      attention: 0,
      abandonment: 0,
    },
    compositeScore: cueLevel,
    maxPossibleScore: 3,
    scorePercentage: (cueLevel / 3) * 100,
    totalPatientOverrides: usedOverride ? 1 : 0,
    moduleScores: [
      {
        moduleId: 'digital-comms',
        moduleName: 'Digital Communications',
        score: cueLevel,
        maxScore: 3,
        percentage: (cueLevel / 3) * 100,
        cueBreakdown: [
          {
            stepId: 'dc-step1',
            stepLabel: 'Send text message',
            cueLevel,
            cueLabel,
            completed: !usedOverride,
            patientOverrideUsed: usedOverride,
          },
        ],
      },
    ],
  };
}

export const DemoSection: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [phoneScreen, setPhoneScreen] = useState<DemoPhone>('home');
  const [navErrors, setNavErrors] = useState(0);
  const [targetErrors, setTargetErrors] = useState(0);
  const [demoAnalytics, setDemoAnalytics] = useState<PerformanceAnalytics | null>(null);
  const startTimeRef = useRef<number>(0);

  const misclickCount = navErrors + targetErrors;

  const handleStartDemo = () => {
    startTimeRef.current = Date.now();
    setPhase('task');
    setPhoneScreen('home');
    setNavErrors(0);
    setTargetErrors(0);
    setDemoAnalytics(null);
  };

  const handleReset = () => {
    setPhase('idle');
    setPhoneScreen('home');
    setNavErrors(0);
    setTargetErrors(0);
    setDemoAnalytics(null);
  };

  const finishDemo = (usedOverride: boolean) => {
    const elapsed = Date.now() - startTimeRef.current;
    setDemoAnalytics(buildAnalytics(navErrors, targetErrors, elapsed, usedOverride));
    setPhase('results');
  };

  const exportCSV = () => {
    if (!demoAnalytics) return;
    const step = demoAnalytics.moduleScores[0].cueBreakdown[0];
    const headers = 'Module,Step,CueLevel,CueLabel,Misclicks,TimeToCompletion_ms,Override';
    const row = [
      'Digital Communications',
      'Send text message',
      step.cueLevel,
      step.cueLabel,
      demoAnalytics.totalMisclicks,
      demoAnalytics.totalAssessmentTime,
      step.patientOverrideUsed,
    ].join(',');
    const csv = `${headers}\n${row}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eadl-demo-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Play className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Try a Sample Task</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm leading-relaxed">
          Experience the assessment firsthand. Complete one real task on a simulated phone — then see exactly how results and scoring are reported.
        </p>
        <Button size="lg" onClick={handleStartDemo} className="gap-2 w-full sm:w-auto">
          <Play className="h-4 w-4" />
          Start Demo Task
        </Button>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (phase === 'results' && demoAnalytics) {
    const usedOverride = demoAnalytics.totalPatientOverrides > 0;
    return (
      <div className="space-y-5">
        {/* Result header */}
        <div className={cn(
          'rounded-xl border p-5 text-center',
          usedOverride
            ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20'
            : 'border-green-300 bg-green-50 dark:bg-green-950/20',
        )}>
          {usedOverride ? (
            <>
              <SkipForward className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-foreground mb-1">Task Skipped via Override</h3>
              <p className="text-sm text-muted-foreground">Here's what the results look like when a task is overridden.</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-foreground mb-1">Task Completed!</h3>
              <p className="text-sm text-muted-foreground">Here's what the full results look like in the dashboard.</p>
            </>
          )}
        </div>

        {/* Dashboard — same component used in the real dashboard */}
        <AnalyticsDashboard analytics={demoAnalytics} />

        {/* Action row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} className="gap-2 flex-1 sm:flex-none min-h-[44px]">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="ghost" onClick={handleReset} className="gap-2 flex-1 sm:flex-none min-h-[44px]">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
          <Button onClick={() => navigate('/assessment')} className="gap-2 min-h-[44px]">
            Start Full Assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Task ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Task instruction card */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your task</p>
        <p className="font-semibold text-foreground text-base leading-snug">
          Text your daughter to let her know your appointment time.
        </p>
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
          <span className="text-amber-500 text-sm mt-0.5 shrink-0">⚠</span>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Open Messages, find Emma (Daughter), and send her a text message
          </p>
        </div>
      </div>

      {/* Misclick badge */}
      {misclickCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm text-destructive font-medium">
            Wrong taps: {misclickCount}
          </span>
          {misclickCount >= OVERRIDE_THRESHOLD && (
            <span className="text-muted-foreground text-xs">Override available ↓</span>
          )}
        </div>
      )}

      {/* Phone simulator */}
      <div className="flex justify-center">
        <PhoneFrame className="w-[320px]" time="9:41">
          {phoneScreen === 'home' && (
            <HomeScreen
              onAppTap={(id) => { if (id === 'messages') setPhoneScreen('messages'); }}
              onMisclick={() => setNavErrors(p => p + 1)}
              targetApps={['messages']}
              simpleMode
              showHint
            />
          )}
          {phoneScreen === 'messages' && (
            <MessagesApp
              key="demo-messages"
              onBack={() => setPhoneScreen('home')}
              onContactSelect={() => {}}
              onSendMessage={() => finishDemo(false)}
              onMisclick={() => setTargetErrors(p => p + 1)}
              targetContact="daughter"
              simpleMode
              showHint
            />
          )}
        </PhoneFrame>
      </div>

      {/* Override panel — appears after 5 misclicks */}
      {misclickCount >= OVERRIDE_THRESHOLD && (
        <div className="rounded-xl border-2 border-orange-400 bg-orange-50 dark:bg-orange-950/30 p-5 text-center space-y-3">
          <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
            Having trouble with this task?
          </p>
          <button
            onClick={() => finishDemo(true)}
            className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-lg py-4 px-6 transition-colors min-h-[56px]"
          >
            OVERRIDE
          </button>
          <p className="text-xs text-muted-foreground">
            Press OVERRIDE to skip this task and see the results.
          </p>
        </div>
      )}
    </div>
  );
};
