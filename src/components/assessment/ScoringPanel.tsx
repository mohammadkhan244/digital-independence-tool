import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Score } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, HelpCircle, XCircle, MinusCircle, AlertTriangle, Edit2 } from 'lucide-react';

interface ScoringPanelProps {
  stepInstruction: string;
  automatedScore: Score | null;
  onScoreSubmit: (score: Score, notes?: string) => void;
  onSkip?: () => void;
  allowOverride?: boolean;
  hints?: string[];
  simpleMode?: boolean;
}

export const ScoringPanel: React.FC<ScoringPanelProps> = ({
  stepInstruction,
  automatedScore,
  onScoreSubmit,
  onSkip,
  allowOverride = true,
  hints = [],
  simpleMode = true,
}) => {
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [notes, setNotes] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  const scoreOptions: { value: Score; label: string; description: string; icon: React.ElementType; className: string }[] = [
    { 
      value: 2, 
      label: 'Independent', 
      description: 'Completed without any assistance',
      icon: CheckCircle2,
      className: 'border-success text-success hover:bg-success/10 data-[selected=true]:bg-success data-[selected=true]:text-success-foreground'
    },
    { 
      value: 1, 
      label: 'With Help', 
      description: 'Needed verbal or physical assistance',
      icon: HelpCircle,
      className: 'border-warning text-warning hover:bg-warning/10 data-[selected=true]:bg-warning data-[selected=true]:text-warning-foreground'
    },
    { 
      value: 0, 
      label: 'Unable', 
      description: 'Could not complete even with help',
      icon: XCircle,
      className: 'border-destructive text-destructive hover:bg-destructive/10 data-[selected=true]:bg-destructive data-[selected=true]:text-destructive-foreground'
    },
    { 
      value: 'N/A', 
      label: 'Not Applicable', 
      description: 'Does not use or need this function',
      icon: MinusCircle,
      className: 'border-muted-foreground text-muted-foreground hover:bg-muted data-[selected=true]:bg-muted data-[selected=true]:text-foreground'
    },
  ];

  const handleSubmit = () => {
    if (selectedScore !== null) {
      onScoreSubmit(selectedScore, notes || undefined);
      setSelectedScore(null);
      setNotes('');
      setShowOverride(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      {/* Current Step */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Current Task</h3>
        <p className="text-muted-foreground">{stepInstruction}</p>
        
        {simpleMode && hints.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 p-3">
            <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-medium text-primary">Hint:</span>
              <p className="text-sm text-muted-foreground">{hints[0]}</p>
            </div>
          </div>
        )}
      </div>

      {/* Automated Score Display */}
      {automatedScore !== null && (
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Automated Score:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "score-badge",
                  automatedScore === 2 && "score-2",
                  automatedScore === 1 && "score-1",
                  automatedScore === 0 && "score-0",
                  automatedScore === 'N/A' && "score-na"
                )}>
                  {automatedScore === 2 && 'Independent'}
                  {automatedScore === 1 && 'With Help'}
                  {automatedScore === 0 && 'Unable'}
                  {automatedScore === 'N/A' && 'N/A'}
                </span>
              </div>
            </div>
            
            {allowOverride && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowOverride(!showOverride)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Override
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Manual Scoring (or Override) */}
      {(automatedScore === null || showOverride) && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">
            {showOverride ? 'Override Score' : 'Score this step'}
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {scoreOptions.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => setSelectedScore(option.value)}
                data-selected={selectedScore === option.value}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all touch-target",
                  option.className
                )}
              >
                <option.icon className="h-8 w-8" />
                <span className="font-semibold">{option.label}</span>
                {!simpleMode && (
                  <span className="text-xs opacity-80 text-center">
                    {option.description}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notes */}
          {!simpleMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Clinical Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any observations or notes about this step..."
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={selectedScore === null}
              className="flex-1"
              size="lg"
            >
              {showOverride ? 'Save Override' : 'Submit Score'}
            </Button>
            
            {onSkip && (
              <Button variant="outline" onClick={onSkip} size="lg">
                Skip
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quick Accept for Automated Score */}
      {automatedScore !== null && !showOverride && (
        <div className="flex gap-3">
          <Button 
            onClick={() => onScoreSubmit(automatedScore)} 
            className="flex-1"
            size="lg"
          >
            Accept & Continue
          </Button>
        </div>
      )}
    </div>
  );
};
