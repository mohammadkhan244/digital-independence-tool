import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  PhoneRecentsScreen,
  SettingsScreen,
  MusicScreen,
  GenericAppLaunchScreen,
  WrongAppScreen,
  APP_DISPLAY_NAMES,
  APP_BG_COLORS,
} from '@/components/phone/WrongAppScreens';
import { ScoringPanel } from '@/components/assessment/ScoringPanel';
import { OpenEndedQuestion } from '@/components/assessment/OpenEndedQuestion';
import { ModeSelection } from '@/components/assessment/ModeSelection';
import { TherapistPanel, computeRehabCueResult } from '@/components/assessment/TherapistPanel';
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
  ChevronDown,
  Sliders,
  RotateCcw,
  PartyPopper,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Clock,
  Volume2,
} from 'lucide-react';
import { DifficultyMode, Score, ErrorType, CueLevel, AssessmentMode } from '@/types/assessment';

type PhoneScreen =
  | 'home'
  | 'messages'
  | 'messages-conversation'
  | 'gmail'
  | 'telehealth';

type MyChartScreen = 'results' | 'appointments' | 'messages';

const comingSoonModules = [
  {
    name: 'Money Management',
    icon: 'ðŸ’³',
    category: 'Module 3',
    description: 'Use a banking app to check balances, pay bills, and handle security alerts.',
  },
  {
    name: 'Shopping & Pharmacy',
    icon: 'ðŸ›’',
    category: 'Module 4',
    description: 'Order products online and manage pharmacy prescriptions.',
  },
  {
    name: 'Transportation & Navigation',
    icon: 'ðŸ“',
    category: 'Module 5',
    description: 'Use maps and ride-sharing apps to get around.',
  },
  {
    name: 'Social & Leisure',
    icon: 'â–¶ï¸',
    category: 'Module 6',
    description: 'Use streaming services and entertainment apps for everyday enjoyment.',
  },
  {
    name: 'Home & Safety',
    icon: 'ðŸ›¡ï¸',
    category: 'Module 7',
    description: 'Manage reminders, respond to alerts, and access emergency services.',
  },
];

// Step-by-step instructions per stepId (and reassessment variant)
const STEP_BY_STEP: Record<string, string[]> = {
  'dc-step1': [
    'Tap the Messages app icon on the home screen',
    'Find "Emma (Daughter)" in the contact list',
    'Tap her name to open the conversation',
    'Tap the text box at the bottom and type your message',
    'Tap the blue Send button',
  ],
  'dc-step1-r': [
    'Tap the Messages app icon on the home screen',
    'Find "Michael (Son)" in the contact list',
    'Tap his name to open the conversation',
    'Tap the text box at the bottom and type your message',
    'Tap the blue Send button',
  ],
  'dc-step2': [
    'In Gmail, find the bold email from Dr. Patel\'s Office',
    'Tap the email to open it',
    'Tap the Reply button at the bottom',
    'Type your response in the text area',
    'Tap Send when ready',
  ],
  'dc-step2-r': [
    'In Gmail, find the bold email from OhioHealth Patient Services',
    'Tap the email to open it',
    'Tap the Reply button at the bottom',
    'Type your response in the text area',
    'Tap Send when ready',
  ],
  'dc-step3': [
    'Look at the row of buttons at the bottom of the call',
    'Find the microphone button (leftmost circular button)',
    'Tap the microphone button to mute yourself',
  ],
  'dc-step3-r': [
    'Look at the row of buttons at the bottom of the call',
    'Find the camera button (second button from the left)',
    'Tap the camera button to turn on your video',
  ],
  'ehr-step1': [
    'Tap "Test Results" in the left-side menu',
    'Find the "Complete Blood Count (CBC)" â€” the most recent result',
    'Tap it to expand and view your lab values',
  ],
  'ehr-step1-r': [
    'Tap "Test Results" in the left-side menu',
    'Find the "Lipid Panel" â€” the most recent result',
    'Tap it to expand and view your lab values',
  ],
  'ehr-step2': [
    'Tap "Appointments" in the left-side menu',
    'Find the upcoming appointment card',
    'Tap the card to expand the full details',
  ],
  'ehr-step2-r': [
    'Tap "Appointments" in the left-side menu',
    'Find the upcoming appointment with Dr. James Okafor',
    'Tap the card to expand the full details',
  ],
  'ehr-step3': [
    'Tap "Messages" in the left-side menu',
    'Tap the "New Message" button in the top right',
    'Type your question about your medication',
    'Tap Send when ready',
  ],
  'ehr-step3-r': [
    'Tap "Messages" in the left-side menu',
    'Find the message from "Nurse Coordinator"',
    'Tap it to open the thread',
    'Type your reply and tap Send',
  ],
};

// Mode badge config
const MODE_BADGE: Record<AssessmentMode, { label: string; cls: string }> = {
  assessment:    { label: 'Assessment Mode',   cls: 'bg-primary/10 text-primary' },
  rehabilitation:{ label: 'Rehab Mode',        cls: 'bg-chart-1/10 text-chart-1' },
  reassessment:  { label: 'Reassessment Mode', cls: 'bg-chart-2/10 text-chart-2' },
};

function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 1.0;
  window.speechSynthesis.speak(utter);
}

// Demo animation: target [x%, y%] within the simulator wrapper div
const DEMO_TARGETS: Record<string, [number, number]> = {
  'dc-step1':   [50, 42],  // Messages icon (home screen mid-area)
  'dc-step1-r': [50, 42],
  'dc-step2':   [50, 30],  // Bold email row near top of inbox
  'dc-step2-r': [50, 30],
  'dc-step3':   [37, 83],  // Mute button (bottom-left controls)
  'dc-step3-r': [47, 83],  // Camera button (second from left)
  'ehr-step1':  [62, 40],  // CBC / Lipid Panel row in results list
  'ehr-step1-r':[62, 40],
  'ehr-step2':  [62, 50],  // Appointment card
  'ehr-step2-r':[62, 50],
  'ehr-step3':  [83, 10],  // New Message button (top-right)
  'ehr-step3-r':[65, 42],  // Nurse Coordinator thread row
};

interface DemoPointerProps { stepKey: string; onDone: () => void; }

const DemoPointer: React.FC<DemoPointerProps> = ({ stepKey, onDone }) => {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const [phase, setPhase] = useState(0); // 0=appear, 1=move, 2=pause, 3=tap, 4=exit

  const [ex, ey] = DEMO_TARGETS[stepKey] ?? [50, 50];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),   // start moving
      setTimeout(() => setPhase(2), 950),   // arrive & pulse
      setTimeout(() => setPhase(3), 1750),  // tap
      setTimeout(() => setPhase(4), 1950),  // fade out
      setTimeout(() => onDoneRef.current(), 2300), // done â†’ reset sim
    ];
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const px = phase === 0 ? 50 : ex;
  const py = phase === 0 ? 50 : ey;

  return (
    // Container blocks accidental taps during the demo
    <div className="absolute inset-0 z-[60]" style={{ cursor: 'default' }}>
      {/* Pulse ring at target during pause + tap */}
      {(phase === 2 || phase === 3) && (
        <div
          className="absolute rounded-full border-2 border-primary animate-ping"
          style={{
            left: `${ex}%`,
            top: `${ey}%`,
            width: 44,
            height: 44,
            transform: 'translate(-50%, -50%)',
            opacity: 0.55,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Animated finger pointer */}
      <div
        style={{
          position: 'absolute',
          left: `${px}%`,
          top: `${py}%`,
          opacity: phase === 4 ? 0 : 1,
          fontSize: '2rem',
          lineHeight: 1,
          transform: `translate(-50%, -85%) scale(${phase === 3 ? 0.65 : 1})`,
          transition:
            phase === 1 ? 'left 0.82s ease-in-out, top 0.82s ease-in-out' :
            phase === 3 ? 'transform 0.12s ease-in' :
            phase === 4 ? 'opacity 0.35s ease-out' :
            'none',
          willChange: 'left, top',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        ðŸ‘†
      </div>
    </div>
  );
};


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
    recordWrongScreenNav,
    recordGoBack,
    jumpToModule,
    setOpenEndedResponse,
    setDifficultyMode,
    getCurrentContext,
    currentStepMisclicks,
    currentWrongScreenCount,
  } = useAssessment();

  const OVERRIDE_THRESHOLD = 5;

  // â”€â”€ Mode selection (persists between ModeSelection and module entry) â”€â”€
  const [selectedMode, setSelectedMode] = useState<AssessmentMode | null>(null);

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showModuleOverview, setShowModuleOverview] = useState(true);
  const [phoneScreen, setPhoneScreen] = useState<PhoneScreen>('home');
  const [myChartScreen, setMyChartScreen] = useState<MyChartScreen>('results');
  const [wrongAppScreen, setWrongAppScreen] = useState<string | null>(null);
  const [showOpenEnded, setShowOpenEnded] = useState(false);
  const [automatedScore, setAutomatedScore] = useState<Score | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [completedModuleInfo, setCompletedModuleInfo] = useState<{
    name: string;
    question: string;
    moduleId: string;
  } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  // Set to true when completeStep returns a session with endTime â€” used to
  // drive navigation without relying on async state closure.
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);

  // â”€â”€ Rehab mode state â”€â”€
  const [rehabCueCount, setRehabCueCount] = useState(0);
  const [rehabShowHint, setRehabShowHint] = useState(false);
  const [showDemoOverlay, setShowDemoOverlay] = useState(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [simulatorResetKey, setSimulatorResetKey] = useState(0);

  const context = getCurrentContext();
  const currentModule = context?.module;
  const currentStep = context?.step;
  const stepIndex = context?.stepIndex ?? 0;

  const simpleMode = session?.difficultyMode === 'simple';
  const showHints = simpleMode;

  const isDCModule = currentModule?.id === 'digital-comms';
  const isEHRModule = currentModule?.id === 'ehr';

  // Active mode comes from session (once started) or selected state (before entry)
  const activeMode: AssessmentMode = session?.assessmentMode ?? selectedMode ?? 'assessment';
  const isRehabMode = activeMode === 'rehabilitation';
  const isReassessMode = activeMode === 'reassessment';

  // Effective showHint: in rehab, driven by cue count; otherwise simpleMode
  const effectiveShowHint = isRehabMode ? rehabShowHint : showHints;

  // Target contact for SMS: 'son' in reassessment, 'daughter' otherwise
  const targetContactId = isReassessMode ? 'son' : 'daughter';

  // Derived display strings â€” declared early so hooks can safely close over them
  const displayHint = currentStep
    ? (isReassessMode
        ? (currentStep.reassessmentHints?.[0] ?? currentStep.hints?.[0])
        : currentStep.hints?.[0])
    : undefined;

  // â”€â”€ Resume prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!isRunning && !session && savedProgressExists) {
      setShowResumePrompt(true);
    }
  }, [isRunning, session, savedProgressExists]);

  // â”€â”€ Step synchronization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!currentStep || !currentModule) return;
    setStepCompleted(false);
    setAutomatedScore(null);
    setWrongAppScreen(null);
    // Reset rehab cue state on every new step
    setRehabCueCount(0);
    setRehabShowHint(false);
    setShowDemoOverlay(false);
    setShowStepByStep(false);
    setShowTryAgain(false);
    setShowSuccessFlash(false);

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

  // â”€â”€ Rehab: success flash when task completes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (stepCompleted && isRehabMode) {
      setShowSuccessFlash(true);
      const t = setTimeout(() => setShowSuccessFlash(false), 1000);
      return () => clearTimeout(t);
    }
  }, [stepCompleted, isRehabMode]);

  // â”€â”€ Cancel any ongoing speech when component unmounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // â”€â”€ Reset sim to current step's initial state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const resetCurrentSim = useCallback(() => {
    if (!currentModule || !currentStep) return;
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
    setStepCompleted(false);
    setAutomatedScore(null);
    setSimulatorResetKey(k => k + 1);
  }, [currentModule, currentStep]);

  // â”€â”€ Step completion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      const updatedSession = completeStep(score, undefined, cueLevel, cueLabel);

      if (isLastStep) {
        setShowCongrats(true);
        // Use the synchronous return value â€” avoids closure staleness
        if (updatedSession?.endTime) {
          setIsAssessmentComplete(true);
        }
      }
    },
    [completeStep, currentModule, stepIndex],
  );

  // Called by DemoPointer when its animation finishes
  const handleDemoDone = useCallback(() => {
    setShowDemoOverlay(false);
    resetCurrentSim();
  }, [resetCurrentSim]);

  // â”€â”€ Rehab cue delivery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const giveNextCue = useCallback(() => {
    const next = rehabCueCount + 1;
    setRehabCueCount(next);

    if (next === 1) {
      speak(displayHint ?? 'Review the instructions and try again.');
    } else if (next === 2) {
      setRehabShowHint(true);
    } else if (next === 3) {
      // DemoPointer handles its own timing and calls handleDemoDone when done
      setShowDemoOverlay(true);
    } else if (next === 4) {
      setShowStepByStep(true);
    }
  }, [rehabCueCount, displayHint]);

  // â”€â”€ Rehab confirmation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleRehabConfirm = useCallback(() => {
    const { level, label } = computeRehabCueResult(rehabCueCount);
    const score: Score = level === 3 ? 2 : level >= 1 ? 1 : 0;
    handleStepComplete(score, level, label);
  }, [rehabCueCount, handleStepComplete]);

  const handleRehabUnable = useCallback(() => {
    handleStepComplete(0, 0 as CueLevel, 'Unable');
  }, [handleStepComplete]);

  // â”€â”€ Patient override (skip task after 5+ misclicks) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handlePatientOverride = useCallback(() => {
    const isLastStep = currentModule != null && stepIndex >= currentModule.steps.length - 1;
    if (isLastStep && currentModule) {
      setCompletedModuleInfo({
        name: currentModule.name,
        question: currentModule.openEndedQuestion,
        moduleId: currentModule.id,
      });
    }
    setAutomatedScore(null);
    setStepCompleted(false);
    const updatedSession = completeStep(0, 0, 0, 'Unable', true);
    if (isLastStep) {
      setShowCongrats(true);
      if (updatedSession?.endTime) {
        setIsAssessmentComplete(true);
      }
    }
  }, [completeStep, currentModule, stepIndex]);

  const nextStepInstruction = (() => {
    if (!session || !currentModule) return null;
    const nextIdx = stepIndex + 1;
    if (nextIdx < currentModule.steps.length) {
      return currentModule.steps[nextIdx].instruction;
    }
    const nextMod = eadlModules[session.currentModuleIndex + 1];
    return nextMod?.steps[0]?.instruction ?? null;
  })();

  // â”€â”€ DC SMS handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      if (sid === 'dc-step1' && contactId === targetContactId) {
        setPhoneScreen('messages-conversation');
      }
    },
    [currentStep, stepCompleted, targetContactId],
  );

  const handleSendMessage = useCallback(
    (_message: string) => {
      if (stepCompleted) return;
      if (currentStep?.id === 'dc-step1') {
        setAutomatedScore(currentWrongScreenCount >= 1 ? 1 : 2);
        setStepCompleted(true);
      }
    },
    [currentStep, stepCompleted, currentWrongScreenCount],
  );

  // â”€â”€ DC Gmail handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleGmailAction = useCallback(
    (action: string) => {
      if (stepCompleted) return;
      if (action === 'send_email' && currentStep?.id === 'dc-step2') {
        setAutomatedScore(currentWrongScreenCount >= 1 ? 1 : 2);
        setStepCompleted(true);
      }
    },
    [currentStep, stepCompleted, currentWrongScreenCount],
  );

  // â”€â”€ DC Telehealth handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTelehealthAction = useCallback(
    (action: string) => {
      if (stepCompleted) return;
      if (currentStep?.id === 'dc-step3') {
        const expectedAction = isReassessMode ? 'toggle_camera' : 'toggle_mute';
        if (action === expectedAction) {
          setAutomatedScore(currentWrongScreenCount >= 1 ? 1 : 2);
          setStepCompleted(true);
        }
      }
    },
    [currentStep, stepCompleted, isReassessMode, currentWrongScreenCount],
  );

  // â”€â”€ EHR MyChart handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleMyChartAction = useCallback(
    (action: string) => {
      if (stepCompleted) return;
      const sid = currentStep?.id;
      const adjustedScore: Score = currentWrongScreenCount >= 1 ? 1 : 2;
      switch (action) {
        case 'open_result':
          if (sid === 'ehr-step1') { setAutomatedScore(adjustedScore); setStepCompleted(true); }
          break;
        case 'view_appointment':
          if (sid === 'ehr-step2') { setAutomatedScore(adjustedScore); setStepCompleted(true); }
          break;
        case 'send_message':
          if (sid === 'ehr-step3') { setAutomatedScore(adjustedScore); setStepCompleted(true); }
          break;
      }
    },
    [currentStep, stepCompleted, currentWrongScreenCount],
  );

  // â”€â”€ Misclick â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleMisclick = useCallback(
    (errorType: ErrorType = 'targeting') => {
      recordMisclick(errorType);
      if (isRehabMode) {
        setShowTryAgain(true);
        setTimeout(() => setShowTryAgain(false), 1500);
      }
    },
    [recordMisclick, isRehabMode],
  );

  // â”€â”€ Wrong-screen navigation (cross-app, from HomeScreen) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleWrongAppTap = useCallback(
    (appId: string) => {
      setWrongAppScreen(appId);
      recordWrongScreenNav(`phone-${appId}`);
    },
    [recordWrongScreenNav],
  );

  const handleGoBackFromWrongApp = useCallback(() => {
    setWrongAppScreen(null);
    recordGoBack();
  }, [recordGoBack]);

  // â”€â”€ Module overview helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  const handleEnterSpecificModule = useCallback(
    (moduleIndex: number) => {
      if (!session) {
        startAssessment(true, false, moduleIndex, selectedMode ?? 'assessment');
      } else {
        jumpToModule(moduleIndex);
      }
      setShowModuleOverview(false);
    },
    [session, startAssessment, jumpToModule, selectedMode],
  );

  const handleEnterModule = useCallback(() => {
    handleEnterSpecificModule(session ? session.currentModuleIndex : 0);
  }, [handleEnterSpecificModule, session]);

  // â”€â”€ Open-ended response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleOpenEndedSubmit = useCallback(
    (response: string) => {
      if (completedModuleInfo) {
        setOpenEndedResponse(completedModuleInfo.moduleId, response);
      }
      setShowOpenEnded(false);
      setShowCongrats(false);
      setCompletedModuleInfo(null);
      if (isAssessmentComplete) {
        navigate('/dashboard');
      } else {
        setShowModuleOverview(true);
      }
    },
    [setOpenEndedResponse, completedModuleInfo, isAssessmentComplete, navigate],
  );

  // â”€â”€ Difficulty / restart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleDifficulty = useCallback(() => {
    setDifficultyMode(simpleMode ? 'complex' : 'simple');
  }, [simpleMode, setDifficultyMode]);

  const restartModule = useCallback(() => {
    clearProgress();
    setPhoneScreen('home');
    setMyChartScreen('results');
    setWrongAppScreen(null);
    setAutomatedScore(null);
    setStepCompleted(false);
    setRehabCueCount(0);
    setRehabShowHint(false);
    setShowDemoOverlay(false);
    setShowStepByStep(false);
  }, [clearProgress]);

  const handleResume = useCallback(() => setShowResumePrompt(false), []);
  const handleStartOver = useCallback(() => {
    setShowResumePrompt(false);
    resetAssessment();
    setSelectedMode(null);
    setIsAssessmentComplete(false);
  }, [resetAssessment]);

  const isModuleCompletePhase =
    (showCongrats || showOpenEnded) && completedModuleInfo != null;

  // â”€â”€ Resume prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Mode selection (only for fresh sessions, before module overview) â”€â”€â”€â”€â”€â”€â”€
  if (!savedProgressExists && !session && selectedMode === null) {
    return <ModeSelection onSelect={setSelectedMode} />;
  }

  // â”€â”€ Module overview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (showModuleOverview) {
    const activeIndex = session ? session.currentModuleIndex : 0;
    const completedCount = eadlModules.filter(m => isModuleCompleted(m.id)).length;
    const isFirst = completedCount === 0;
    const allDone = completedCount === eadlModules.length;
    const activeModule = eadlModules[activeIndex];
    const estMins = (steps: number) => `~${steps * 2} min`;
    const totalActiveMins = eadlModules.reduce((s, m) => s + m.steps.length * 2, 0);
    const modeBadge = MODE_BADGE[activeMode];

    return (
      <div className="min-h-screen bg-gradient-subtle">
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-foreground">eADL Assessment</h1>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', modeBadge.cls)}>
                    {modeBadge.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {eadlModules.length} modules complete
                  {allDone ? '' : ' Â· 5 more coming soon'}
                </p>
              </div>
            </div>
            {completedCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/40">
                    <RotateCcw className="h-3.5 w-3.5" />
                    New Patient
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Start New Session</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will begin a fresh assessment session. Your completed session data is saved to history and will not be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { resetAssessment(); setIsAssessmentComplete(false); }}>
                      Start New Session
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </header>

        <main className="container px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {completedCount === 0 ? 'Ready to Begin?' : completedCount === eadlModules.length ? 'All Done!' : 'Module Complete!'}
            </h2>
            <p className="text-muted-foreground">
              {completedCount === 0
                ? 'Tap either module below to begin â€” you can complete them in any order.'
                : completedCount === eadlModules.length
                ? 'Both modules completed. Great work!'
                : `${completedCount} of ${eadlModules.length} modules complete. Tap the remaining module to continue.`}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Active modules: ~{totalActiveMins} min total
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {eadlModules.map((module, index) => {
              const completed = isModuleCompleted(module.id);
              const remainingCount = eadlModules.filter(m => !isModuleCompleted(m.id)).length;
              const badgeLabel = completed ? 'Done' : remainingCount === 1 ? 'Up Next' : 'Available';

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
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
                      completed ? 'bg-success/10' : 'bg-primary/10 text-2xl',
                    )}>
                      {completed ? <CheckCircle2 className="h-6 w-6 text-success" /> : getModuleIcon(module.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Module {index + 1}</span>
                        <span className={cn('text-xs font-semibold', completed ? 'text-success' : 'text-primary')}>
                          {badgeLabel}
                        </span>
                      </div>
                      <h3 className={cn('font-semibold', completed ? 'text-muted-foreground' : 'text-foreground')}>
                        {module.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{module.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{module.steps.length} tasks</span>
                        <span>Â·</span>
                        <span>{estMins(module.steps.length)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

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
                      <span className="text-xs font-medium text-muted-foreground">{mod.category}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{mod.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mod.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={allDone ? () => navigate('/dashboard') : handleEnterModule}
              className="gap-2 px-8"
            >
              {allDone ? 'View Results' : isFirst ? 'Begin Assessment' : `Continue â€” ${activeModule?.name}`}
              <ArrowRight className="h-5 w-5" />
            </Button>

          </div>
        </main>
      </div>
    );
  }

  // â”€â”€ Loading guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isModuleCompletePhase && (!session || !currentModule || !currentStep)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading assessmentâ€¦</p>
        </div>
      </div>
    );
  }

  const headerTitle = isModuleCompletePhase ? completedModuleInfo!.name : currentModule?.name;
  const headerSubtitle = isModuleCompletePhase ? 'Module Complete' : `Step ${stepIndex + 1} of ${currentModule?.steps.length}`;
  const modeBadge = MODE_BADGE[activeMode];

  // Safe access â€” currentStep is undefined after last step while congrats/OEQ shows
  const displayInstruction = currentStep
    ? (isReassessMode
        ? (currentStep.reassessmentInstruction ?? currentStep.instruction)
        : currentStep.instruction)
    : '';

  const sysKey = currentStep
    ? currentStep.id + (isReassessMode ? '-r' : '')
    : '';
  const stepByStepSteps = STEP_BY_STEP[sysKey] ?? [];

  // â”€â”€ Active assessment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className={cn(
      'bg-background',
      isRehabMode && !isModuleCompletePhase ? 'flex flex-col h-screen overflow-hidden' : 'min-h-screen',
    )}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md flex-shrink-0">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm text-foreground leading-tight">{headerTitle}</h1>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold hidden sm:inline-flex', modeBadge.cls)}>
                  {modeBadge.label}
                </span>
              </div>
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

      {/* Sticky progress + instruction block */}
      {!isModuleCompletePhase && currentModule && currentStep && (
        <div className="sticky top-14 z-30 flex-shrink-0 bg-card/95 backdrop-blur-sm border-b shadow-md">
          {/* Progress bar */}
          <div className="border-b px-4 py-2">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Step {stepIndex + 1} of {currentModule.steps.length}</span>
                <span>{Math.round(((stepIndex + 1) / currentModule.steps.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((stepIndex + 1) / currentModule.steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
          {/* Instruction card */}
          <div className="px-4 py-2.5 sm:py-3.5 max-w-2xl mx-auto">
            <p className="font-medium text-foreground text-sm sm:text-base leading-snug">{displayInstruction}</p>
            {!isRehabMode && simpleMode && displayHint && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-primary/5 px-2.5 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-muted-foreground flex-1 leading-snug">{displayHint}</p>
                <button
                  onClick={() => speak(displayHint)}
                  className="shrink-0 p-0.5 text-primary/60 hover:text-primary transition-colors"
                  title="Read hint aloud"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={cn(
        'max-w-2xl mx-auto px-4 py-5 space-y-5',
        isRehabMode && !isModuleCompletePhase && 'flex-1 overflow-y-auto',
      )}>
        {isModuleCompletePhase ? (
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
                  <span className="font-semibold text-foreground">{completedModuleInfo!.name}</span>.
                  Please answer the short question below.
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
          <>
            {/* Rehab: verbal cue banner (shown once cue 1 is given) */}
            {isRehabMode && rehabCueCount >= 1 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-amber-800 flex-1">
                  Verbal Cue: {displayHint ?? 'Review the instructions and try again.'}
                </p>
                <button
                  onClick={() => speak(displayHint ?? 'Review the instructions and try again.')}
                  className="shrink-0 p-1 text-amber-600 hover:text-amber-800 transition-colors"
                  title="Read cue aloud"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Try again flash (rehab misclick) */}
            {showTryAgain && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-center">
                <p className="text-sm font-medium text-orange-700">Try again</p>
              </div>
            )}

            {/* Success flash (rehab task complete, 1s) */}
            {showSuccessFlash && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">Step complete!</p>
              </div>
            )}

            {/* Step-by-step checklist â€” rendered above simulator, never overlaid */}
            {showStepByStep && stepByStepSteps.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-foreground mb-3">Step-by-Step Instructions</p>
                <ol className="space-y-2.5">
                  {stepByStepSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* â”€â”€ Digital Communications simulator â”€â”€ */}
            {isDCModule && (
              <div className="isolate space-y-2">
                {/* Persistent "wrong app" banner â€” shown when patient navigated off-task */}
                {wrongAppScreen && (
                  <div className="space-y-1.5">
                    <button
                      onClick={handleGoBackFromWrongApp}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Wrong app â€” tap to return to task
                    </button>
                    {currentStepMisclicks >= OVERRIDE_THRESHOLD && !stepCompleted && (
                      <button
                        onClick={handlePatientOverride}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
                      >
                        OVERRIDE â€” skip this task
                      </button>
                    )}
                  </div>
                )}
                <div className="relative flex justify-center">
                  {showDemoOverlay && !wrongAppScreen && (
                    <DemoPointer stepKey={sysKey} onDone={handleDemoDone} />
                  )}
                  <PhoneFrame className="w-[320px]">
                    {/* Realistic wrong-app screens — shared WrongAppScreen wrapper adds sticky strip */}
                    {wrongAppScreen && (
                      <WrongAppScreen onGoBack={handleGoBackFromWrongApp}>
                        {wrongAppScreen === 'phone' && <PhoneRecentsScreen />}
                        {wrongAppScreen === 'mail' && (
                          <GmailApp
                            simpleMode={simpleMode}
                            showHint={false}
                            onMisclick={() => handleMisclick('targeting')}
                            onWrongEmailNav={(name) => recordWrongScreenNav(`mail-${name}`)}
                            onGoBackFromWrong={recordGoBack}
                          />
                        )}
                        {wrongAppScreen === 'settings' && <SettingsScreen />}
                        {wrongAppScreen === 'music' && <MusicScreen />}
                        {!['phone', 'mail', 'settings', 'music'].includes(wrongAppScreen) && (
                          <GenericAppLaunchScreen appId={wrongAppScreen} />
                        )}
                      </WrongAppScreen>
                    )}

                    {/* Normal simulator screens */}
                    {!wrongAppScreen && phoneScreen === 'home' && (
                      <HomeScreen
                        onAppTap={handleAppTap}
                        onWrongAppTap={handleWrongAppTap}
                        targetApps={['messages']}
                        simpleMode={simpleMode}
                        highlightTarget="messages"
                        showHint={effectiveShowHint}
                      />
                    )}

                    {!wrongAppScreen && (phoneScreen === 'messages' || phoneScreen === 'messages-conversation') && (
                      <MessagesApp
                        key={simulatorResetKey}
                        onBack={() => setPhoneScreen('home')}
                        onContactSelect={handleContactSelect}
                        onSendMessage={handleSendMessage}
                        onMisclick={() => handleMisclick('targeting')}
                        onWrongContactNav={(name) => recordWrongScreenNav(`messages-${name}`)}
                        onGoBackFromWrong={recordGoBack}
                        targetContact={targetContactId}
                        simpleMode={simpleMode}
                        showHint={effectiveShowHint}
                        currentStep={phoneScreen === 'messages-conversation' ? 'conversation' : 'list'}
                        variant={isReassessMode ? 'reassessment' : undefined}
                      />
                    )}

                    {!wrongAppScreen && phoneScreen === 'gmail' && (
                      <GmailApp
                        key={simulatorResetKey}
                        onAction={handleGmailAction}
                        onMisclick={() => handleMisclick('targeting')}
                        onWrongEmailNav={(name) => recordWrongScreenNav(`gmail-${name}`)}
                        onGoBackFromWrong={recordGoBack}
                        simpleMode={simpleMode}
                        showHint={effectiveShowHint}
                        variant={isReassessMode ? 'reassessment' : undefined}
                      />
                    )}

                    {!wrongAppScreen && phoneScreen === 'telehealth' && (
                      <TelehealthCall
                        key={simulatorResetKey}
                        onAction={handleTelehealthAction}
                        onMisclick={() => handleMisclick('targeting')}
                        onWrongAction={(action) => recordWrongScreenNav(`telehealth-${action}`)}
                        onGoBackFromWrong={recordGoBack}
                        simpleMode={simpleMode}
                        showHint={effectiveShowHint}
                        variant={isReassessMode ? 'reassessment' : undefined}
                      />
                    )}
                  </PhoneFrame>
                </div>
              </div>
            )}

            {/* â”€â”€ EHR simulator â”€â”€ */}
            {isEHRModule && (
              <div className="relative rounded-xl border shadow-xl overflow-hidden isolate">
                {showDemoOverlay && (
                  <DemoPointer stepKey={sysKey} onDone={handleDemoDone} />
                )}
                <div className="h-[540px]">
                  <MyChartPortal
                    key={simulatorResetKey}
                    onAction={handleMyChartAction}
                    onMisclick={() => handleMisclick('targeting')}
                    onWrongNav={(name) => recordWrongScreenNav(`mychart-${name}`)}
                    onGoBackFromWrong={recordGoBack}
                    currentStep={currentStep?.id ?? ''}
                    simpleMode={simpleMode}
                    showHint={effectiveShowHint}
                    screen={myChartScreen}
                    variant={isReassessMode ? 'reassessment' : undefined}
                  />
                </div>
              </div>
            )}

            {/* Scoring panel â€” hidden in rehab mode (TherapistPanel handles confirmation) */}
            {!isRehabMode && (
              currentStepMisclicks >= OVERRIDE_THRESHOLD && !stepCompleted ? (
                <div className="p-4 border-t bg-background">
                  <div className="rounded-xl border-2 border-orange-400 bg-orange-50 dark:bg-orange-950/30 p-5 flex flex-col items-center gap-3 text-center">
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                      Having trouble with this task?
                    </p>
                    {nextStepInstruction && (
                      <p className="text-xs text-orange-700 dark:text-orange-400">
                        Next task: <span className="font-medium">{nextStepInstruction}</span>
                      </p>
                    )}
                    <button
                      onClick={handlePatientOverride}
                      className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-lg py-3 px-6 transition-colors"
                    >
                      OVERRIDE
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Press OVERRIDE to skip this task and continue to the next step.
                    </p>
                  </div>
                </div>
              ) : (
                <ScoringPanel
                  stepInstruction={displayInstruction}
                  automatedScore={automatedScore}
                  onScoreSubmit={handleStepComplete}
                  hints={isReassessMode ? currentStep?.reassessmentHints : currentStep?.hints}
                  simpleMode={simpleMode}
                  allowOverride={true}
                  taskCompleted={stepCompleted}
                />
              )
            )}
          </>
        )}
      </main>

      {/* Therapist panel â€” sticky bottom bar in rehab mode */}
      {isRehabMode && !isModuleCompletePhase && (
        <TherapistPanel
          cueCount={rehabCueCount}
          taskCompleted={stepCompleted}
          onGiveNextCue={giveNextCue}
          onConfirmCompleted={handleRehabConfirm}
          onMarkUnable={handleRehabUnable}
        />
      )}
    </div>
  );
};

export default Assessment;
