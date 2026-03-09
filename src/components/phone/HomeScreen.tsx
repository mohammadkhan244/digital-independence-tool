import React from 'react';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Camera, 
  Music, 
  Settings, 
  Calendar, 
  Clock,
  Cloud,
  Map,
  ShoppingBag,
  Wallet,
  Heart,
  Play,
  Shield,
  Store,
  Video,
  BookOpen,
  Gamepad2,
  Newspaper,
  Podcast,
  Users,
  Calculator,
  Compass,
} from 'lucide-react';

interface AppIconData {
  id: string;
  name: string;
  icon: React.ElementType;
  bgColor: string;
  isTarget?: boolean;
}

// Base simple mode apps (filler)
const baseSimpleApps: AppIconData[] = [
  { id: 'phone', name: 'Phone', icon: Phone, bgColor: 'bg-green-600' },
  { id: 'mail', name: 'Mail', icon: Mail, bgColor: 'bg-blue-500' },
  { id: 'settings', name: 'Settings', icon: Settings, bgColor: 'bg-gray-500' },
];

// Complex mode shows all apps (no Zoom - it's in App Store)
const allApps: AppIconData[] = [
  { id: 'messages', name: 'Messages', icon: MessageSquare, bgColor: 'bg-green-500', isTarget: true },
  { id: 'phone', name: 'Phone', icon: Phone, bgColor: 'bg-green-600' },
  { id: 'mail', name: 'Mail', icon: Mail, bgColor: 'bg-blue-500' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, bgColor: 'bg-emerald-500' },
  { id: 'myhealth', name: 'MyHealth', icon: Heart, bgColor: 'bg-red-500', isTarget: true },
  { id: 'safebank', name: 'SafeBank', icon: Wallet, bgColor: 'bg-indigo-600', isTarget: true },
  { id: 'quickshop', name: 'QuickShop', icon: ShoppingBag, bgColor: 'bg-orange-500' },
  { id: 'maps', name: 'Maps', icon: Map, bgColor: 'bg-emerald-600' },
  { id: 'streamtv', name: 'StreamTV', icon: Play, bgColor: 'bg-purple-600' },
  { id: 'reminders', name: 'Reminders', icon: Clock, bgColor: 'bg-amber-500' },
  { id: 'homesafe', name: 'HomeSafe', icon: Shield, bgColor: 'bg-teal-600' },
  { id: 'appstore', name: 'App Store', icon: Store, bgColor: 'bg-blue-500', isTarget: true },
  { id: 'camera', name: 'Camera', icon: Camera, bgColor: 'bg-gray-700' },
  { id: 'music', name: 'Music', icon: Music, bgColor: 'bg-pink-500' },
  { id: 'settings', name: 'Settings', icon: Settings, bgColor: 'bg-gray-500' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, bgColor: 'bg-red-400' },
  { id: 'weather', name: 'Weather', icon: Cloud, bgColor: 'bg-cyan-500' },
  { id: 'books', name: 'Books', icon: BookOpen, bgColor: 'bg-orange-400' },
  { id: 'games', name: 'Games', icon: Gamepad2, bgColor: 'bg-violet-500' },
  { id: 'news', name: 'News', icon: Newspaper, bgColor: 'bg-rose-500' },
  { id: 'podcasts', name: 'Podcasts', icon: Podcast, bgColor: 'bg-purple-500' },
  { id: 'contacts', name: 'Contacts', icon: Users, bgColor: 'bg-gray-600' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, bgColor: 'bg-gray-800' },
  { id: 'compass', name: 'Compass', icon: Compass, bgColor: 'bg-gray-700' },
];

interface HomeScreenProps {
  onAppTap: (appId: string) => void;
  onMisclick?: (appId: string) => void;
  targetApps?: string[];
  simpleMode?: boolean;
  highlightTarget?: string;
  showHint?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onAppTap,
  onMisclick,
  targetApps = [],
  simpleMode = true,
  highlightTarget,
  showHint = false,
}) => {
  const visibleApps = simpleMode 
    ? simpleModeApps 
    : allApps;

  const iconSize = simpleMode ? 'h-16 w-16' : 'h-14 w-14';
  const iconInnerSize = simpleMode ? 'h-8 w-8' : 'h-6 w-6';
  const gridCols = simpleMode ? 'grid-cols-3' : 'grid-cols-4';
  const textSize = simpleMode ? 'text-sm' : 'text-xs';

  const handleTap = (appId: string) => {
    if (targetApps.includes(appId)) {
      onAppTap(appId);
    } else {
      onMisclick?.(appId);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 p-4">
      {/* App Grid */}
      <div className={cn("grid gap-4 flex-1 content-start pt-4", gridCols)}>
        {visibleApps.map((app) => {
          const isTarget = targetApps.includes(app.id);
          const isHighlighted = highlightTarget === app.id;
          
          return (
            <button
              key={app.id}
              id={`app-${app.id}`}
              onClick={() => handleTap(app.id)}
              className={cn(
                "app-icon",
                isHighlighted && showHint && "animate-pulse-ring"
              )}
            >
              <div className={cn(
                "app-icon-bg",
                app.bgColor,
                iconSize,
                isHighlighted && "ring-4 ring-white ring-offset-2 ring-offset-transparent"
              )}>
                <app.icon className={cn("text-white", iconInnerSize)} />
              </div>
              <span className={cn("text-white font-medium drop-shadow-md", textSize)}>
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dock */}
      <div className="mt-auto">
        <div className="flex justify-center gap-6 rounded-3xl bg-white/20 backdrop-blur-md p-3">
          {['phone', 'messages', 'mail', 'music'].map((appId) => {
            const app = allApps.find(a => a.id === appId)!;
            const isTarget = targetApps.includes(app.id);
            const isHighlighted = highlightTarget === app.id;
            
            return (
              <button
                key={app.id}
                id={`dock-${app.id}`}
                onClick={() => handleTap(app.id)}
                className={cn(
                  "transition-transform active:scale-90",
                  isHighlighted && showHint && "animate-pulse-ring"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center rounded-xl",
                  app.bgColor,
                  simpleMode ? "h-14 w-14" : "h-12 w-12",
                  isHighlighted && "ring-2 ring-white"
                )}>
                  <app.icon className={cn(
                    "text-white",
                    simpleMode ? "h-7 w-7" : "h-5 w-5"
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
