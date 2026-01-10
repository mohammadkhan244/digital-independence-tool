// Core Assessment Types

export type Score = 0 | 1 | 2 | 'N/A';

export type ErrorType = 
  | 'navigation'      // Wrong app opened
  | 'targeting'       // Wrong field/button pressed
  | 'sequencing'      // Steps out of order
  | 'attention'       // Missed notification/prompt
  | 'abandonment';    // Timeout/gave up

export type DifficultyMode = 'simple' | 'complex';

export interface TaskStep {
  id: string;
  instruction: string;
  targetElement?: string;
  expectedAction: string;
  hints?: string[];
  timeoutSeconds?: number;
}

export interface StepResult {
  stepId: string;
  score: Score;
  automatedScore: Score;
  overridden: boolean;
  timeToFirstInteraction: number | null;
  timeToCompletion: number | null;
  misclicks: number;
  backtracks: number;
  abandoned: boolean;
  errors: ErrorType[];
  timestamp: number;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: TaskStep[];
  openEndedQuestion: string;
  simpleMode: {
    iconCount: number;
    buttonSize: 'large' | 'xlarge';
    showHints: boolean;
    reducedClutter: boolean;
  };
  complexMode: {
    iconCount: number;
    buttonSize: 'normal' | 'small';
    showHints: boolean;
    distractors: boolean;
  };
}

export interface ModuleResult {
  moduleId: string;
  difficultyMode: DifficultyMode;
  stepResults: StepResult[];
  openEndedResponse: string;
  totalTime: number;
  startTime: number;
  endTime: number;
  errorsByType: Record<ErrorType, number>;
  subtotalScore: number;
  maxPossibleScore: number;
  independentStepsPercentage: number;
}

export interface AssessmentSession {
  id: string;
  participantId: string;
  startTime: number;
  endTime?: number;
  currentModuleIndex: number;
  currentStepIndex: number;
  difficultyMode: DifficultyMode;
  adaptiveModeEnabled: boolean;
  eyeTrackingEnabled: boolean;
  moduleResults: ModuleResult[];
  version: string;
}

export interface PerformanceAnalytics {
  totalAssessmentTime: number;
  totalMisclicks: number;
  totalBacktracks: number;
  abandonedSteps: number;
  averageTimePerStep: number;
  errorProfile: Record<ErrorType, number>;
  compositeScore: number;
  maxPossibleScore: number;
  scorePercentage: number;
  moduleScores: Array<{
    moduleId: string;
    moduleName: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
}

export interface AOIRegion {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'left' | 'right' | 'center';
}

export interface EyeTrackingEvent {
  type: 'page_load' | 'task_start' | 'task_end' | 'click' | 'prompt_shown' | 'step_complete';
  timestamp: number;
  moduleId: string;
  stepId?: string;
  targetElement?: string;
  coordinates?: { x: number; y: number };
}

export interface ClinicianOverride {
  stepId: string;
  moduleId: string;
  originalScore: Score;
  overriddenScore: Score;
  reason: string;
  timestamp: number;
}
