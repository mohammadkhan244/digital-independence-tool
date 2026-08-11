import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/hooks/useAssessment';
import { eadlModules, getModuleIcon } from '@/data/modules';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { HomeScreen } from '@/components/phone/HomeScreen';
import { MessagesApp } from '@/components/phone/MessagesApp';
import { GmailApp } from '@/components/phone/GmailApp';
import { TelehealthCall } from '@/components/phone/TelehealthCall';
import { MyChartPortal } from '@/components/portal/MyChartPortal';
import { ScoringPanel } from '@/components/assessment/ScoringPanel';
import { OpenEndedQuestion } from '@/components/assessment/OpenEndedQuestion';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  ChevronRight,
  Sliders,
  RotateCcw,
  PartyPopper,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { DifficultyMode, Score, ErrorType, CueLevel } from '@/types/assessment';

type PhoneScreen =
  | 'home'
  | 'messages'
  | 'messages-conversation'
  | 'gmail'
  | 'telehealth';

type MyChartScreen = 'results' | 'appointments' | 'messages';

// Static "coming soon" placeholders shown below the active modules
const comingSoonModules = [
  {
    name: 'Money Management',
    icon: '💳',
    category: 'Module 3',
    description: 'Use a banking app to check balances, pay bills, and handle security alerts.',
  },
  {
    name: 'Shopping & Pharmacy',
    icon: '🛒',
    category: 'Module 4',
    description: 'Order products online and manage pharmacy prescriptions.',
  },
  {
    name: 'Transportation & Navigation',
    icon: '📍',
    category: 'Module 5',
    description: 'Use maps and ride-sharing apps to get around.',
  },
  {
    name: 'Social & Leisure',
    icon: '▶️',
    category: 'Module 6',
    description: 'Use streaming services and entertainment apps for everyday enjoyment.',
  },
  {
    name: 'Home & Safety',
    icon: '🛡️',
    category: 'Module 7',
    description: 'Manage reminders, respond to alerts, and access emergency services.',
  },
];

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const {
    session,
    isRunning,
    savedProgressExists,
    clearProgress,
    resetAssessment,
    startAssessment,
    completeStep,
    recordMisclick,
    jumpToModule,
    setOpenEndedResponse,
    setDifficultyMode,
    getCurrentContext,
  } = useAssessment();

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showModuleOverview, setShowModuleOverview] = useState(true);
  const [phoneScreen, setPhoneScreen] = useState<PhoneScreen>('home');
  const [myChartScreen, setMyChartScreen] = useState<MyChartScreen>('results');
  const [showOpenEnded, setShowOpenEnded] = useState(false);
  const [automatedScore, setAutomatedScore] = useState<Score | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [completedModuleInfo, setCompletedModuleInfo] = useState<{
    name: string;
    question: string;
    moduleId: string;
  } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  const context = getCurrentContext();
  const currentModule = context?.module;
  const currentStep = context?.step;
  const stepIndex = context?.stepIndex ?? 0;

  const simpleMode = session?.difficultyMode === 'simple';
  const showHints = simpleMode;

  const isDCModule = currentModule?.id === 'digital-comms';
  const isEHRModule = currentModule?.id === 'ehr';

  // Show resume prompt on mount if saved progress exists
  useEffect(() => {
    if (!isRunning && !session && savedProgressExists) {
      setShowResumePrompt(true);
    }
  }, [isRunning, session, savedProgressExists]);

  // ─── Step synchronization ─────────────────────────────────────
  useEffect(() => {
    if (!currentStep || !currentModule) return;
    setStepCompleted(false);
    setAutomatedScore(null);

    const mid = currentModule.id;
    const sid = currentStep.id;

    if (mid === 'digital-comms') {
      switch (sid) {
        case 'dc-step1': setPhoneScreen('home'); break;
        case 'dc-step2': setPhoneScreen('gmail'); break;
        case 'dc-step3': setPhoneScreen('telehealth'); break;
      }
    } else if (mid === 'ehr') {
      switch (sid) {
        case 'ehr-step1': setMyChartScreen('results'); break;
        case 'ehr-step2': setMyChartScreen('appointments'); break;
        case 'ehr-step3': setMyChartScreen('messages'); break;
      }
    }
  }, [currentModule?.id, currentStep?.id]);

  // ─── Step completion ──────────────────────────────────────────
  const handleStepComplete = useCallback(
    (score: Score, cueLevel?: CueLevel, cueLabel?: string) => {
      const isLastStep =
        currentModule != null && stepIndex >= currentModule.steps.length - 1;
      if (isLastStep && currentModule) {
        setCompletedModuleInfo({
          name: currentModule.name,
          question: currentModule.openEndedQuestion,
          moduleId: currentModule.id,
        });
      }

      setAutomatedScore(null);
      setStepCompleted(false);
      completeStep(score, undefined, cueLevel, cueLabel);

      if (isLastStep) {
        setShowCongrats(true);
      }
    },
    [completeStep, currentModule, stepIndex],
  );

  // ─── Digital Comms: SMS handlers ─────────────────────────────
  const handleAppTap = useCallback(
    (appId: string) => {
      if (stepCompleted) return;
      const sid = currentStep?.id;
      if (sid === 'dc-step1' && appId === 'messages') {
        setPhoneScreen('messages');
      }
    },
    [currentStep, stepCompleted],
  );

  const handleContactSelect = useCallback(
    (contactId: string) => {
      if (stepCompleted) return;
      const sid = currentStep?.id;
      if (sid === 'dc-step1' && contactId === 'daughter') {
        setPhoneScreen('messages-conversation');
      }
    },
    [currentStep, stepCompleted],
  );

  const handleSendMessage = useCallback(
    (_message: string) => {
      if (stepCompleted) return;
      if (currentStep?.id === 'dc-step1') {
        setAutomatedScore(2);
        setStepCompleted(true);
      }
    },
    [currentStep, stepCompleted],
  );

  // ─── Digital Comms: Gmail handler ────────────────────────────
  const handleGmailAction = useCallback(
    (action: string) => {
      if (stepCompleted) return;
      if (action === 'send_email' && currentStep?.id === 'dc-step2') {
        setAutomatedScore(2);
        setStepCompleted(true);
      }
    },
    [currentStep, stepCompleted],
  );

  // ─── Digital Comms: Telehealth handler ───────────────────────
  const handleTelehealthAction = useCallback(
    (action: string) => {
      if (stepCompleted) return;
      if (action === 'toggle_mute' && currentStep?.id === 'dc-step3') {
        setAutomatedScore(2);
        setStepCompleted(true);
      }
    },
    [currentStep, stepCompleted],
  );

  // ─── EHR: MyChart handlers ────────────────────────────────────
  const handleMyChartAction = useCallback(
    (action: string) => {
      if (stepCompleted) return;
      const sid = currentStep?.id;
      switch (action) {
        case 'open_result':
          if (sid === 'ehr-step1') { setAutomatedScore(2); setStepCompleted(true); }
          break;
        case 'view_appointment':
          if (sid === 'ehr-step2') { setAutomatedScore(2); setStepCompleted(true); }
          break;
        case 'send_message':
          if (sid === 'ehr-step3') { setAutomatedScore(2); setStepCompleted(true); }
          break;
      }
    },
    [currentStep, stepCompleted],
  );

  // ─── Misclick helper ──────────────────────────────────────────
  const handleMisclick = useCallback(
    (errorType: ErrorType = 'targeting') => {
      recordMisclick(errorType);
    },
    [recordMisclick],
  );

  // ─── Module overview helpers ───────────────────────────────────

  // A module is completed when all its steps have been scored
  const isModuleCompleted = useCallback(
    (moduleId: string): boolean => {
      if (!session) return false;
      const result = session.moduleResults.find(r => r.moduleId === moduleId);
      if (!result) return false;
      const def = eadlModules.find(m => m.id === moduleId);
      return result.stepResults.length >= (def?.steps.length ?? 0);
    },
    [session],
  );

  // Enter a specific module by index — supports non-sequential access
  const handleEnterSpecificModule = useCallback(
    (moduleIndex: number) => {
      if (!session) {
        startAssessment(true, false, moduleIndex);
      } else {
        jumpToModule(moduleIndex);
      }
      setShowModuleOverview(false);
    },
    [session, startAssessment, jumpToModule],
  );

  // Keep the old name for the CTA button (resumes from wherever we are)
  const handleEnterModule = useCallback(() => {
    handleEnterSpecificModule(session ? session.currentModuleIndex : 0);
  }, [handleEnterSpecificModule, session]);

  // ─── Open-ended response ──────────────────────────────────────
  const handleOpenEndedSubmit = useCallback(
    (response: string) => {
      if (completedModuleInfo) {
        setOpenEndedResponse(completedModuleInfo.moduleId, response);
      }
      setShowOpenEnded(false);
      setShowCongrats(false);
      setCompletedModuleInfo(null);
      if (session?.endTime) {
        navigate('/dashboard');
      } else {
        setShowModuleOverview(true);
      }
    },
    [setOpenEndedResponse, completedModuleInfo, session, navigate],
  );

  // ─── Difficulty / restart ─────────────────────────────────────
  const toggleDifficulty = useCallback(() => {
    setDifficultyMode(simpleMode ? 'complex' : 'simple');
  }, [simpleMode, setDifficultyMode]);

  const restartModule = useCallback(() => {
    clearProgress();
    setPhoneScreen('home');
    setMyChartScreen('results');
    setAutomatedScore(null);
    setStepCompleted(false);
  }, [clearProgress]);

  const handleResume = useCallback(() => setShowResumePrompt(false), []);
  const handleStartOver = useCallback(() => {
    setShowResumePrompt(false);
    startAssessment(true, false);
  }, [startAssessment]);

  const isModuleCompletePhase =
    (showCongrats || showOpenEnded) && completedModuleInfo != null;

  // ── Resume prompt ──────────────────────────────────────────────
  if (showResumePrompt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-lg text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Resume Assessment</h2>
          <p className="text-muted-foreground mb-6">
            You have an unfinished assessment saved. Would you like to resume where you left off?
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={handleResume} className="w-full">Resume</Button>
            <Button size="lg" variant="outline" onClick={handleStartOver} className="w-full">
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Module overview ────────────────────────────────────────────
  if (showModuleOverview) {
    const activeIndex = session ? session.currentModuleIndex : 0;
    const completedCount = eadlModules.filter(m => isModuleCompleted(m.id)).length;
    const isFirst = completedCount === 0;
    const allDone = completedCount === eadlModules.length;
    const activeModule = eadlModules[activeIndex];

    const estMins = (steps: number) => `~${steps * 2} min`;
    const totalActiveMins = eadlModules.reduce((s, m) => s + m.steps.length * 2, 0);

    return (
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-foreground">eADL Assessment</h1>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {eadlModules.length} modules complete
                  {allDone ? '' : ' · 5 more coming soon'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container px-4 py-8">
          {/* Intro */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {completedCount === 0 ? 'Ready to Begin?' : completedCount === eadlModules.length ? 'All Done!' : 'Module Complete!'}
            </h2>
            <p className="text-muted-foreground">
              {completedCount === 0
                ? 'Tap either module below to begin — you can complete them in any order.'
                : completedCount === eadlModules.length
                ? 'Both modules completed. Great work!'
                : `${completedCount} of ${eadlModules.length} modules complete. Tap the remaining module to continue.`}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Active modules: ~{totalActiveMins} min total
            </div>
          </div>

          {/* Module grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {/* ── Active / completable modules ── */}
            {eadlModules.map((module, index) => {
              const completed = isModuleCompleted(module.id);
              const remainingCount = eadlModules.filter(m => !isModuleCompleted(m.id)).length;
              const badgeLabel = completed
                ? 'Done'
                : remainingCount === 1
                ? 'Up Next'
                : 'Available';

              return (
                <div
                  key={module.id}
                  onClick={completed ? undefined : () => handleEnterSpecificModule(index)}
                  className={cn(
                    'rounded-xl border p-5 transition-all',
                    completed
                      ? 'bg-muted/50 border-border cursor-default'
                      : 'bg-card border-primary shadow-md cursor-pointer ring-1 ring-primary/30 hover:shadow-lg active:scale-[0.99]',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
                        completed ? 'bg-success/10' : 'bg-primary/10 text-2xl',
                      )}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : (
                        getModuleIcon(module.icon)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Module {index + 1}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            completed ? 'text-success' : 'text-primary',
                          )}
                        >
                          {badgeLabel}
                        </span>
                      </div>
                      <h3
                        className={cn(
                          'font-semibold',
                          completed ? 'text-muted-foreground' : 'text-foreground',
                        )}
                      >
                        {module.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {module.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{module.steps.length} tasks</span>
                        <span>·</span>
                        <span>{estMins(module.steps.length)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Coming Soon modules ── */}
            {comingSoonModules.map(mod => (
              <div
                key={mod.name}
                className="rounded-xl border bg-card p-5 select-none cursor-not-allowed"
                style={{ opacity: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl flex-shrink-0">
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {mod.category}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{mod.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={allDone ? () => navigate('/dashboard') : handleEnterModule}
              className="gap-2 px-8"
            >
              {allDone
                ? 'View Results'
                : isFirst
                ? 'Begin Assessment'
                : `Continue — ${activeModule?.name}`}
              <ArrowRight className="h-5 w-5" />
            </Button>

            {/* Start Over — shown once at least one module has been attempted */}
            {completedCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start Over
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Start Over</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear your current results. Are you sure? This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => resetAssessment()}
                    >
                      Yes, start over
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── Loading guard ──────────────────────────────────────────────
  if (!isModuleCompletePhase && (!session || !currentModule || !currentStep)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading assessment…</p>
        </div>
      </div>
    );
  }

  const headerTitle = isModuleCompletePhase
    ? completedModuleInfo!.name
    : currentModule?.name;
  const headerSubtitle = isModuleCompletePhase
    ? 'Module Complete'
    : `Step ${stepIndex + 1} of ${currentModule?.steps.length}`;

  // ── Active assessment ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm text-foreground leading-tight">{headerTitle}</h1>
              <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
            </div>
          </div>

          {!isModuleCompletePhase && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDifficulty}
                className="gap-1 h-8 text-xs px-2"
              >
                <Sliders className="h-3 w-3" />
                {simpleMode ? 'Simple' : 'Complex'}
              </Button>
              <Button variant="outline" size="icon" onClick={restartModule} className="h-8 w-8">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {!isModuleCompletePhase && currentModule && (
        <div className="border-b bg-card px-4 py-2.5">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Step {stepIndex + 1} of {currentModule.steps.length}</span>
              <span>{Math.round(((stepIndex + 1) / currentModule.steps.length) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((stepIndex + 1) / currentModule.steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {isModuleCompletePhase ? (
          /* ── Module complete: congrats + open-ended ── */
          <div className="space-y-5">
            {showCongrats && (
              <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <PartyPopper className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Task Complete!</h2>
                <p className="text-muted-foreground mb-4">
                  Great work completing{' '}
                  <span className="font-semibold text-foreground">
                    {completedModuleInfo!.name}
                  </span>
                  . Please answer the short question below.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => { setShowCongrats(false); setShowOpenEnded(true); }}
                >
                  Answer Question
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {showOpenEnded && (
              <OpenEndedQuestion
                question={completedModuleInfo!.question}
                onSubmit={handleOpenEndedSubmit}
                onSkip={() => handleOpenEndedSubmit('')}
                simpleMode={simpleMode}
              />
            )}
          </div>
        ) : (
          /* ── Active step: instruction → simulator → scoring ── */
          <>
            {/* Step instruction */}
            <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
              <p className="font-medium text-foreground leading-snug">{currentStep!.instruction}</p>
              {simpleMode && (currentStep!.hints ?? []).length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 p-3">
                  <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{currentStep!.hints![0]}</p>
                </div>
              )}
            </div>

            {/* ── Digital Communications simulator (phone) ── */}
            {isDCModule && (
              <div className="flex justify-center">
                <PhoneFrame className="w-[320px]">
                  {phoneScreen === 'home' && (
                    <HomeScreen
                      onAppTap={handleAppTap}
                      onMisclick={() => handleMisclick('navigation')}
                      targetApps={['messages']}
                      simpleMode={simpleMode}
                      highlightTarget="messages"
                      showHint={showHints}
                    />
                  )}

                  {(phoneScreen === 'messages' ||
                    phoneScreen === 'messages-conversation') && (
                    <MessagesApp
                      onBack={() => setPhoneScreen('home')}
                      onContactSelect={handleContactSelect}
                      onSendMessage={handleSendMessage}
                      onMisclick={() => handleMisclick('targeting')}
                      targetContact="daughter"
                      simpleMode={simpleMode}
                      showHint={showHints}
                      currentStep={
                        phoneScreen === 'messages-conversation' ? 'conversation' : 'list'
                      }
                    />
                  )}

                  {phoneScreen === 'gmail' && (
                    <GmailApp
                      onAction={handleGmailAction}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                      showHint={showHints}
                    />
                  )}

                  {phoneScreen === 'telehealth' && (
                    <TelehealthCall
                      onAction={handleTelehealthAction}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                      showHint={showHints}
                    />
                  )}
                </PhoneFrame>
              </div>
            )}

            {/* ── EHR simulator (MyChart portal) ── */}
            {isEHRModule && (
              <div className="rounded-xl border shadow-xl overflow-hidden">
                <div className="h-[540px]">
                  <MyChartPortal
                    onAction={handleMyChartAction}
                    onMisclick={() => handleMisclick('navigation')}
                    currentStep={currentStep!.id}
                    simpleMode={simpleMode}
                    showHint={showHints}
                    screen={myChartScreen}
                  />
                </div>
              </div>
            )}

            {/* Scoring panel */}
            <ScoringPanel
              stepInstruction={currentStep!.instruction}
              automatedScore={automatedScore}
              onScoreSubmit={handleStepComplete}
              hints={currentStep!.hints}
              simpleMode={simpleMode}
              allowOverride={true}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Assessment;
