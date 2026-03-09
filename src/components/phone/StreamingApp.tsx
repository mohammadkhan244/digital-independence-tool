import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Search, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, X } from 'lucide-react';

type StreamingView = 'home' | 'search-results' | 'player' | 'controls';

interface StreamingAppProps {
  onBack: () => void;
  onAction: (action: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  screen?: StreamingView;
}

const categories = [
  { name: 'Nature', emoji: '🌿' },
  { name: 'Movies', emoji: '🎬' },
  { name: 'Comedy', emoji: '😂' },
  { name: 'Drama', emoji: '🎭' },
  { name: 'Music', emoji: '🎵' },
  { name: 'News', emoji: '📰' },
];

export const StreamingApp: React.FC<StreamingAppProps> = ({
  onBack,
  onAction,
  onMisclick,
  simpleMode = true,
  showHint = false,
  screen,
}) => {
  const [internalView, setInternalView] = useState<StreamingView>('home');
  const view = screen ?? internalView;
  const setView = (v: StreamingView) => setInternalView(v);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);

  // Player with controls
  if (view === 'player' || view === 'controls') {
    return (
      <div className="flex h-full flex-col bg-black">
        {/* Video area */}
        <div className="relative flex-1 flex items-center justify-center bg-gradient-to-b from-green-900 to-emerald-950">
          {/* Simulated video content */}
          <div className="text-center">
            <p className="text-6xl mb-4">🦁</p>
            <p className="text-white/50 text-sm">Nature Documentary</p>
            <p className="text-white/30 text-xs">Planet Earth: Savannas</p>
          </div>

          {/* Exit button */}
          <button
            onClick={() => {
              onAction('exit');
              onBack();
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Center play/pause overlay */}
          <button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
                onAction('control_playback');
              } else {
                setIsPlaying(true);
                onAction('play_content');
              }
            }}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              showHint && !isPlaying && "bg-black/20"
            )}
          >
            {!isPlaying && (
              <div className={cn(
                "w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center",
                showHint && "ring-4 ring-white/50 animate-pulse"
              )}>
                <Play className="h-10 w-10 text-white ml-1" />
              </div>
            )}
          </button>
        </div>

        {/* Controls bar */}
        <div className="bg-gray-900 px-4 py-3 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">12:34</span>
            <div className="flex-1 h-1 bg-white/20 rounded-full">
              <div className="w-1/4 h-full bg-purple-500 rounded-full" />
            </div>
            <span className="text-xs text-white/60">48:20</span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <button onClick={() => onMisclick?.()} className="p-2">
              <SkipBack className="h-5 w-5 text-white/70" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                onAction('control_playback');
              }}
              className={cn(
                "w-14 h-14 rounded-full bg-white flex items-center justify-center",
                showHint && isPlaying && "ring-4 ring-purple-400 animate-pulse"
              )}
            >
              {isPlaying 
                ? <Pause className="h-7 w-7 text-gray-900" />
                : <Play className="h-7 w-7 text-gray-900 ml-0.5" />
              }
            </button>

            <button onClick={() => onMisclick?.()} className="p-2">
              <SkipForward className="h-5 w-5 text-white/70" />
            </button>

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                onAction('control_playback');
              }}
              className={cn(
                "p-2",
                showHint && "ring-2 ring-purple-400 rounded-lg animate-pulse"
              )}
            >
              {isMuted
                ? <VolumeX className="h-5 w-5 text-red-400" />
                : <Volume2 className="h-5 w-5 text-white/70" />
              }
            </button>

            <button onClick={() => onMisclick?.()} className="p-2">
              <Maximize className="h-5 w-5 text-white/70" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Search results
  if (view === 'search-results') {
    const results = [
      { title: 'Planet Earth: Savannas', year: '2024', match: true },
      { title: 'Ocean Wonders', year: '2023', match: false },
      { title: 'Forest Secrets', year: '2025', match: false },
    ];

    return (
      <div className="flex h-full flex-col bg-gray-950">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => setView('home')}><ChevronLeft className="h-5 w-5 text-white" /></button>
          <div className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/60">
            "Nature Documentary"
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.map((r, i) => (
            <button
              key={r.title}
              onClick={() => {
                if (r.match) {
                  setView('player');
                  // Don't auto-score - scoring on play
                } else {
                  onMisclick?.();
                }
              }}
              className={cn(
                "w-full flex gap-3 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10",
                r.match && showHint && "ring-2 ring-purple-400 animate-pulse"
              )}
            >
              <div className={cn(
                "w-24 h-20 flex items-center justify-center text-3xl",
                "bg-gradient-to-br",
                r.match ? "from-green-800 to-emerald-900" : "from-blue-800 to-indigo-900"
              )}>
                {r.match ? '🦁' : i === 1 ? '🐋' : '🌲'}
              </div>
              <div className="flex-1 py-3 text-left">
                <p className="font-medium text-white text-sm">{r.title}</p>
                <p className="text-xs text-white/50 mt-1">{r.year} • Documentary</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Home
  return (
    <div className="flex h-full flex-col bg-gray-950">
      <div className="flex items-center justify-between p-4">
        <button onClick={onBack}><ChevronLeft className="h-5 w-5 text-white" /></button>
        <span className="font-bold text-lg text-white">StreamTV</span>
        <div className="w-5" />
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <button
          onClick={() => {
            setView('search-results');
            onAction('search');
          }}
          className={cn(
            "w-full flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3",
            showHint && "ring-2 ring-purple-400 animate-pulse"
          )}
        >
          <Search className="h-5 w-5 text-white/50" />
          <span className="text-white/50 text-sm">Search "Nature Documentary"</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <h3 className="font-medium text-white/80 text-sm">Browse</h3>
        <div className={cn("grid gap-3", simpleMode ? "grid-cols-2" : "grid-cols-3")}>
          {(simpleMode ? categories.slice(0, 4) : categories).map(cat => (
            <button
              key={cat.name}
              onClick={() => onMisclick?.()}
              className={cn(
                "rounded-xl bg-white/5 flex flex-col items-center justify-center hover:bg-white/10",
                simpleMode ? "p-5 gap-2" : "p-3 gap-1"
              )}
            >
              <span className={simpleMode ? "text-3xl" : "text-2xl"}>{cat.emoji}</span>
              <span className={cn("text-white/70", simpleMode ? "text-sm" : "text-xs")}>{cat.name}</span>
            </button>
          ))}
        </div>

        <h3 className="font-medium text-white/80 text-sm mt-4">Trending</h3>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {['🏔️', '🌊', '🌌'].map((e, i) => (
            <button key={i} onClick={() => onMisclick?.()} className="w-28 h-20 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-3xl">
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
