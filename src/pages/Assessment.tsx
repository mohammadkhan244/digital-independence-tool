import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/hooks/useAssessment';
import { eadlModules, getModuleIcon } from '@/data/modules';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { LockScreen } from '@/components/phone/LockScreen';
import { HomeScreen } from '@/components/phone/HomeScreen';
import { MessagesApp } from '@/components/phone/MessagesApp';
import { AppStoreScreen } from '@/components/phone/AppStoreScreen';
import { NotificationBanner } from '@/components/phone/NotificationBanner';
import { BankingApp } from '@/components/phone/BankingApp';
import { ShoppingApp } from '@/components/phone/ShoppingApp';
import { TransportApp } from '@/components/phone/TransportApp';
import { StreamingApp } from '@/components/phone/StreamingApp';
import { HomeSafetyApp } from '@/components/phone/HomeSafetyApp';
import { PatientPortal } from '@/components/portal/PatientPortal';
import { ScoringPanel } from '@/components/assessment/ScoringPanel';
import { OpenEndedQuestion } from '@/components/assessment/OpenEndedQuestion';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Sliders,
  RotateCcw,
  PartyPopper,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { DifficultyMode, Score, ErrorType } from '@/types/assessment';

type PhoneScreen = 'lock' | 'home' | 'messages' | 'messages-conversation' | 'app-store'
  | 'banking' | 'shopping' | 'transport' | 'streaming' | 'homesafety';
type PortalScreen = 'login' | 'home' | 'results' | 'messages' | 'medications' | 'video';

// Map module IDs to their target apps on the home screen
const moduleTargetApps: Record<string, string[]> = {
  'eadl-1': ['messages', 'appstore'],
  'eadl-2': ['myhealth'],
  'eadl-3': ['safebank'],
  'eadl-4': ['quickshop'],
  'eadl-5': ['maps'],
  'eadl-6': ['streamtv'],
  'eadl-7': ['reminders', 'homesafe'],
};

// Map module IDs to their main app on the home screen
const moduleMainApp: Record<string, string> = {
  'eadl-2': 'myhealth',
  'eadl-3': 'safebank',
  'eadl-4': 'quickshop',
  'eadl-5': 'maps',
  'eadl-6': 'streamtv',
  'eadl-7': 'homesafe',
};

// Map module IDs to their phone screen state
const moduleAppScreen: Record<string, PhoneScreen> = {
  'eadl-3': 'banking',
  'eadl-4': 'shopping',
  'eadl-5': 'transport',
  'eadl-6': 'streaming',
  'eadl-7': 'homesafety',
};

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const {
    session,
    isRunning,
    savedProgressExists,
    clearProgress,
    startAssessment,
    completeStep,
    recordMisclick,
    recordBacktrack,
    setOpenEndedResponse,
    setDifficultyMode,
    getCurrentContext,
    getAnalytics,
  } = useAssessment();

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showModuleOverview, setShowModuleOverview] = useState(true);
  const [phoneScreen, setPhoneScreen] = useState<PhoneScreen>('lock');
  const [portalScreen, setPortalScreen] = useState<PortalScreen>('login');
  const [showNotification, setShowNotification] = useState(false);
  const [showOpenEnded, setShowOpenEnded] = useState(false);
  const [automatedScore, setAutomatedScore] = useState<Score | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [completedModuleInfo, setCompletedModuleInfo] = useState<{ name: string; question: string } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  // Banking sub-screen state
  const [bankingScreen, setBankingScreen] = useState<'login' | 'home' | 'transactions' | 'bill-pay' | 'security-alert'>('login');
  // Shopping sub-screen state
  const [shoppingScreen, setShoppingScreen] = useState<'home' | 'search-results' | 'cart' | 'checkout' | 'order-status'>('home');
  // Transport sub-screen state
  const [transportScreen, setTransportScreen] = useState<'home' | 'destination' | 'route' | 'ride-request' | 'ride-tracking'>('home');
  // Streaming sub-screen state
  const [streamingScreen, setStreamingScreen] = useState<'home' | 'search-results' | 'player' | 'controls'>('home');
  // HomeSafety sub-screen state
  const [safetyScreen, setSafetyScreen] = useState<'reminders' | 'alert' | 'emergency' | 'settings'>('reminders');

  const context = getCurrentContext();
  const currentModule = context?.module;
  const currentStep = context?.step;
  const stepIndex = context?.stepIndex ?? 0;

  const simpleMode = session?.difficultyMode === 'simple';
  const showHints = simpleMode;

  // Determine which simulator to show based on current module
  // eADL-2 step 1 uses the phone home screen; subsequent steps use the portal
  const isEadl2Step1 = currentModule?.id === 'eadl-2' && currentStep?.id === 'eadl2-step1';
  const isPhoneModule = currentModule?.id !== 'eadl-2' || isEadl2Step1;
  const isPortalModule = currentModule?.id === 'eadl-2' && !isEadl2Step1;
  const moduleId = currentModule?.id || '';

  // Show resume prompt on mount if saved progress exists; otherwise the
  // overview is already visible and the user clicks Begin to start fresh.
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

    // eADL-1: Online Communication
    if (mid === 'eadl-1') {
      switch (sid) {
        case 'eadl1-step1': setPhoneScreen('lock'); setShowNotification(false); break;
        case 'eadl1-step2': setPhoneScreen('home'); setShowNotification(false); break;
        case 'eadl1-step3': setPhoneScreen('messages'); setShowNotification(false); break;
        case 'eadl1-step4': setPhoneScreen('messages-conversation'); setShowNotification(false); break;
        case 'eadl1-step5': setPhoneScreen('messages-conversation'); setShowNotification(true); break;
        case 'eadl1-step6': setPhoneScreen('home'); setShowNotification(false); break;
      }
    }
    // eADL-2: Telehealth (portal) — step 1 shows phone home screen
    else if (mid === 'eadl-2') {
      switch (sid) {
        case 'eadl2-step1': setPhoneScreen('home'); break;
        case 'eadl2-step2': setPortalScreen('login'); break;
        case 'eadl2-step3': setPortalScreen('home'); break;
        case 'eadl2-step4': setPortalScreen('messages'); break;
        case 'eadl2-step5': setPortalScreen('medications'); break;
        case 'eadl2-step6': setPortalScreen('video'); break;
      }
    }
    // eADL-3: Banking
    else if (mid === 'eadl-3') {
      switch (sid) {
        case 'eadl3-step1': setPhoneScreen('home'); break;
        case 'eadl3-step2': setPhoneScreen('banking'); setBankingScreen('login'); break;
        case 'eadl3-step3': setPhoneScreen('banking'); setBankingScreen('home'); break;
        case 'eadl3-step4': setPhoneScreen('banking'); setBankingScreen('transactions'); break;
        case 'eadl3-step5': setPhoneScreen('banking'); setBankingScreen('bill-pay'); break;
        case 'eadl3-step6': setPhoneScreen('banking'); setBankingScreen('security-alert'); break;
      }
    }
    // eADL-4: Shopping
    else if (mid === 'eadl-4') {
      switch (sid) {
        case 'eadl4-step1': setPhoneScreen('home'); break;
        case 'eadl4-step2': setPhoneScreen('shopping'); setShoppingScreen('home'); break;
        case 'eadl4-step3': setPhoneScreen('shopping'); setShoppingScreen('search-results'); break;
        case 'eadl4-step4': setPhoneScreen('shopping'); setShoppingScreen('checkout'); break;
        case 'eadl4-step5': setPhoneScreen('shopping'); setShoppingScreen('order-status'); break;
      }
    }
    // eADL-5: Transport
    else if (mid === 'eadl-5') {
      switch (sid) {
        case 'eadl5-step1': setPhoneScreen('home'); break;
        case 'eadl5-step2': setPhoneScreen('transport'); setTransportScreen('destination'); break;
        case 'eadl5-step3': setPhoneScreen('transport'); setTransportScreen('route'); break;
        case 'eadl5-step4': setPhoneScreen('transport'); setTransportScreen('ride-request'); break;
        case 'eadl5-step5': setPhoneScreen('transport'); setTransportScreen('ride-tracking'); break;
      }
    }
    // eADL-6: Streaming
    else if (mid === 'eadl-6') {
      switch (sid) {
        case 'eadl6-step1': setPhoneScreen('home'); break;
        case 'eadl6-step2': setPhoneScreen('streaming'); setStreamingScreen('home'); break;
        case 'eadl6-step3': setPhoneScreen('streaming'); setStreamingScreen('search-results'); break;
        case 'eadl6-step4': setPhoneScreen('streaming'); setStreamingScreen('player'); break;
        case 'eadl6-step5': setPhoneScreen('streaming'); setStreamingScreen('player'); break;
      }
    }
    // eADL-7: Home & Safety
    else if (mid === 'eadl-7') {
      switch (sid) {
        case 'eadl7-step1': setPhoneScreen('home'); break;
        case 'eadl7-step2': setPhoneScreen('homesafety'); setSafetyScreen('reminders'); break;
        case 'eadl7-step3': setPhoneScreen('homesafety'); setSafetyScreen('alert'); break;
        case 'eadl7-step4': setPhoneScreen('homesafety'); setSafetyScreen('emergency'); break;
        case 'eadl7-step5': setPhoneScreen('homesafety'); setSafetyScreen('settings'); break;
      }
    }
  }, [currentModule?.id, currentStep?.id]);

  // Handle step completion logic
  const handleStepComplete = useCallback((score: Score) => {
    // Capture module info BEFORE completeStep advances to next module
    const isLastStep = currentModule && stepIndex >= currentModule.steps.length - 1;
    if (isLastStep && currentModule) {
      setCompletedModuleInfo({
        name: currentModule.name,
        question: currentModule.openEndedQuestion,
      });
    }

    setAutomatedScore(null);
    setStepCompleted(false);
    completeStep(score);
    
    // Show congrats when module is complete
    if (isLastStep) {
      setShowCongrats(true);
    }
  }, [completeStep, currentModule, stepIndex]);

  // ─── eADL-1 handlers ──────────────────────────────────────────
  const handleUnlock = useCallback(() => {
    if (currentStep?.id === 'eadl1-step1' && !stepCompleted) {
      setPhoneScreen('home');
      setAutomatedScore(2);
      setStepCompleted(true);
    }
  }, [currentStep, stepCompleted]);

  const handleAppTap = useCallback((appId: string) => {
    if (stepCompleted) return;
    const sid = currentStep?.id;
    const mid = currentModule?.id;

    // eADL-1 step 2: open messages
    if (sid === 'eadl1-step2' && appId === 'messages') {
      setPhoneScreen('messages');
      setAutomatedScore(2);
      setStepCompleted(true);
      return;
    }
    // eADL-1 step 6: open app store
    if (sid === 'eadl1-step6' && appId === 'appstore') {
      setPhoneScreen('app-store');
      return;
    }

    // eADL-2 step 1: open MyHealth portal
    if (mid === 'eadl-2' && sid === 'eadl2-step1' && appId === 'myhealth') {
      setPortalScreen('login');
      setAutomatedScore(2);
      setStepCompleted(true);
      return;
    }

    // Generic: open the module's main app (step 1 for eADL 3-7)
    if (mid && moduleMainApp[mid] && appId === moduleMainApp[mid]) {
      const appScreen = moduleAppScreen[mid];
      if (appScreen) {
        setPhoneScreen(appScreen);
        // Score step 1 (open the app)
        if (sid?.endsWith('-step1')) {
          setAutomatedScore(2);
          setStepCompleted(true);
        }
      }
    }
  }, [currentStep, currentModule, stepCompleted]);

  const handleDownloadApp = useCallback((appId: string) => {
    if (currentStep?.id === 'eadl1-step6' && appId === 'zoom' && !stepCompleted) {
      setAutomatedScore(2);
      setStepCompleted(true);
    }
  }, [currentStep, stepCompleted]);

  const handleContactSelect = useCallback((contactId: string) => {
    if (currentStep?.id === 'eadl1-step3' && contactId === 'dr-smith' && !stepCompleted) {
      setPhoneScreen('messages-conversation');
      setAutomatedScore(2);
      setStepCompleted(true);
    }
  }, [currentStep, stepCompleted]);

  const handleSendMessage = useCallback((message: string) => {
    if (currentStep?.id === 'eadl1-step4' && !stepCompleted) {
      setAutomatedScore(2);
      setStepCompleted(true);
    }
  }, [currentStep, stepCompleted]);

  const handleNotificationTap = useCallback(() => {
    if (currentStep?.id === 'eadl1-step5' && !stepCompleted) {
      setShowNotification(false);
      setAutomatedScore(2);
      setStepCompleted(true);
    }
  }, [currentStep, stepCompleted]);

  // ─── eADL-2 portal handlers ───────────────────────────────────
  const handlePortalAction = useCallback((action: string) => {
    if (stepCompleted) return;
    switch (action) {
      case 'login':
        if (currentStep?.id === 'eadl2-step2') { setPortalScreen('home'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'view_results':
        if (currentStep?.id === 'eadl2-step3') { setPortalScreen('results'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'send_message':
        if (currentStep?.id === 'eadl2-step4') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'request_refill':
        if (currentStep?.id === 'eadl2-step5') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'toggle_camera':
      case 'toggle_mic':
        if (currentStep?.id === 'eadl2-step6') { setAutomatedScore(2); setStepCompleted(true); }
        break;
    }
  }, [currentStep, stepCompleted]);

  // ─── eADL-3 banking handlers ──────────────────────────────────
  const handleBankingAction = useCallback((action: string) => {
    if (stepCompleted) return;
    const sid = currentStep?.id;
    switch (action) {
      case 'authenticate':
        if (sid === 'eadl3-step2') { setBankingScreen('home'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'view_balance':
        if (sid === 'eadl3-step3') { setBankingScreen('transactions'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'view_transactions':
        if (sid === 'eadl3-step4') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'pay_bill':
        if (sid === 'eadl3-step5') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'handle_alert':
        if (sid === 'eadl3-step6') { setAutomatedScore(2); setStepCompleted(true); }
        break;
    }
  }, [currentStep, stepCompleted]);

  // ─── eADL-4 shopping handlers ─────────────────────────────────
  const handleShoppingAction = useCallback((action: string) => {
    if (stepCompleted) return;
    const sid = currentStep?.id;
    switch (action) {
      case 'search':
        if (sid === 'eadl4-step2') { setShoppingScreen('search-results'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'add_item':
        if (sid === 'eadl4-step3') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'confirm_checkout':
        if (sid === 'eadl4-step4') { setShoppingScreen('order-status'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'view_order':
        if (sid === 'eadl4-step5') { setAutomatedScore(2); setStepCompleted(true); }
        break;
    }
  }, [currentStep, stepCompleted]);

  // ─── eADL-5 transport handlers ────────────────────────────────
  const handleTransportAction = useCallback((action: string) => {
    if (stepCompleted) return;
    const sid = currentStep?.id;
    switch (action) {
      case 'enter_destination':
        if (sid === 'eadl5-step2') { setTransportScreen('route'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'select_route':
        if (sid === 'eadl5-step3') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'request_ride':
        if (sid === 'eadl5-step4') { setTransportScreen('ride-tracking'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'track_ride':
        if (sid === 'eadl5-step5') { setAutomatedScore(2); setStepCompleted(true); }
        break;
    }
  }, [currentStep, stepCompleted]);

  // ─── eADL-6 streaming handlers ────────────────────────────────
  const handleStreamingAction = useCallback((action: string) => {
    if (stepCompleted) return;
    const sid = currentStep?.id;
    switch (action) {
      case 'search':
        if (sid === 'eadl6-step2') { setStreamingScreen('search-results'); setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'play_content':
        if (sid === 'eadl6-step3') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'control_playback':
        if (sid === 'eadl6-step4') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'exit':
        if (sid === 'eadl6-step5') { setPhoneScreen('home'); setAutomatedScore(2); setStepCompleted(true); }
        break;
    }
  }, [currentStep, stepCompleted]);

  // ─── eADL-7 safety handlers ───────────────────────────────────
  const handleSafetyAction = useCallback((action: string) => {
    if (stepCompleted) return;
    const sid = currentStep?.id;
    switch (action) {
      case 'view_reminders':
        if (sid === 'eadl7-step1') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'complete_reminder':
        if (sid === 'eadl7-step2') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'acknowledge_alert':
        if (sid === 'eadl7-step3') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'call_emergency':
        if (sid === 'eadl7-step4') { setAutomatedScore(2); setStepCompleted(true); }
        break;
      case 'adjust_settings':
        if (sid === 'eadl7-step5') { setAutomatedScore(2); setStepCompleted(true); }
        break;
    }
  }, [currentStep, stepCompleted]);

  // ─── Module overview helpers ───────────────────────────────────
  const getModuleState = (index: number): 'completed' | 'active' | 'locked' => {
    const activeIndex = session ? session.currentModuleIndex : 0;
    if (index < activeIndex) return 'completed';
    if (index === activeIndex) return 'active';
    return 'locked';
  };

  const handleEnterModule = useCallback(() => {
    if (!session) {
      startAssessment(true, false);
    }
    setShowModuleOverview(false);
  }, [session, startAssessment]);

  const handleMisclick = useCallback((errorType: ErrorType = 'targeting') => {
    recordMisclick(errorType);
  }, [recordMisclick]);

  // Handle open-ended response
  const handleOpenEndedSubmit = useCallback((response: string) => {
    setOpenEndedResponse(response);
    setShowOpenEnded(false);
    setShowCongrats(false);
    setCompletedModuleInfo(null);
    if (session?.endTime) {
      navigate('/dashboard');
    } else {
      setShowModuleOverview(true);
    }
  }, [setOpenEndedResponse, session, navigate]);

  // Toggle difficulty mode
  const toggleDifficulty = useCallback(() => {
    setDifficultyMode(simpleMode ? 'complex' : 'simple');
  }, [simpleMode, setDifficultyMode]);

  // Restart current module
  const restartModule = useCallback(() => {
    clearProgress();
    setPhoneScreen('lock');
    setPortalScreen('login');
    setBankingScreen('login');
    setShoppingScreen('home');
    setTransportScreen('home');
    setStreamingScreen('home');
    setSafetyScreen('reminders');
    setShowNotification(false);
    setAutomatedScore(null);
    setStepCompleted(false);
  }, [clearProgress]);

  const handleResume = useCallback(() => {
    setShowResumePrompt(false);
  }, []);

  const handleStartOver = useCallback(() => {
    setShowResumePrompt(false);
    startAssessment(true, false);
  }, [startAssessment]);

  // Congrats + survey phase uses the same layout but locks the phone
  const isModuleCompletePhase = (showCongrats || showOpenEnded) && completedModuleInfo;

  if (showResumePrompt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-lg text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Resume Assessment</h2>
          <p className="text-muted-foreground mb-6">
            You have an unfinished assessment saved. Would you like to resume where you left off?
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={handleResume} className="w-full">
              Resume
            </Button>
            <Button size="lg" variant="outline" onClick={handleStartOver} className="w-full">
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showModuleOverview) {
    const activeIndex = session ? session.currentModuleIndex : 0;
    const completedCount = activeIndex;
    const isFirst = completedCount === 0;
    const activeModule = eadlModules[activeIndex];

    const estMins = (steps: number) => `~${Math.ceil(steps * 30 / 60)} min`;
    const totalMins = Math.ceil(eadlModules.reduce((s, m) => s + m.steps.length, 0) * 30 / 60);

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
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container px-4 py-8">
          {/* Intro text */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isFirst ? 'Ready to Begin?' : 'Module Complete!'}
            </h2>
            <p className="text-muted-foreground">
              {isFirst
                ? 'Complete all 7 modules to finish the assessment.'
                : `You've completed ${completedCount} of ${eadlModules.length} modules. Keep going!`}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Total estimated time: ~{totalMins} min
            </div>
          </div>

          {/* Module cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {eadlModules.map((module, index) => {
              const state = getModuleState(index);
              return (
                <div
                  key={module.id}
                  onClick={state === 'active' ? handleEnterModule : undefined}
                  className={cn(
                    'rounded-xl border p-5 transition-all',
                    state === 'completed' && 'bg-muted/50 border-border',
                    state === 'active' &&
                      'bg-card border-primary shadow-md cursor-pointer ring-1 ring-primary/30 hover:shadow-lg',
                    state === 'locked' && 'bg-card opacity-40 cursor-not-allowed select-none',
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
                        state === 'completed' && 'bg-success/10',
                        state === 'active' && 'bg-primary/10 text-2xl',
                        state === 'locked' && 'bg-muted text-2xl',
                      )}
                    >
                      {state === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : state === 'locked' ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        getModuleIcon(module.icon)
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          eADL {index + 1}
                        </span>
                        {state === 'completed' && (
                          <span className="text-xs font-semibold text-success">Done</span>
                        )}
                        {state === 'active' && (
                          <span className="text-xs font-semibold text-primary">Up Next</span>
                        )}
                      </div>
                      <h3
                        className={cn(
                          'font-semibold',
                          state === 'completed' ? 'text-muted-foreground' : 'text-foreground',
                        )}
                      >
                        {module.name}
                      </h3>
                      {state !== 'locked' && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {module.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{module.steps.length} steps</span>
                        <span>·</span>
                        <span>{estMins(module.steps.length)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA button */}
          <div className="flex justify-center">
            <Button size="lg" onClick={handleEnterModule} className="gap-2 px-8">
              {isFirst ? 'Begin Assessment' : `Continue — ${activeModule?.name}`}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!isModuleCompletePhase && (!session || !currentModule || !currentStep)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Get target apps for the current module's home screen
  const targetApps = currentModule ? (moduleTargetApps[moduleId] || []) : [];
  // Highlight the main app on step 1
  const homeHighlight = currentStep?.id?.endsWith('-step1') ? moduleMainApp[moduleId] : 
    currentStep?.id === 'eadl1-step2' ? 'messages' : undefined;

  // Use completed module info for header during complete phase
  const headerTitle = isModuleCompletePhase ? completedModuleInfo!.name : currentModule?.name;
  const headerSubtitle = isModuleCompletePhase ? 'Module Complete' : `Step ${stepIndex + 1} of ${currentModule?.steps.length}`;

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

      {/* Progress bar — always visible during active steps */}
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

      {/* Main content — single column, mobile-first */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {isModuleCompletePhase ? (
          /* ── Module complete: congrats + survey ── */
          <div className="space-y-5">
            {showCongrats && (
              <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <PartyPopper className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Task Complete! 🎉</h2>
                <p className="text-muted-foreground mb-4">
                  Great work completing{' '}
                  <span className="font-semibold text-foreground">{completedModuleInfo!.name}</span>.
                  Please answer the short question below.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setShowCongrats(false);
                    setShowOpenEnded(true);
                  }}
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
          /* ── Active step: instruction → simulator → rating ── */
          <>
            {/* 1. Step instruction */}
            <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
              <p className="font-medium text-foreground leading-snug">{currentStep!.instruction}</p>
              {simpleMode && (currentStep!.hints ?? []).length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 p-3">
                  <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{currentStep!.hints![0]}</p>
                </div>
              )}
            </div>

            {/* 2. Simulator */}
            {isPhoneModule && (
              <div className="flex justify-center">
                <PhoneFrame className="w-[320px]">
                  {phoneScreen === 'lock' && (
                    <LockScreen
                      onUnlock={handleUnlock}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                    />
                  )}
                  {phoneScreen === 'home' && (
                    <HomeScreen
                      onAppTap={handleAppTap}
                      onMisclick={() => handleMisclick('navigation')}
                      targetApps={targetApps}
                      simpleMode={simpleMode}
                      highlightTarget={homeHighlight}
                      showHint={showHints}
                    />
                  )}
                  {(phoneScreen === 'messages' || phoneScreen === 'messages-conversation') && (
                    <MessagesApp
                      onBack={() => setPhoneScreen('home')}
                      onContactSelect={handleContactSelect}
                      onSendMessage={handleSendMessage}
                      onMisclick={() => handleMisclick('targeting')}
                      targetContact="dr-smith"
                      simpleMode={simpleMode}
                      showHint={showHints}
                      currentStep={phoneScreen === 'messages-conversation' ? 'conversation' : 'list'}
                    />
                  )}
                  {phoneScreen === 'app-store' && (
                    <AppStoreScreen
                      onBack={() => setPhoneScreen('home')}
                      onDownloadApp={handleDownloadApp}
                      onMisclick={() => handleMisclick('targeting')}
                      targetApp="zoom"
                      simpleMode={simpleMode}
                      showHint={showHints}
                    />
                  )}
                  {phoneScreen === 'banking' && (
                    <BankingApp
                      onBack={() => setPhoneScreen('home')}
                      onAction={handleBankingAction}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                      showHint={showHints}
                      screen={bankingScreen}
                    />
                  )}
                  {phoneScreen === 'shopping' && (
                    <ShoppingApp
                      onBack={() => setPhoneScreen('home')}
                      onAction={handleShoppingAction}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                      showHint={showHints}
                      screen={shoppingScreen}
                    />
                  )}
                  {phoneScreen === 'transport' && (
                    <TransportApp
                      onBack={() => setPhoneScreen('home')}
                      onAction={handleTransportAction}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                      showHint={showHints}
                      screen={transportScreen}
                    />
                  )}
                  {phoneScreen === 'streaming' && (
                    <StreamingApp
                      onBack={() => setPhoneScreen('home')}
                      onAction={handleStreamingAction}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                      showHint={showHints}
                      screen={streamingScreen}
                    />
                  )}
                  {phoneScreen === 'homesafety' && (
                    <HomeSafetyApp
                      onBack={() => setPhoneScreen('home')}
                      onAction={handleSafetyAction}
                      onMisclick={() => handleMisclick('targeting')}
                      simpleMode={simpleMode}
                      showHint={showHints}
                      screen={safetyScreen}
                    />
                  )}
                  {showNotification && currentStep?.id === 'eadl1-step5' && (
                    <NotificationBanner
                      appName="Messages"
                      appIcon="💬"
                      title="New Message"
                      message="Dr. Smith: Great, I'll see you tomorrow!"
                      onTap={handleNotificationTap}
                      onDismiss={() => handleMisclick('attention')}
                      simpleMode={simpleMode}
                    />
                  )}
                </PhoneFrame>
              </div>
            )}

            {isPortalModule && (
              <div className="rounded-xl border bg-white shadow-xl overflow-hidden">
                <div className="h-[500px]">
                  <PatientPortal
                    onAction={handlePortalAction}
                    onMisclick={() => handleMisclick('navigation')}
                    currentStep={currentStep!.id}
                    simpleMode={simpleMode}
                    showHint={showHints}
                    screen={portalScreen}
                  />
                </div>
              </div>
            )}

            {/* 3. Rating — tap = immediate advance */}
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
