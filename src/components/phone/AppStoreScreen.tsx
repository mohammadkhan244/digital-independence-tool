import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Search, Download, Check, Video, MessageSquare, Phone, Music } from 'lucide-react';

interface AppStoreScreenProps {
  onBack: () => void;
  onDownloadApp: (appId: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  targetApp?: string;
}

interface StoreApp {
  id: string;
  name: string;
  developer: string;
  icon: React.ElementType;
  bgColor: string;
  rating: number;
  downloads: string;
}

const storeApps: StoreApp[] = [
  { id: 'zoom', name: 'Zoom', developer: 'Zoom Video Communications', icon: Video, bgColor: 'bg-blue-600', rating: 4.8, downloads: '500M+' },
  { id: 'telegram', name: 'Telegram', developer: 'Telegram LLC', icon: MessageSquare, bgColor: 'bg-sky-500', rating: 4.5, downloads: '1B+' },
  { id: 'signal', name: 'Signal', developer: 'Signal Foundation', icon: Phone, bgColor: 'bg-blue-500', rating: 4.6, downloads: '100M+' },
  { id: 'spotify', name: 'Spotify', developer: 'Spotify AB', icon: Music, bgColor: 'bg-green-600', rating: 4.4, downloads: '1B+' },
];

export const AppStoreScreen: React.FC<AppStoreScreenProps> = ({
  onBack,
  onDownloadApp,
  onMisclick,
  simpleMode = true,
  showHint = false,
  targetApp = 'zoom',
}) => {
  const [downloadedApps, setDownloadedApps] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (appId: string) => {
    if (appId === targetApp) {
      setDownloading(appId);
      setTimeout(() => {
        setDownloading(null);
        setDownloadedApps(prev => [...prev, appId]);
        onDownloadApp(appId);
      }, 1000);
    } else {
      onMisclick?.();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-gray-50 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center text-blue-500 font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center pr-12">
          App Store
        </h1>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for apps"
            className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none"
            defaultValue={simpleMode ? "Zoom" : ""}
          />
        </div>
      </div>

      {/* Hint for simple mode */}
      {simpleMode && showHint && (
        <div className="mx-4 mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          Tap the <strong>Get</strong> button next to Zoom to download it
        </div>
      )}

      {/* App List */}
      <div className="flex-1 overflow-auto px-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Communication Apps
        </h2>
        
        <div className="space-y-4">
          {storeApps.map((app) => {
            const isTarget = app.id === targetApp;
            const isDownloaded = downloadedApps.includes(app.id);
            const isDownloading = downloading === app.id;
            
            return (
              <div
                key={app.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl p-3 transition-colors",
                  isTarget && showHint && !isDownloaded && "bg-blue-50 ring-2 ring-blue-300"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center rounded-2xl",
                  app.bgColor,
                  simpleMode ? "h-16 w-16" : "h-14 w-14"
                )}>
                  <app.icon className={cn(
                    "text-white",
                    simpleMode ? "h-8 w-8" : "h-7 w-7"
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-semibold text-gray-900 truncate",
                    simpleMode ? "text-base" : "text-sm"
                  )}>
                    {app.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {app.developer}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">⭐ {app.rating}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{app.downloads}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownload(app.id)}
                  disabled={isDownloaded || isDownloading}
                  className={cn(
                    "flex items-center justify-center rounded-full font-semibold transition-all",
                    simpleMode ? "px-6 py-2 text-sm" : "px-4 py-1.5 text-xs",
                    isDownloaded 
                      ? "bg-gray-100 text-gray-400"
                      : isDownloading
                        ? "bg-gray-200 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95",
                    isTarget && showHint && !isDownloaded && !isDownloading && "animate-pulse"
                  )}
                >
                  {isDownloaded ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Open
                    </>
                  ) : isDownloading ? (
                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Get
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
