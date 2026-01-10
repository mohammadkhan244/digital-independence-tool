import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleDefinition, ModuleResult } from '@/types/assessment';
import { getModuleIcon } from '@/data/modules';
import { CheckCircle2, Circle, Lock, Clock, AlertTriangle } from 'lucide-react';

interface ModuleCardProps {
  module: ModuleDefinition;
  result?: ModuleResult;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  onClick?: () => void;
  simpleMode?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  result,
  status,
  onClick,
  simpleMode = true,
}) => {
  const icon = getModuleIcon(module.icon);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-success" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-primary animate-pulse" />;
      case 'locked':
        return <Lock className="h-6 w-6 text-muted-foreground" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getScorePercentage = () => {
    if (!result || result.maxPossibleScore === 0) return null;
    return Math.round((result.subtotalScore / result.maxPossibleScore) * 100);
  };

  const scorePercentage = getScorePercentage();

  return (
    <button
      onClick={onClick}
      disabled={status === 'locked'}
      className={cn(
        "w-full rounded-xl border bg-card p-5 text-left transition-all touch-target",
        "hover:shadow-md hover:border-primary/50 active:scale-[0.98]",
        status === 'locked' && "opacity-50 cursor-not-allowed hover:shadow-none hover:border-border",
        status === 'in-progress' && "ring-2 ring-primary border-primary",
        status === 'completed' && "border-success/50 bg-success/5"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "flex items-center justify-center rounded-xl text-3xl",
          simpleMode ? "h-16 w-16" : "h-12 w-12",
          status === 'completed' ? "bg-success/10" : "bg-primary/10"
        )}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "font-semibold text-foreground",
              simpleMode ? "text-lg" : "text-base"
            )}>
              {module.name}
            </h3>
            {getStatusIcon()}
          </div>
          
          <p className={cn(
            "text-muted-foreground mt-1 line-clamp-2",
            simpleMode ? "text-sm" : "text-xs"
          )}>
            {module.description}
          </p>

          {/* Progress/Score */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{module.steps.length} steps</span>
                {result && (
                  <span>{result.stepResults.length} completed</span>
                )}
              </div>
              {result && (
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      status === 'completed' ? "bg-success" : "bg-primary"
                    )}
                    style={{ 
                      width: `${(result.stepResults.length / module.steps.length) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Score Badge */}
            {scorePercentage !== null && (
              <div className={cn(
                "score-badge",
                scorePercentage >= 80 && "score-2",
                scorePercentage >= 50 && scorePercentage < 80 && "score-1",
                scorePercentage < 50 && "score-0"
              )}>
                {scorePercentage}%
              </div>
            )}
          </div>

          {/* Error Summary */}
          {result && Object.values(result.errorsByType).some(v => v > 0) && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              {Object.values(result.errorsByType).reduce((a, b) => a + b, 0)} errors
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
