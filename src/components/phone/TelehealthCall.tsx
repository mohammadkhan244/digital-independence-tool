import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff } from 'lucide-react';

interface TelehealthCallProps {
  onAction?: (action: string) => void;
  onMisclick?: () => void;
  onWrongAction?: (action: string) => void;
  onGoBackFromWrong?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  variant?: 'reassessment';
}

export const TelehealthCall: React.FC<TelehealthCallProps> = ({
  onAction,
  onMisclick,
  onWrongAction,
  onGoBackFromWrong,
  simpleMode = true,
  showHint = false,
  variant,
}) => {
  const isReassessment = variant === 'reassessment';
  const doctorName = isReassessment ? 'Dr. James Okafor' : 'Dr. Sarah Patel';
  const doctorInitials = isReassessment ? 'JO' : 'DP';
  const doctorSubtitle = isReassessment ? 'PM&R · OSUMC' : 'Neurology · OSUMC';

  const [isMuted, setIsMuted] = useState(false);
  // Reassessment: camera starts OFF (task = turn it ON)
  const [isCameraOn, setIsCameraOn] = useState(!isReassessment);
  const [elapsed, setElapsed] = useState(201); // start at 3:21
  const [showChat, setShowChat] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

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
    if (!isReassessment) onAction?.('toggle_mute');
    else onMisclick?.();
  };

  const handleCamera = () => {
    const wasOn = isCameraOn;
    setIsCameraOn(prev => !prev);
    if (isReassessment && !wasOn) {
      onAction?.('toggle_camera');
    } else {
      onMisclick?.();
    }
  };

  return (
    <div className="relative flex h-full flex-col bg-gray-900">
      {/* Chat panel overlay */}
      {showChat && (
        <div className="absolute inset-0 z-20 flex flex-col bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
            <button
              onClick={() => { setShowChat(false); onGoBackFromWrong?.(); }}
              className="text-blue-400 font-medium text-sm"
            >
              ← Close
            </button>
            <span className="text-white font-medium text-sm">Chat</span>
            <div className="w-12" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
          <div className="border-t border-gray-700 px-4 py-3">
            <div className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2.5">
              <span className="flex-1 text-sm text-gray-500">Type a message…</span>
            </div>
          </div>
        </div>
      )}

      {/* End call confirmation overlay */}
      {showEndCallConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="mx-4 rounded-2xl bg-gray-800 p-6 w-full max-w-xs">
            <p className="text-white font-semibold text-center mb-1">Leave this call?</p>
            <p className="text-gray-400 text-xs text-center mb-5">Your telehealth visit is still in progress.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndCallConfirm(false)}
                className="flex-1 rounded-xl bg-gray-600 py-3 text-white font-medium text-sm"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setCallEnded(true);
                  setShowEndCallConfirm(false);
                  onWrongAction?.('end-call');
                }}
                className="flex-1 rounded-xl bg-red-600 py-3 text-white font-medium text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call ended screen */}
      {callEnded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
          <p className="text-white text-lg font-semibold mb-1">Call Ended</p>
          <p className="text-gray-500 text-sm mb-6">Your session has ended</p>
          <button
            onClick={() => { setCallEnded(false); onGoBackFromWrong?.(); }}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-white font-medium text-sm"
          >
            Rejoin Call
          </button>
        </div>
      )}
      {/* Top bar */}
      <div className="flex items-center justify-between bg-black/60 px-4 py-3 z-10">
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Telehealth Visit</p>
          <p className="text-gray-300 text-xs">{doctorName}</p>
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
            <span className="text-3xl font-bold text-white tracking-wide">{doctorInitials}</span>
          </div>
          <p className="text-white font-semibold text-base">{doctorName}</p>
          <p className="text-gray-400 text-xs mt-0.5">{doctorSubtitle}</p>
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
          onClick={handleCamera}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            isCameraOn ? 'bg-gray-600' : 'bg-red-600',
            isReassessment && showHint && !isCameraOn && 'ring-4 ring-primary ring-offset-2 ring-offset-gray-800',
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
          onClick={() => {
            setShowEndCallConfirm(true);
            onWrongAction?.('end-call-attempt');
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg"
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </button>

        {/* Chat */}
        <button
          onClick={() => {
            setShowChat(true);
            onWrongAction?.('chat');
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-600"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      </div>

      {simpleMode && !isReassessment && !isMuted && (
        <div className="bg-primary px-3 py-2 text-center">
          <p className="text-xs text-primary-foreground font-medium">
            Tap the microphone button to mute yourself
          </p>
        </div>
      )}

      {simpleMode && isReassessment && !isCameraOn && (
        <div className="bg-primary px-3 py-2 text-center">
          <p className="text-xs text-primary-foreground font-medium">
            Tap the camera button to turn on your video
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
