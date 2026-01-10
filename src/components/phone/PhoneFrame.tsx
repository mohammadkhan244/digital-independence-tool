import React from 'react';
import { cn } from '@/lib/utils';

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  showNotch?: boolean;
  time?: string;
  batteryLevel?: number;
  signalStrength?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  className,
  showNotch = true,
  time,
  batteryLevel = 85,
  signalStrength = 4,
}) => {
  const currentTime = time || new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className={cn("phone-frame", className)}>
      <div className="phone-screen">
        {/* Status Bar */}
        <div className="relative z-50 flex h-12 items-center justify-between bg-phone-status-bar px-6 text-white">
          <span className="text-sm font-medium">{currentTime}</span>
          
          {showNotch && <div className="phone-notch" />}
          
          <div className="flex items-center gap-1.5">
            {/* Signal Bars */}
            <div className="flex items-end gap-0.5">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    "w-1 rounded-sm transition-colors",
                    bar <= signalStrength ? "bg-white" : "bg-white/30"
                  )}
                  style={{ height: `${bar * 3 + 2}px` }}
                />
              ))}
            </div>
            
            {/* Battery */}
            <div className="ml-1 flex items-center gap-0.5">
              <div className="relative h-3 w-6 rounded-sm border border-white/60">
                <div 
                  className={cn(
                    "absolute inset-0.5 rounded-[1px] transition-all",
                    batteryLevel > 20 ? "bg-green-400" : "bg-red-400"
                  )}
                  style={{ width: `${Math.min(batteryLevel, 100) * 0.8}%` }}
                />
              </div>
              <div className="h-1.5 w-0.5 rounded-r-sm bg-white/60" />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="relative flex-1 overflow-hidden">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="phone-home-indicator" />
      </div>
    </div>
  );
};
