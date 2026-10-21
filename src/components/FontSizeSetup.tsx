import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';

export type TextSizeLevel = 'normal' | 'large' | 'x-large';
export const TEXT_SIZE_KEY = 'eadl_text_size';

const LEVELS: { value: TextSizeLevel; label: string }[] = [
  { value: 'normal',  label: 'Normal' },
  { value: 'large',   label: 'Large' },
  { value: 'x-large', label: 'X-Large' },
];

export function applyTextSize(level: TextSizeLevel) {
  document.documentElement.style.fontSize = ''; // clear old approach
  if (level === 'normal') {
    document.documentElement.removeAttribute('data-text-size');
  } else {
    document.documentElement.setAttribute('data-text-size', level);
  }
}

interface FontSizeSetupProps {
  onComplete: () => void;
}

export const FontSizeSetup: React.FC<FontSizeSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1 = normal, 2 = large, 3 = x-large

  useEffect(() => {
    applyTextSize(LEVELS[step - 1].value);
  }, [step]);

  const confirm = () => {
    const level = LEVELS[step - 1].value;
    localStorage.setItem(TEXT_SIZE_KEY, level);
    localStorage.removeItem('eadl_font_size'); // remove old key
    onComplete();
  };

  const skip = () => {
    applyTextSize('normal');
    localStorage.setItem(TEXT_SIZE_KEY, 'normal');
    localStorage.removeItem('eadl_font_size');
    onComplete();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Type className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Set Your Text Size</h1>
          <p className="text-sm text-muted-foreground">
            Move the slider until the sample text below is comfortable to read.
          </p>
        </div>

        {/* Sample text — uses standard Tailwind classes so it reflects the live override */}
        <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sample text
          </p>
          <p className="text-base leading-relaxed text-foreground">
            Open Messages, find Emma (Daughter), and send her a text message letting her
            know your appointment time.
          </p>
        </div>

        {/* A — A — A size markers (fixed px so they don't scale with the override) */}
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="font-semibold text-muted-foreground" style={{ fontSize: '13px' }}>A</span>
          <span className="font-semibold text-muted-foreground" style={{ fontSize: '18px' }}>A</span>
          <span className="font-semibold text-muted-foreground" style={{ fontSize: '24px' }}>A</span>
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={1}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
          aria-label="Text size"
        />

        {/* Tick labels */}
        <div className="mt-1 mb-6 flex justify-between px-1">
          {LEVELS.map((level, i) => (
            <span
              key={level.value}
              className={cn(
                'text-xs font-medium',
                step === i + 1 ? 'text-primary font-semibold' : 'text-muted-foreground',
              )}
            >
              {level.label}
            </span>
          ))}
        </div>

        <Button size="lg" className="mb-3 w-full" onClick={confirm}>
          Looks Good!
        </Button>
        <button
          onClick={skip}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Use default size
        </button>
      </div>
    </div>
  );
};
