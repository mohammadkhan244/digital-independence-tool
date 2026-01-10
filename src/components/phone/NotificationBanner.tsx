import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface NotificationBannerProps {
  appName: string;
  appIcon: string;
  title: string;
  message: string;
  time?: string;
  onTap?: () => void;
  onDismiss?: () => void;
  isVisible?: boolean;
  simpleMode?: boolean;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  appName,
  appIcon,
  title,
  message,
  time = 'now',
  onTap,
  onDismiss,
  isVisible = true,
  simpleMode = true,
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "absolute left-2 right-2 top-14 z-50 animate-slide-up",
        simpleMode && "animate-notification-bounce"
      )}
    >
      <div 
        className={cn(
          "flex items-start gap-3 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-md",
          "cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]",
          simpleMode && "ring-2 ring-primary"
        )}
        onClick={onTap}
      >
        <div className="text-2xl">{appIcon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {appName}
            </span>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
          <div className={cn("font-semibold text-gray-900 mt-0.5", simpleMode ? "text-base" : "text-sm")}>
            {title}
          </div>
          <p className={cn("text-gray-600 line-clamp-2", simpleMode ? "text-sm" : "text-xs")}>
            {message}
          </p>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss?.(); }}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {simpleMode && (
        <div className="mt-2 text-center">
          <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground shadow-lg">
            Tap to view message
          </span>
        </div>
      )}
    </div>
  );
};
