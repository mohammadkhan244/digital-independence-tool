import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff } from 'lucide-react';

interface TelehealthCallProps {
  onAction?: (action: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
}

export const TelehealthCall: React.FC<TelehealthCallProps> = ({
  onAction,
  onMisclick,
  simpleMode = true,
  showHint = false,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [elapsed, setElapsed] = useState(201); // start at 3:21

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleMute = () => {
    setIsMuted(prev => !prev);
    onAction?.('toggle_mute');
  };

  return (
    <div className="relative flex h-full flex-col bg-gray-900">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-black/60 px-4 py-3 z-10">
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Telehealth Visit</p>
          <p className="text-gray-300 text-xs">Dr. Sarah Patel</p>
        </div>
        <div className="rounded-full bg-gray-700/80 px-3 py-1">
          <span className="text-green-400 font-mono text-sm tabular-nums">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Main video: doctor avatar */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />

        <div className="relative text-center z-10">
          <div className="h-28 w-28 mx-auto rounded-full border-4 border-blue-500/60 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center mb-3 shadow-2xl">
            <span className="text-3xl font-bold text-white tracking-wide">DP</span>
          </div>
          <p className="text-white font-semibold text-base">Dr. Sarah Patel</p>
          <p className="text-gray-400 text-xs mt-0.5">Neurology · OSUMC</p>
        </div>

        {/* Self-view: bottom right */}
        <div className="absolute bottom-3 right-3 h-24 w-18 rounded-xl border-2 border-gray-500/70 overflow-hidden shadow-lg" style={{ width: 72 }}>
          <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800 flex items-center justify-center">
            {isCameraOn ? (
              <span className="text-xs text-gray-300 font-medium">You</span>
            ) : (
              <VideoOff className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className={cn(
        'flex justify-center gap-4 bg-gray-800/95 px-4 py-4',
        showHint && !isMuted && 'ring-2 ring-primary ring-inset',
      )}>
        {/* Mute */}
        <button
          onClick={handleMute}
          className={cn(
            'flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-full transition-colors',
            isMuted ? 'bg-red-600' : 'bg-gray-600',
            showHint && !isMuted && 'ring-4 ring-primary ring-offset-2 ring-offset-gray-800',
          )}
        >
          {isMuted ? (
            <MicOff className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Camera */}
        <button
          onClick={() => { setIsCameraOn(prev => !prev); onMisclick?.(); }}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            isCameraOn ? 'bg-gray-600' : 'bg-red-600',
          )}
        >
          {isCameraOn ? (
            <Video className="h-6 w-6 text-white" />
          ) : (
            <VideoOff className="h-6 w-6 text-white" />
          )}
        </button>

        {/* End call */}
        <button
          onClick={onMisclick}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg"
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </button>

        {/* Chat */}
        <button
          onClick={onMisclick}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-600"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      </div>

      {simpleMode && !isMuted && (
        <div className="bg-primary px-3 py-2 text-center">
          <p className="text-xs text-primary-foreground font-medium">
            Tap the microphone button to mute yourself
          </p>
        </div>
      )}

      {isMuted && (
        <div className="bg-red-700 px-3 py-2 text-center">
          <p className="text-xs text-white font-medium">Microphone muted</p>
        </div>
      )}
    </div>
  );
};
