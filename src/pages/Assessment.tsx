import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/hooks/useAssessment';
import { eadlModules } from '@/data/modules';
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
import { StepTracker } from '@/components/assessment/StepTracker';
import { ScoringPanel } from '@/components/assessment/ScoringPanel';
import { OpenEndedQuestion } from '@/components/assessment/OpenEndedQuestion';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Eye, 
  Sliders,
  RotateCcw,
  PartyPopper,
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
    startAssessment,
    completeStep,
    recordMisclick,
    recordBacktrack,
    setOpenEndedResponse,
    setDifficultyMode,
    getCurrentContext,
    getAnalytics,
  } = useAssessment();

  const [phoneScreen, setPhoneScreen] = useState<PhoneScreen>('lock');
  const [portalScreen, setPortalScreen] = useState<PortalScreen>('login');
  const [showNotification, setShowNotification] = useState(false);
  const [showOpenEnded, setShowOpenEnded] = useState(false);
  const [automatedScore, setAutomatedScore] = useState<Score | null>(null);
  const [showSettings, setShowSettings] = useState(false);
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

  // Start assessment on mount if not running
  useEffect(() => {
    if (!isRunning && !session) {
      startAssessment(true, false);
    }
  }, [isRunning, session, startAssessment]);

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
    // eADL-2: Telehealth (portal)
    else if (mid === 'eadl-2') {
      switch (sid) {
        case 'eadl2-step1': setPortalScreen('login'); break;
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

    // Generic: open the module's main app (step 1 for eADL 3-7)
    const mid = currentModule?.id;
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

  const handleMisclick = useCallback((errorType: ErrorType = 'targeting') => {
    recordMisclick(errorType);
  }, [recordMisclick]);

  // Handle open-ended response
  const handleOpenEndedSubmit = useCallback((response: string) => {
    setOpenEndedResponse(response);
    setShowOpenEnded(false);
    setCompletedModuleInfo(null);
  }, [setOpenEndedResponse]);

  // Toggle difficulty mode
  const toggleDifficulty = useCallback(() => {
    setDifficultyMode(simpleMode ? 'complex' : 'simple');
  }, [simpleMode, setDifficultyMode]);

  // Restart current module
  const restartModule = useCallback(() => {
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
  }, []);

  // Congrats + survey phase uses the same layout but locks the phone
  const isModuleCompletePhase = (showCongrats || showOpenEnded) && completedModuleInfo;

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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{headerTitle}</h1>
              <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
            </div>
          </div>

          {!isModuleCompletePhase && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDifficulty}
                className="gap-1"
              >
                <Sliders className="h-4 w-4" />
                {simpleMode ? 'Simple' : 'Complex'}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={restartModule}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Simulator Panel */}
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className={cn(
                "inline-block rounded-full px-3 py-1 text-sm font-medium",
                isModuleCompletePhase
                  ? "bg-primary/10 text-primary"
                  : simpleMode 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
              )}>
                {isModuleCompletePhase ? '✅ Task Complete' : simpleMode ? 'Simple Mode' : 'Complex Mode'}
              </span>
            </div>

            {/* Phone with celebration overlay when module complete */}
            {(isPhoneModule || isModuleCompletePhase) && (
              <div className="relative">
                <PhoneFrame className="w-[320px]">
                  {isModuleCompletePhase ? (
                    /* Celebration lock screen inside phone */
                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-primary/20 via-background to-primary/10 p-6 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <PartyPopper className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Great Job! 🎉</h2>
                      <p className="text-sm text-muted-foreground mb-1">
                        You completed
                      </p>
                      <p className="text-base font-semibold text-foreground mb-4">
                        {completedModuleInfo!.name}
                      </p>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 mb-4">
                        <p className="text-xs text-muted-foreground">
                          👉 Please complete the survey on the right to continue
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Waiting for survey...
                      </div>
                    </div>
                  ) : (
                    <>
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
                      
                      {/* Notification Overlay */}
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
                    </>
                  )}
                </PhoneFrame>
              </div>
            )}

            {/* Portal Simulator (eADL-2 only) */}
            {isPortalModule && !isModuleCompletePhase && (
              <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl overflow-hidden">
                <div className="h-[600px]">
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
          </div>

          {/* Assessment Panel */}
          <div className="space-y-6">
            {isModuleCompletePhase ? (
              /* Survey panel when module is complete */
              <div className="space-y-6">
                {showCongrats && (
                  <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <PartyPopper className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Task Complete! 🎉</h2>
                    <p className="text-muted-foreground mb-4">
                      Great work completing <span className="font-semibold text-foreground">{completedModuleInfo!.name}</span>. 
                      Now please answer the competency survey below.
                    </p>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setShowCongrats(false);
                        setShowOpenEnded(true);
                      }}
                    >
                      Start Survey
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
              <>
                {/* Step Tracker */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h2 className="font-semibold text-foreground mb-4">Progress</h2>
                  <StepTracker
                    steps={currentModule!.steps}
                    currentStepIndex={stepIndex}
                    stepResults={
                      session!.moduleResults.find(m => m.moduleId === currentModule!.id)?.stepResults || []
                    }
                    simpleMode={simpleMode}
                  />
                </div>

                {/* Scoring Panel */}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
