import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  MoreHorizontal,
  Volume1,
  Volume2,
} from 'lucide-react';

// ── Shared wrong-app screen components ────────────────────────────────────────
// Used by both Assessment (live scoring) and DemoSection (landing page demo).
// None of these accept task-advancing callbacks — all interactions are cosmetic.

export const PhoneRecentsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recents' | 'contacts' | 'keypad'>('recents');
  const [dialInput, setDialInput] = useState('');

  const recentCalls = [
    { name: 'Dr. Patel',    type: 'incoming' as const, time: 'Yesterday', initials: 'DP', color: 'bg-blue-600' },
    { name: 'CVS Pharmacy', type: 'missed'   as const, time: 'Mon',       initials: 'CV', color: 'bg-red-600' },
    { name: 'Emma',         type: 'outgoing' as const, time: 'Sun',       initials: 'Em', color: 'bg-purple-600' },
    { name: 'Walgreens',    type: 'incoming' as const, time: 'Last week', initials: 'Wg', color: 'bg-green-600' },
  ];

  const contacts = [
    { name: 'Dr. James Okafor', initials: 'JO', color: 'bg-indigo-600' },
    { name: 'Dr. Patel',        initials: 'DP', color: 'bg-blue-600' },
    { name: 'Emma',             initials: 'Em', color: 'bg-purple-600' },
    { name: 'John Smith',       initials: 'JS', color: 'bg-gray-500' },
    { name: 'Michael',          initials: 'Mi', color: 'bg-emerald-600' },
  ];

  const keypadKeys: [string, string][] = [
    ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
    ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
    ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
    ['*', ''], ['0', '+'], ['#', ''],
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <span className="text-xl font-bold text-gray-900">
          {activeTab === 'recents' ? 'Recents' : activeTab === 'contacts' ? 'Contacts' : 'Keypad'}
        </span>
        <span className="text-blue-500 text-sm font-medium">Edit</span>
      </div>

      <div className="flex border-b">
        {(['recents', 'contacts', 'keypad'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 text-xs capitalize transition-colors',
              activeTab === tab
                ? 'text-blue-500 border-b-2 border-blue-500 font-medium'
                : 'text-gray-500',
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'recents' && (
        <>
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
            All
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentCalls.map((call, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 active:bg-gray-50 transition-colors">
                <div className={cn('h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0', call.color)}>
                  <span className="text-sm font-bold text-white">{call.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', call.type === 'missed' ? 'text-red-500' : 'text-gray-900')}>
                    {call.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {call.type === 'outgoing' ? '↗' : '↙'} Mobile · {call.time}
                  </p>
                </div>
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                  <Phone className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-4 py-3 flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center">
              <Phone className="h-6 w-6 text-white" />
            </div>
          </div>
        </>
      )}

      {activeTab === 'contacts' && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">D</div>
          {contacts.slice(0, 2).map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b active:bg-gray-50 transition-colors">
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0', c.color)}>
                <span className="text-sm font-bold text-white">{c.initials}</span>
              </div>
              <span className="text-sm text-gray-900">{c.name}</span>
            </div>
          ))}
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">E–M</div>
          {contacts.slice(2).map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b active:bg-gray-50 transition-colors">
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0', c.color)}>
                <span className="text-sm font-bold text-white">{c.initials}</span>
              </div>
              <span className="text-sm text-gray-900">{c.name}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'keypad' && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 bg-white">
          <div className="mb-4 min-h-10 flex items-center justify-center w-full">
            <span className="text-3xl font-light text-gray-900 tracking-widest">{dialInput}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {keypadKeys.map(([num, sub], i) => (
              <button
                key={i}
                onClick={() => setDialInput(prev => prev + num)}
                className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <span className="text-2xl font-light text-gray-900 leading-none">{num}</span>
                {sub && <span className="text-xs text-gray-500 leading-none mt-0.5">{sub}</span>}
              </button>
            ))}
          </div>
          <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center">
            <Phone className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsScreen: React.FC = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplane, setAirplane] = useState(false);

  const renderToggle = (on: boolean, onToggle: () => void) => (
    <button
      onClick={onToggle}
      className={cn('relative h-6 w-11 rounded-full transition-colors flex-shrink-0', on ? 'bg-green-500' : 'bg-gray-300')}
    >
      <div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ left: on ? '22px' : '2px', transition: 'left 0.15s ease' }}
      />
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-bold text-gray-900 text-2xl">Settings</h1>
      </div>

      <div className="mx-4 mb-4 rounded-xl bg-white px-4 py-3 flex items-center gap-3 active:bg-gray-50 transition-colors">
        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Patient User</p>
          <p className="text-xs text-blue-500">Apple ID, iCloud+</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <div className="mx-4 rounded-xl bg-white overflow-hidden divide-y divide-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">Wi</span>
            </div>
            <span className="flex-1 text-gray-900">Wi-Fi</span>
            <span className="text-sm text-gray-400 mr-2">{wifi ? 'HomeNetwork' : 'Off'}</span>
            {renderToggle(wifi, () => setWifi(w => !w))}
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">BT</span>
            </div>
            <span className="flex-1 text-gray-900">Bluetooth</span>
            <span className="text-sm text-gray-400 mr-2">{bluetooth ? 'On' : 'Off'}</span>
            {renderToggle(bluetooth, () => setBluetooth(b => !b))}
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">✈</span>
            </div>
            <span className="flex-1 text-gray-900">Airplane Mode</span>
            {renderToggle(airplane, () => setAirplane(a => !a))}
          </div>
        </div>

        <div className="mx-4 rounded-xl bg-white overflow-hidden divide-y divide-gray-100">
          {[
            { label: 'Notifications',      abbr: 'N',  color: 'bg-red-500',   value: '' },
            { label: 'General',            abbr: 'G',  color: 'bg-gray-500',  value: '' },
            { label: 'Display & Brightness', abbr: 'D', color: 'bg-blue-400', value: '' },
            { label: 'Privacy & Security', abbr: 'Pr', color: 'bg-blue-600',  value: '' },
            { label: 'Battery',            abbr: 'B',  color: 'bg-green-500', value: '95%' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors">
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', item.color)}>
                <span className="text-white text-xs font-bold">{item.abbr}</span>
              </div>
              <span className="flex-1 text-gray-900">{item.label}</span>
              {item.value && <span className="text-sm text-gray-400 mr-1">{item.value}</span>}
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MusicScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex h-full flex-col bg-gray-950 text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <button><ChevronDown className="h-6 w-6 text-white/60" /></button>
        <p className="text-xs font-semibold tracking-widest text-white/60 uppercase">Now Playing</p>
        <button><MoreHorizontal className="h-6 w-6 text-white/60" /></button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-between px-6 pb-6">
        <div className="w-full max-w-[200px] aspect-square rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-2xl mt-2" />

        <div className="w-full mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-base text-white">Peaceful Piano</p>
              <p className="text-sm text-white/60">Various Artists</p>
            </div>
            <button onClick={() => setIsLiked(l => !l)}>
              <Heart
                className={cn('h-6 w-6 transition-colors', isLiked ? 'text-pink-500' : 'text-white/40')}
                fill={isLiked ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          <div>
            <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
              <div className="h-1 w-[38%] rounded-full bg-white" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-white/40">1:24</span>
              <span className="text-xs text-white/40">3:45</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button><SkipBack className="h-7 w-7 text-white" /></button>
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="h-14 w-14 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
            >
              {isPlaying
                ? <Pause className="h-6 w-6 text-gray-900" />
                : <Play className="h-6 w-6 text-gray-900 ml-0.5" />}
            </button>
            <button><SkipForward className="h-7 w-7 text-white" /></button>
          </div>

          <div className="flex items-center gap-3">
            <Volume1 className="h-4 w-4 text-white/40 flex-shrink-0" />
            <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="h-1 w-3/5 rounded-full bg-white/80" />
            </div>
            <Volume2 className="h-4 w-4 text-white/40 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const APP_DISPLAY_NAMES: Record<string, string> = {
  whatsapp: 'WhatsApp', maps: 'Maps', streamtv: 'StreamTV', reminders: 'Reminders',
  homesafe: 'HomeSafe', appstore: 'App Store', camera: 'Camera', calendar: 'Calendar',
  weather: 'Weather', books: 'Books', games: 'Games', news: 'News',
  podcasts: 'Podcasts', contacts: 'Contacts', calculator: 'Calculator',
  compass: 'Compass', quickshop: 'QuickShop',
};

export const APP_BG_COLORS: Record<string, string> = {
  whatsapp: 'bg-emerald-500', maps: 'bg-emerald-600', streamtv: 'bg-purple-600',
  reminders: 'bg-amber-500', homesafe: 'bg-teal-600', appstore: 'bg-blue-500',
  camera: 'bg-gray-700', calendar: 'bg-red-400', weather: 'bg-cyan-500',
  books: 'bg-orange-400', games: 'bg-violet-500', news: 'bg-rose-500',
  podcasts: 'bg-purple-500', contacts: 'bg-gray-600', calculator: 'bg-gray-800',
  compass: 'bg-gray-700', quickshop: 'bg-orange-500',
};

export const GenericAppLaunchScreen: React.FC<{ appId: string }> = ({ appId }) => {
  const name = APP_DISPLAY_NAMES[appId] ?? (appId.charAt(0).toUpperCase() + appId.slice(1));
  const color = APP_BG_COLORS[appId] ?? 'bg-gray-600';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b">
        <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">{name}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className={cn('h-20 w-20 rounded-3xl flex items-center justify-center opacity-40', color)}>
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
        <p className="text-sm text-gray-500">Loading {name}…</p>
        <div className="w-48 space-y-2">
          <div className="h-2.5 w-full rounded-full bg-gray-200 animate-pulse" />
          <div className="h-2.5 w-3/4 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-2.5 w-1/2 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Wrapper that renders any wrong-app screen with a sticky "Return to Task" strip
// at the bottom of the phone frame. Use this inside <PhoneFrame>.
export const WrongAppScreen: React.FC<{ onGoBack: () => void; children: React.ReactNode }> = ({ onGoBack, children }) => (
  <div className="relative h-full overflow-hidden">
    <div className="absolute inset-0 bottom-9 overflow-hidden">
      {children}
    </div>
    <button
      onClick={onGoBack}
      className="absolute bottom-0 left-0 right-0 h-9 flex items-center justify-center gap-1.5 bg-orange-500 text-xs font-bold text-white z-10"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      Return to Task
    </button>
  </div>
);
