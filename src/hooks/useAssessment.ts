import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AssessmentSession,
  ModuleResult,
  StepResult,
  Score,
  CueLevel,
  ErrorType,
  DifficultyMode,
  EyeTrackingEvent,
} from '@/types/assessment';
import { eadlModules } from '@/data/modules';
import {
  loadSavedProgress,
  saveProgress,
  clearProgress,
  hasSavedProgress,
  saveResults,
  loadResults,
  clearResults,
} from './useAssessmentPersistence';

const ASSESSMENT_VERSION = '1.0.0';

const generateId = () => Math.random().toString(36).substring(2, 15);

const createEmptyStepResult = (stepId: string): StepResult => ({
  stepId,
  score: 'N/A',
  automatedScore: 'N/A',
  overridden: false,
  timeToFirstInteraction: null,
  timeToCompletion: null,
  misclicks: 0,
  backtracks: 0,
  abandoned: false,
  errors: [],
  timestamp: Date.now(),
});

export const useAssessment = () => {
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  // Expose setter so resetAssessment can prevent the resume-prompt useEffect
  // from re-firing after a deliberate clear (vs. an accidental exit)
  const [savedProgressExists, setSavedProgressExists] = useState(() => hasSavedProgress());
  const [currentStepStartTime, setCurrentStepStartTime] = useState<number | null>(null);
  const [firstInteractionRecorded, setFirstInteractionRecorded] = useState(false);
  
  const eyeTrackingEvents = useRef<EyeTrackingEvent[]>([]);
  const stepMisclicks = useRef(0);
  const stepBacktracks = useRef(0);
  const stepErrors = useRef<ErrorType[]>([]);

  // Initialize a new assessment session
  const startAssessment = useCallback((adaptiveMode: boolean = true, eyeTracking: boolean = false, startModuleIndex: number = 0) => {
    clearProgress();
    clearResults();
    const newSession: AssessmentSession = {
      id: generateId(),
      participantId: `P-${Date.now()}`,
      startTime: Date.now(),
      currentModuleIndex: startModuleIndex,
      currentStepIndex: 0,
      difficultyMode: 'simple',
      adaptiveModeEnabled: adaptiveMode,
      eyeTrackingEnabled: eyeTracking,
      moduleResults: [],
      version: ASSESSMENT_VERSION,
    };
    
    setSession(newSession);
    setIsRunning(true);
    setCurrentStepStartTime(Date.now());
    setFirstInteractionRecorded(false);
    stepMisclicks.current = 0;
    stepBacktracks.current = 0;
    stepErrors.current = [];

    // Log eye tracking event
    if (eyeTracking) {
      eyeTrackingEvents.current.push({
        type: 'task_start',
        timestamp: Date.now(),
        moduleId: eadlModules[0].id,
        stepId: eadlModules[0].steps[0].id,
      });
    }

    saveProgress(newSession);

    return newSession;
  }, []);

  // Record user interaction (first touch/click)
  const recordInteraction = useCallback(() => {
    if (!firstInteractionRecorded && currentStepStartTime) {
      setFirstInteractionRecorded(true);
    }
  }, [firstInteractionRecorded, currentStepStartTime]);

  // Record a misclick
  const recordMisclick = useCallback((errorType?: ErrorType) => {
    stepMisclicks.current += 1;
    if (errorType) {
      stepErrors.current.push(errorType);
    }
  }, []);

  // Record a backtrack
  const recordBacktrack = useCallback(() => {
    stepBacktracks.current += 1;
  }, []);

  // Complete the current step
  const completeStep = useCallback((automatedScore: Score, manualOverride?: Score, cueLevel?: CueLevel, cueLabel?: string) => {
    if (!session || !currentStepStartTime) return;

    const currentModule = eadlModules[session.currentModuleIndex];
    const currentStep = currentModule.steps[session.currentStepIndex];

    const timeToCompletion = Date.now() - currentStepStartTime;
    const timeToFirstInteraction = firstInteractionRecorded
      ? Math.min(timeToCompletion, 5000) // Cap at 5 seconds for demo
      : null;

    const stepResult: StepResult = {
      stepId: currentStep.id,
      score: manualOverride ?? automatedScore,
      automatedScore,
      overridden: manualOverride !== undefined && manualOverride !== automatedScore,
      timeToFirstInteraction,
      timeToCompletion,
      misclicks: stepMisclicks.current,
      backtracks: stepBacktracks.current,
      abandoned: false,
      errors: [...stepErrors.current],
      timestamp: Date.now(),
      cueLevel,
      cueLabel,
    };

    // Update or create module result
    const existingModuleResult = session.moduleResults.find(
      m => m.moduleId === currentModule.id
    );

    let updatedModuleResults: ModuleResult[];
    
    if (existingModuleResult) {
      updatedModuleResults = session.moduleResults.map(m => 
        m.moduleId === currentModule.id
          ? { ...m, stepResults: [...m.stepResults, stepResult] }
          : m
      );
    } else {
      const newModuleResult: ModuleResult = {
        moduleId: currentModule.id,
        difficultyMode: session.difficultyMode,
        stepResults: [stepResult],
        openEndedResponse: '',
        totalTime: 0,
        startTime: currentStepStartTime,
        endTime: 0,
        errorsByType: { navigation: 0, targeting: 0, sequencing: 0, attention: 0, abandonment: 0 },
        subtotalScore: 0,
        maxPossibleScore: currentModule.steps.length * 3,
        independentStepsPercentage: 0,
      };
      updatedModuleResults = [...session.moduleResults, newModuleResult];
    }

    // Move to next step or module
    const isLastStep = session.currentStepIndex >= currentModule.steps.length - 1;

    // Determine if ALL modules will be completed after this step
    const completedModuleIdsAfterThis = new Set([
      ...updatedModuleResults
        .filter(m => {
          const def = eadlModules.find(d => d.id === m.moduleId);
          return def && m.stepResults.length >= def.steps.length;
        })
        .map(m => m.moduleId),
      currentModule.id,
    ]);
    const isLastModule = completedModuleIdsAfterThis.size >= eadlModules.length;

    let newModuleIndex = session.currentModuleIndex;
    let newStepIndex = session.currentStepIndex + 1;

    if (isLastStep) {
      // Calculate module totals before moving on
      const moduleResult = updatedModuleResults.find(m => m.moduleId === currentModule.id)!;
      const totalScore = moduleResult.stepResults.reduce((sum, s) => {
        if (s.score === 'N/A') return sum;
        return sum + (s.cueLevel ?? (s.score as number));
      }, 0);
      const scoredSteps = moduleResult.stepResults.filter(s => s.score !== 'N/A');
      const independentSteps = moduleResult.stepResults.filter(s => s.score === 2).length;

      const errorCounts: Record<ErrorType, number> = {
        navigation: 0, targeting: 0, sequencing: 0, attention: 0, abandonment: 0
      };
      moduleResult.stepResults.forEach(s => {
        s.errors.forEach(e => errorCounts[e]++);
        if (s.abandoned) errorCounts.abandonment++;
      });

      updatedModuleResults = updatedModuleResults.map(m =>
        m.moduleId === currentModule.id
          ? {
              ...m,
              endTime: Date.now(),
              totalTime: Date.now() - m.startTime,
              subtotalScore: totalScore,
              independentStepsPercentage: scoredSteps.length > 0
                ? (independentSteps / scoredSteps.length) * 100
                : 0,
              errorsByType: errorCounts,
            }
          : m
      );

      if (!isLastModule) {
        // Find the first uncompleted module (non-sequential support)
        const nextIdx = eadlModules.findIndex(m => !completedModuleIdsAfterThis.has(m.id));
        newModuleIndex = nextIdx >= 0 ? nextIdx : session.currentModuleIndex;
        newStepIndex = 0;

        // Adaptive difficulty logic
        if (session.adaptiveModeEnabled) {
          const moduleResult = updatedModuleResults.find(m => m.moduleId === currentModule.id)!;
          const totalErrors = Object.values(moduleResult.errorsByType).reduce((a, b) => a + b, 0);

          if (moduleResult.independentStepsPercentage >= 80 && totalErrors <= 2) {
            // Progress to complex mode
            setSession(prev => prev ? { ...prev, difficultyMode: 'complex' } : null);
          }
        }
      }
    }

    const updatedSession: AssessmentSession = {
      ...session,
      moduleResults: updatedModuleResults,
      currentModuleIndex: newModuleIndex,
      currentStepIndex: newStepIndex,
      endTime: isLastStep && isLastModule ? Date.now() : undefined,
    };

    setSession(updatedSession);
    setCurrentStepStartTime(Date.now());
    setFirstInteractionRecorded(false);
    stepMisclicks.current = 0;
    stepBacktracks.current = 0;
    stepErrors.current = [];

    if (isLastStep && isLastModule) {
      clearProgress();
      saveResults(updatedSession); // persist for dashboard; open-ended response added later
    } else {
      saveProgress(updatedSession);
    }

    // Log eye tracking event
    if (session.eyeTrackingEnabled) {
      eyeTrackingEvents.current.push({
        type: 'step_complete',
        timestamp: Date.now(),
        moduleId: currentModule.id,
        stepId: currentStep.id,
      });
    }

    if (isLastStep && isLastModule) {
      setIsRunning(false);
    }

    return updatedSession;
  }, [session, currentStepStartTime, firstInteractionRecorded]);

  // Abandon current step (timeout) — records as Unable (cue level 0)
  const abandonStep = useCallback(() => {
    if (!session) return;

    stepErrors.current.push('abandonment');
    completeStep(0, undefined, 0, 'Unable');
  }, [session, completeStep]);

  // Set open-ended response for a specific module (pass the moduleId explicitly so
  // non-sequential completion doesn't accidentally write to the wrong module)
  const setOpenEndedResponse = useCallback((moduleId: string, response: string) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return null;

      const updatedResults = prev.moduleResults.map(m =>
        m.moduleId === moduleId
          ? { ...m, openEndedResponse: response }
          : m
      );

      const updated = { ...prev, moduleResults: updatedResults };
      // Completed sessions (endTime set) live in the results key, not the progress key
      if (prev.endTime) {
        saveResults(updated);
      } else {
        saveProgress(updated);
      }
      return updated;
    });
  }, [session]);

  // Force difficulty mode (clinician override)
  const setDifficultyMode = useCallback((mode: DifficultyMode) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, difficultyMode: mode };
      saveProgress(updated);
      return updated;
    });
  }, []);

  // Get current module and step
  const getCurrentContext = useCallback(() => {
    if (!session) return null;
    
    const module = eadlModules[session.currentModuleIndex];
    const step = module?.steps[session.currentStepIndex];
    
    return { module, step, stepIndex: session.currentStepIndex };
  }, [session]);

  // Calculate overall analytics
  const getAnalytics = useCallback(() => {
    if (!session) return null;

    let totalTime = 0;
    let totalMisclicks = 0;
    let totalBacktracks = 0;
    let abandonedSteps = 0;
    let compositeScore = 0;
    let maxPossibleScore = 0;
    const errorProfile: Record<ErrorType, number> = {
      navigation: 0,
      targeting: 0,
      sequencing: 0,
      attention: 0,
      abandonment: 0,
    };

    const moduleScores: Array<{
      moduleId: string;
      moduleName: string;
      score: number;
      maxScore: number;
      percentage: number;
    }> = [];

    session.moduleResults.forEach(result => {
      const moduleDef = eadlModules.find(m => m.id === result.moduleId);
      
      totalTime += result.totalTime;
      
      result.stepResults.forEach(step => {
        totalMisclicks += step.misclicks;
        totalBacktracks += step.backtracks;
        if (step.abandoned) abandonedSteps++;

        // step.errors is the authoritative source; errorsByType is derived from the
        // same data so we do NOT also iterate result.errorsByType (avoids double-count)
        step.errors.forEach(e => errorProfile[e]++);

        if (step.score !== 'N/A') {
          compositeScore += step.cueLevel ?? (step.score as number);
          maxPossibleScore += 3;
        }
      });

      const cueBreakdown = result.stepResults.map(step => {
        const stepDef = moduleDef?.steps.find(s => s.id === step.stepId);
        const cl = step.cueLevel ?? null;
        return {
          stepId: step.stepId,
          stepLabel: stepDef?.shortLabel ?? stepDef?.instruction ?? step.stepId,
          cueLevel: cl,
          cueLabel: step.cueLabel ?? null,
          completed: cl !== null ? cl > 0 : step.score !== 0,
        };
      });

      moduleScores.push({
        moduleId: result.moduleId,
        moduleName: moduleDef?.name || result.moduleId,
        score: result.subtotalScore,
        maxScore: result.maxPossibleScore,
        percentage: result.maxPossibleScore > 0
          ? (result.subtotalScore / result.maxPossibleScore) * 100
          : 0,
        cueBreakdown,
      });
    });

    const totalSteps = session.moduleResults.reduce(
      (sum, m) => sum + m.stepResults.length, 
      0
    );

    return {
      totalAssessmentTime: totalTime,
      totalMisclicks,
      totalBacktracks,
      abandonedSteps,
      averageTimePerStep: totalSteps > 0 ? totalTime / totalSteps : 0,
      errorProfile,
      compositeScore,
      maxPossibleScore,
      scorePercentage: maxPossibleScore > 0 ? (compositeScore / maxPossibleScore) * 100 : 0,
      moduleScores,
    };
  }, [session]);

  // Jump to a specific module (supports non-sequential access)
  const jumpToModule = useCallback((index: number) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, currentModuleIndex: index, currentStepIndex: 0 };
      saveProgress(updated);
      return updated;
    });
    setCurrentStepStartTime(Date.now());
    setFirstInteractionRecorded(false);
    stepMisclicks.current = 0;
    stepBacktracks.current = 0;
    stepErrors.current = [];
  }, []);

  // Reset all assessment state and clear both storage keys — used for "Retake"
  const resetAssessment = useCallback(() => {
    clearProgress();
    clearResults();
    setSession(null);
    setIsRunning(false);
    setCurrentStepStartTime(null);
    setFirstInteractionRecorded(false);
    setSavedProgressExists(false);
    stepMisclicks.current = 0;
    stepBacktracks.current = 0;
    stepErrors.current = [];
    eyeTrackingEvents.current = [];
  }, []);

  // Export data as CSV
  const exportCSV = useCallback(() => {
    if (!session) return '';

    const rows: string[] = [];
    rows.push('Module,Step,Score,AutomatedScore,Overridden,TimeToCompletion,Misclicks,Backtracks,Abandoned,Errors');

    session.moduleResults.forEach(result => {
      const moduleDef = eadlModules.find(m => m.id === result.moduleId);
      
      result.stepResults.forEach(step => {
        rows.push([
          moduleDef?.name || result.moduleId,
          step.stepId,
          step.score,
          step.automatedScore,
          step.overridden,
          step.timeToCompletion,
          step.misclicks,
          step.backtracks,
          step.abandoned,
          step.errors.join(';'),
        ].join(','));
      });
    });

    return rows.join('\n');
  }, [session]);

  // Export eye tracking AOI map
  const exportAOIMap = useCallback(() => {
    // This would be populated with actual AOI regions from the UI
    const aoiMap = {
      version: ASSESSMENT_VERSION,
      regions: [] as any[],
      events: eyeTrackingEvents.current,
    };
    return JSON.stringify(aoiMap, null, 2);
  }, []);

  // Load session from storage on mount.
  // In-progress sessions come from the progress key; completed sessions (for
  // the dashboard) fall back to the results key.
  useEffect(() => {
    const saved = loadSavedProgress() ?? loadResults();
    if (saved) {
      setSession(saved);
      if (!saved.endTime) {
        setIsRunning(true);
        setCurrentStepStartTime(Date.now());
      }
    }
  }, []);

  return {
    session,
    isRunning,
    savedProgressExists,
    clearProgress,
    resetAssessment,
    startAssessment,
    completeStep,
    abandonStep,
    recordInteraction,
    recordMisclick,
    recordBacktrack,
    jumpToModule,
    setOpenEndedResponse,
    setDifficultyMode,
    getCurrentContext,
    getAnalytics,
    exportCSV,
    exportAOIMap,
  };
};
