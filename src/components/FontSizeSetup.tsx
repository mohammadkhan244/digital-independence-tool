import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';

const FONT_KEY = 'eadl_font_size';

interface FontSizeSetupProps {
  onComplete: () => void;
}

export const FontSizeSetup: React.FC<FontSizeSetupProps> = ({ onComplete }) => {
  const [pct, setPct] = useState(100);

  useEffect(() => {
    document.documentElement.style.fontSize = `${pct}%`;
  }, [pct]);

  const confirm = () => {
    localStorage.setItem(FONT_KEY, `${pct}%`);
    onComplete();
  };

  const skip = () => {
    document.documentElement.style.fontSize = '100%';
    localStorage.setItem(FONT_KEY, '100%');
    onComplete();
  };

  const label =
    pct === 100 ? 'Default size' : pct < 100 ? `${100 - pct}% smaller` : `${pct - 100}% larger`;

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

        <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sample text
          </p>
          <p className="leading-relaxed text-foreground">
            Open Messages, find Emma (Daughter), and send her a text message letting her know
            your appointment time.
          </p>
        </div>

        <div className="mb-1 flex items-center justify-between px-1">
          <span className="font-semibold text-muted-foreground" style={{ fontSize: '13px' }}>A</span>
          <span className="font-semibold text-muted-foreground" style={{ fontSize: '22px' }}>A</span>
        </div>
        <input
          type="range"
          min={80}
          max={175}
          step={5}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
          aria-label="Text size"
        />
        <p className="mb-6 mt-2 text-center text-xs text-muted-foreground">{label}</p>

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
