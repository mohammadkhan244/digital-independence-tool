import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, Camera, Flashlight } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  onMisclick,
  simpleMode = true,
}) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragYRef = useRef(0);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });

  const containerHeight = containerRef.current?.parentElement?.clientHeight || 500;
  const unlockThreshold = simpleMode ? 60 : 100;

  const triggerUnlock = useCallback(() => {
    setUnlocking(true);
    setDragY(containerHeight);
    setTimeout(() => {
      onUnlock();
    }, 400);
  }, [containerHeight, onUnlock]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (unlocking) return;
    setIsDragging(true);
    const startY = e.touches[0].clientY;

    const handleTouchMove = (e: TouchEvent) => {
      const delta = startY - e.touches[0].clientY;
      const clamped = Math.max(0, delta);
      dragYRef.current = clamped;
      setDragY(clamped);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      if (dragYRef.current > unlockThreshold) {
        triggerUnlock();
      } else {
        setDragY(0);
      }
      dragYRef.current = 0;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (unlocking) return;
    setIsDragging(true);
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      const clamped = Math.max(0, delta);
      dragYRef.current = clamped;
      setDragY(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (dragYRef.current > unlockThreshold) {
        triggerUnlock();
      } else {
        setDragY(0);
      }
      dragYRef.current = 0;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleWrongTap = () => {
    onMisclick?.();
  };

  // Progress ratio for visual feedback (0 to 1)
  const progress = Math.min(dragY / unlockThreshold, 1);
  const opacity = unlocking ? 0 : 1 - progress * 0.6;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-800 text-white select-none"
    >
      {/* Sliding layer */}
      <div
        className="flex h-full flex-col"
        style={{
          transform: `translateY(-${dragY}px)`,
          opacity,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.4s ease-out',
        }}
      >
        {/* Time and Date */}
        <div className="flex flex-1 flex-col items-center justify-center pt-8">
          <div className="text-6xl font-extralight tracking-tight">
            {currentTime}
          </div>
          <div className="mt-2 text-lg font-light opacity-80">
            {currentDate}
          </div>
        </div>

        {/* Notifications Area (distractor in complex mode) */}
        {!simpleMode && (
          <div className="px-4 space-y-2 mb-8">
            <div
              className="rounded-2xl bg-white/20 backdrop-blur-md p-4"
              onClick={handleWrongTap}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-lg">
                  📧
                </div>
                <div>
                  <div className="font-medium text-sm">Mail</div>
                  <div className="text-xs opacity-80">You have 3 new messages</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unlock Area — drag handle */}
        <div className="pb-16 pt-8">
          <div
            className="mx-auto flex flex-col items-center cursor-grab active:cursor-grabbing touch-target"
            onTouchStart={handleTouchStart}
            onMouseDown={handleMouseDown}
          >
            {/* Progress indicator ring */}
            <div className="relative">
              <div className={cn(
                "flex items-center justify-center rounded-full transition-all",
                simpleMode
                  ? "h-16 w-48 bg-white/30 backdrop-blur-md mb-2"
                  : "h-8 w-8 mb-4"
              )}
              style={{
                boxShadow: progress > 0 ? `0 0 ${20 * progress}px ${8 * progress}px rgba(255,255,255,${0.3 * progress})` : 'none',
              }}
              >
                <ChevronUp className={cn(
                  simpleMode ? "h-8 w-8" : "h-5 w-5",
                  !unlocking && "animate-bounce"
                )} />
              </div>
            </div>
            <span className={cn(
              "font-medium",
              simpleMode ? "text-base" : "text-sm opacity-80"
            )}>
              {simpleMode ? "Swipe up to unlock" : "Swipe up"}
            </span>
          </div>

          {/* Bottom Quick Actions (distractors) */}
          {!simpleMode && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8">
              <button
                onClick={handleWrongTap}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
              >
                <Flashlight className="h-5 w-5" />
              </button>
              <button
                onClick={handleWrongTap}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
