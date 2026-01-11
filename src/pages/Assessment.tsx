import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/hooks/useAssessment';
import { eadlModules } from '@/data/modules';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { LockScreen } from '@/components/phone/LockScreen';
import { HomeScreen } from '@/components/phone/HomeScreen';
import { MessagesApp } from '@/components/phone/MessagesApp';
import { NotificationBanner } from '@/components/phone/NotificationBanner';
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
} from 'lucide-react';
import { DifficultyMode, Score, ErrorType } from '@/types/assessment';

type PhoneScreen = 'lock' | 'home' | 'messages' | 'messages-conversation' | 'app-store';
type PortalScreen = 'login' | 'home' | 'results' | 'messages' | 'medications' | 'video';

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

  const context = getCurrentContext();
  const currentModule = context?.module;
  const currentStep = context?.step;
  const stepIndex = context?.stepIndex ?? 0;

  const simpleMode = session?.difficultyMode === 'simple';
  const showHints = simpleMode;

  // Determine which simulator to show based on current module
  const isPhoneModule = currentModule?.id === 'eadl-1';
  const isPortalModule = currentModule?.id === 'eadl-2';

  // Start assessment on mount if not running
  useEffect(() => {
    if (!isRunning && !session) {
      startAssessment(true, false);
    }
  }, [isRunning, session, startAssessment]);

  // Keep simulator state aligned with the active step (prevents UI/step desync)
  useEffect(() => {
    if (!isPhoneModule || !currentStep) return;

    // Reset step gating whenever the step changes
    setStepCompleted(false);

    switch (currentStep.id) {
      case 'eadl1-step1':
        setPhoneScreen('lock');
        setShowNotification(false);
        break;
      case 'eadl1-step2':
        setPhoneScreen('home');
        setShowNotification(false);
        break;
      case 'eadl1-step3':
        setPhoneScreen('messages');
        setShowNotification(false);
        break;
      case 'eadl1-step4':
        setPhoneScreen('messages-conversation');
        setShowNotification(false);
        break;
      case 'eadl1-step5':
        setPhoneScreen('messages-conversation');
        setShowNotification(true);
        break;
      case 'eadl1-step6':
        setPhoneScreen('home');
        setShowNotification(false);
        break;
      default:
        break;
    }
  }, [isPhoneModule, currentStep?.id]);


  // Handle step completion logic
  const handleStepComplete = useCallback((score: Score) => {
    setAutomatedScore(null);
    setStepCompleted(false);
    completeStep(score);
    
    // Check if module is complete
    if (currentModule && stepIndex >= currentModule.steps.length - 1) {
      setShowOpenEnded(true);
    }
  }, [completeStep, currentModule, stepIndex]);

  // Handle phone interactions
  const handleUnlock = useCallback(() => {
    if (currentStep?.id === 'eadl1-step1' && !stepCompleted) {
      setPhoneScreen('home');
      setAutomatedScore(2);
      setStepCompleted(true);
    }
  }, [currentStep, stepCompleted]);

  const handleAppTap = useCallback((appId: string) => {
    if (currentStep?.id === 'eadl1-step2' && appId === 'messages' && !stepCompleted) {
      setPhoneScreen('messages');
      setAutomatedScore(2);
      setStepCompleted(true);
    } else if (currentStep?.id === 'eadl1-step6' && appId === 'appstore' && !stepCompleted) {
      setPhoneScreen('app-store');
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

  const handleMisclick = useCallback((errorType: ErrorType = 'targeting') => {
    recordMisclick(errorType);
  }, [recordMisclick]);

  // Handle portal interactions
  const handlePortalAction = useCallback((action: string) => {
    if (stepCompleted) return;
    
    switch (action) {
      case 'login':
        if (currentStep?.id === 'eadl2-step2') {
          setPortalScreen('home');
          setAutomatedScore(2);
          setStepCompleted(true);
        }
        break;
      case 'view_results':
        if (currentStep?.id === 'eadl2-step3') {
          setPortalScreen('results');
          setAutomatedScore(2);
          setStepCompleted(true);
        }
        break;
      case 'send_message':
        if (currentStep?.id === 'eadl2-step4') {
          setAutomatedScore(2);
          setStepCompleted(true);
        }
        break;
      case 'request_refill':
        if (currentStep?.id === 'eadl2-step5') {
          setAutomatedScore(2);
          setStepCompleted(true);
        }
        break;
      case 'toggle_camera':
      case 'toggle_mic':
        if (currentStep?.id === 'eadl2-step6') {
          setAutomatedScore(2);
          setStepCompleted(true);
        }
        break;
    }
  }, [currentStep, stepCompleted]);

  // Handle open-ended response
  const handleOpenEndedSubmit = useCallback((response: string) => {
    setOpenEndedResponse(response);
    setShowOpenEnded(false);
  }, [setOpenEndedResponse]);

  // Toggle difficulty mode
  const toggleDifficulty = useCallback(() => {
    setDifficultyMode(simpleMode ? 'complex' : 'simple');
  }, [simpleMode, setDifficultyMode]);

  // Restart current module
  const restartModule = useCallback(() => {
    setPhoneScreen('lock');
    setPortalScreen('login');
    setShowNotification(false);
    setAutomatedScore(null);
    setStepCompleted(false);
  }, []);

  if (!session || !currentModule || !currentStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Open-ended question screen
  if (showOpenEnded) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setShowOpenEnded(false)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">{currentModule.name}</h1>
            <p className="text-muted-foreground">Module Complete - Share Your Thoughts</p>
          </div>

          <OpenEndedQuestion
            question={currentModule.openEndedQuestion}
            onSubmit={handleOpenEndedSubmit}
            onSkip={() => handleOpenEndedSubmit('')}
            simpleMode={simpleMode}
          />
        </div>
      </div>
    );
  }

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
              <h1 className="font-semibold text-foreground">{currentModule.name}</h1>
              <p className="text-sm text-muted-foreground">
                Step {stepIndex + 1} of {currentModule.steps.length}
              </p>
            </div>
          </div>

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
                simpleMode 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {simpleMode ? 'Simple Mode' : 'Complex Mode'}
              </span>
            </div>

            {/* Phone Simulator */}
            {isPhoneModule && (
              <div className="relative">
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
                      targetApps={['messages', 'appstore']}
                      simpleMode={simpleMode}
                      highlightTarget={currentStep.id === 'eadl1-step2' ? 'messages' : undefined}
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
                  
                  {/* Notification Overlay */}
                  {showNotification && currentStep.id === 'eadl1-step5' && (
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

            {/* Portal Simulator */}
            {isPortalModule && (
              <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl overflow-hidden">
                <div className="h-[600px]">
                  <PatientPortal
                    onAction={handlePortalAction}
                    onMisclick={() => handleMisclick('navigation')}
                    currentStep={currentStep.id}
                    simpleMode={simpleMode}
                    showHint={showHints}
                  />
                </div>
              </div>
            )}

            {/* Placeholder for other modules */}
            {!isPhoneModule && !isPortalModule && (
              <div className="flex h-96 w-full max-w-lg items-center justify-center rounded-xl border bg-muted">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {currentModule.name} simulator
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coming soon...
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setAutomatedScore(2)}
                  >
                    Simulate Step Complete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Assessment Panel */}
          <div className="space-y-6">
            {/* Step Tracker */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="font-semibold text-foreground mb-4">Progress</h2>
              <StepTracker
                steps={currentModule.steps}
                currentStepIndex={stepIndex}
                stepResults={
                  session.moduleResults.find(m => m.moduleId === currentModule.id)?.stepResults || []
                }
                simpleMode={simpleMode}
              />
            </div>

            {/* Scoring Panel */}
            <ScoringPanel
              stepInstruction={currentStep.instruction}
              automatedScore={automatedScore}
              onScoreSubmit={handleStepComplete}
              hints={currentStep.hints}
              simpleMode={simpleMode}
              allowOverride={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
