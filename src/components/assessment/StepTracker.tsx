import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle, Clock } from 'lucide-react';
import { TaskStep, StepResult } from '@/types/assessment';

interface StepTrackerProps {
  steps: TaskStep[];
  currentStepIndex: number;
  stepResults: StepResult[];
  simpleMode?: boolean;
}

export const StepTracker: React.FC<StepTrackerProps> = ({
  steps,
  currentStepIndex,
  stepResults,
  simpleMode = true,
}) => {
  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) {
      const result = stepResults[index];
      return result?.abandoned ? 'abandoned' : 'complete';
    }
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  const getStepScore = (index: number) => {
    const result = stepResults[index];
    if (!result) return null;
    return result.score;
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round((currentStepIndex / steps.length) * 100)}% complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step List */}
      <div className={cn("space-y-2", !simpleMode && "max-h-48 overflow-y-auto")}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const score = getStepScore(index);

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3 transition-all",
                status === 'active' && "bg-primary/10 ring-1 ring-primary",
                status === 'complete' && "bg-muted/50",
                status === 'abandoned' && "bg-destructive/10",
                status === 'pending' && "opacity-50"
              )}
            >
              {/* Step Indicator */}
              <div className={cn(
                "step-indicator shrink-0",
                status === 'active' && "step-active",
                status === 'complete' && "step-complete",
                status === 'abandoned' && "bg-destructive text-destructive-foreground",
                status === 'pending' && "step-pending"
              )}>
                {status === 'complete' && <Check className="h-4 w-4" />}
                {status === 'abandoned' && <Clock className="h-4 w-4" />}
                {(status === 'active' || status === 'pending') && (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm leading-snug",
                  status === 'active' && "font-medium text-foreground",
                  status === 'complete' && "text-muted-foreground",
                  status === 'pending' && "text-muted-foreground"
                )}>
                  {step.instruction}
                </p>

                {/* Score Badge */}
                {score !== null && (
                  <div className="mt-1">
                    <span className={cn(
                      "score-badge text-xs",
                      score === 2 && "score-2",
                      score === 1 && "score-1",
                      score === 0 && "score-0",
                      score === 'N/A' && "score-na"
                    )}>
                      {score === 2 && 'Independent'}
                      {score === 1 && 'With Help'}
                      {score === 0 && 'Unable'}
                      {score === 'N/A' && 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
