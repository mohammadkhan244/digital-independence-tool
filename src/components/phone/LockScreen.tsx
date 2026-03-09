import React, { useState, useCallback } from 'react';
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

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((clientY: number, startY: number) => {
    const delta = startY - clientY;
    setDragY(Math.max(0, Math.min(delta, 200)));
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (dragY > 100) {
      onUnlock();
    }
    setDragY(0);
  }, [dragY, onUnlock]);

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart();
    const startY = e.touches[0].clientY;
    
    const handleTouchMove = (e: TouchEvent) => {
      handleDrag(e.touches[0].clientY, startY);
    };
    
    const handleTouchEnd = () => {
      handleDragEnd();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart();
    const startY = e.clientY;
    
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientY, startY);
    };
    
    const handleMouseUp = () => {
      handleDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleWrongTap = () => {
    onMisclick?.();
  };

  return (
    <div 
      className="flex h-full flex-col bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-800 text-white"
      style={{
        transform: `translateY(-${dragY}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
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

      {/* Unlock Area */}
      <div className="pb-16 pt-8">
        <div 
          className="mx-auto flex flex-col items-center cursor-pointer touch-target"
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
          onClick={() => {
            // Allow simple click/tap to unlock as a fallback
            if (!isDragging) {
              onUnlock();
            }
          }}
        >
          <div className={cn(
            "flex items-center justify-center rounded-full transition-all",
            simpleMode 
              ? "h-16 w-48 bg-white/30 backdrop-blur-md mb-2 animate-pulse-ring"
              : "h-8 w-8 mb-4"
          )}>
            <ChevronUp className={cn(
              "animate-bounce",
              simpleMode ? "h-8 w-8" : "h-5 w-5"
            )} />
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
  );
};
