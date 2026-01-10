import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AssessmentSession,
  ModuleResult,
  StepResult,
  Score,
  ErrorType,
  DifficultyMode,
  EyeTrackingEvent,
} from '@/types/assessment';
import { eadlModules } from '@/data/modules';

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
  const [currentStepStartTime, setCurrentStepStartTime] = useState<number | null>(null);
  const [firstInteractionRecorded, setFirstInteractionRecorded] = useState(false);
  
  const eyeTrackingEvents = useRef<EyeTrackingEvent[]>([]);
  const stepMisclicks = useRef(0);
  const stepBacktracks = useRef(0);
  const stepErrors = useRef<ErrorType[]>([]);

  // Initialize a new assessment session
  const startAssessment = useCallback((adaptiveMode: boolean = true, eyeTracking: boolean = false) => {
    const newSession: AssessmentSession = {
      id: generateId(),
      participantId: `P-${Date.now()}`,
      startTime: Date.now(),
      currentModuleIndex: 0,
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

    // Save to session storage
    sessionStorage.setItem('eadl_session', JSON.stringify(newSession));
    
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
  const completeStep = useCallback((automatedScore: Score, manualOverride?: Score) => {
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
        maxPossibleScore: currentModule.steps.length * 2,
        independentStepsPercentage: 0,
      };
      updatedModuleResults = [...session.moduleResults, newModuleResult];
    }

    // Move to next step or module
    const isLastStep = session.currentStepIndex >= currentModule.steps.length - 1;
    const isLastModule = session.currentModuleIndex >= eadlModules.length - 1;

    let newModuleIndex = session.currentModuleIndex;
    let newStepIndex = session.currentStepIndex + 1;

    if (isLastStep) {
      // Calculate module totals before moving on
      const moduleResult = updatedModuleResults.find(m => m.moduleId === currentModule.id)!;
      const totalScore = moduleResult.stepResults.reduce((sum, s) => {
        if (s.score === 'N/A') return sum;
        return sum + (s.score as number);
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
        newModuleIndex = session.currentModuleIndex + 1;
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

    // Save to session storage
    sessionStorage.setItem('eadl_session', JSON.stringify(updatedSession));

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

  // Abandon current step (timeout)
  const abandonStep = useCallback(() => {
    if (!session) return;
    
    stepErrors.current.push('abandonment');
    completeStep(0);
  }, [session, completeStep]);

  // Set open-ended response for current module
  const setOpenEndedResponse = useCallback((response: string) => {
    if (!session) return;
    
    const currentModule = eadlModules[session.currentModuleIndex];
    
    setSession(prev => {
      if (!prev) return null;
      
      const updatedResults = prev.moduleResults.map(m => 
        m.moduleId === currentModule.id
          ? { ...m, openEndedResponse: response }
          : m
      );
      
      const updated = { ...prev, moduleResults: updatedResults };
      sessionStorage.setItem('eadl_session', JSON.stringify(updated));
      return updated;
    });
  }, [session]);

  // Force difficulty mode (clinician override)
  const setDifficultyMode = useCallback((mode: DifficultyMode) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, difficultyMode: mode };
      sessionStorage.setItem('eadl_session', JSON.stringify(updated));
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
        
        step.errors.forEach(e => errorProfile[e]++);
        
        if (step.score !== 'N/A') {
          compositeScore += step.score as number;
          maxPossibleScore += 2;
        }
      });

      Object.entries(result.errorsByType).forEach(([type, count]) => {
        errorProfile[type as ErrorType] += count;
      });

      moduleScores.push({
        moduleId: result.moduleId,
        moduleName: moduleDef?.name || result.moduleId,
        score: result.subtotalScore,
        maxScore: result.maxPossibleScore,
        percentage: result.maxPossibleScore > 0 
          ? (result.subtotalScore / result.maxPossibleScore) * 100 
          : 0,
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

  // Load session from storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('eadl_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AssessmentSession;
        if (!parsed.endTime) {
          setSession(parsed);
          setIsRunning(true);
          setCurrentStepStartTime(Date.now());
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  }, []);

  return {
    session,
    isRunning,
    startAssessment,
    completeStep,
    abandonStep,
    recordInteraction,
    recordMisclick,
    recordBacktrack,
    setOpenEndedResponse,
    setDifficultyMode,
    getCurrentContext,
    getAnalytics,
    exportCSV,
    exportAOIMap,
  };
};
