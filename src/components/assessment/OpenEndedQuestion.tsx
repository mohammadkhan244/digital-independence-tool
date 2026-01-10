import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface OpenEndedQuestionProps {
  question: string;
  onSubmit: (response: string) => void;
  onSkip?: () => void;
  simpleMode?: boolean;
}

export const OpenEndedQuestion: React.FC<OpenEndedQuestionProps> = ({
  question,
  onSubmit,
  onSkip,
  simpleMode = true,
}) => {
  const [response, setResponse] = useState('');

  const handleSubmit = () => {
    onSubmit(response);
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Your Feedback</h3>
          <p className="text-sm text-muted-foreground">Optional but helpful for understanding your experience</p>
        </div>
      </div>

      <p className="text-foreground mb-4 font-medium">{question}</p>

      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Share your thoughts..."
        rows={simpleMode ? 4 : 3}
        className="mb-4"
      />

      <div className="flex gap-3">
        <Button onClick={handleSubmit} className="flex-1">
          {response.trim() ? 'Submit Response' : 'Continue'}
        </Button>
        {onSkip && (
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
};
