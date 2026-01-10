import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Pill, 
  Video, 
  User,
  ChevronRight,
  Bell,
  LogOut,
  Search,
  Menu,
  X,
  Camera,
  Mic,
  MicOff,
  VideoOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PortalView = 'login' | 'home' | 'results' | 'messages' | 'medications' | 'video';

interface PatientPortalProps {
  onAction?: (action: string) => void;
  onMisclick?: () => void;
  currentStep?: string;
  simpleMode?: boolean;
  showHint?: boolean;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  onAction,
  onMisclick,
  currentStep = 'login',
  simpleMode = true,
  showHint = false,
}) => {
  const [view, setView] = useState<PortalView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messageText, setMessageText] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'results', label: 'Test Results', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'video', label: 'Video Visit', icon: Video },
  ];

  const handleLogin = () => {
    if (email && password) {
      setView('home');
      onAction?.('login');
    }
  };

  const handleNavigation = (id: string) => {
    if (['results', 'messages', 'medications', 'video'].includes(id)) {
      setView(id as PortalView);
      onAction?.(`view_${id}`);
    } else {
      onMisclick?.();
    }
  };

  // Login Screen
  if (view === 'login') {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-center gap-2 border-b bg-primary px-6 py-4">
          <Heart className="h-8 w-8 text-primary-foreground" />
          <span className="text-xl font-bold text-primary-foreground">MyHealth Portal</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className={cn(
            "w-full max-w-sm space-y-6",
            simpleMode && showHint && "ring-2 ring-primary rounded-xl p-4"
          )}>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground mt-1">Sign in to access your health records</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@email.com"
                  className={cn(simpleMode ? "h-12 text-lg" : "h-10")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(simpleMode ? "h-12 text-lg" : "h-10")}
                />
              </div>

              <Button 
                onClick={handleLogin}
                className="w-full"
                size={simpleMode ? "lg" : "default"}
              >
                Sign In
              </Button>
            </div>

            {simpleMode && (
              <p className="text-center text-sm text-muted-foreground">
                Enter the email and password shown above, then tap Sign In
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Video Visit Screen
  if (view === 'video') {
    return (
      <div className="flex h-full flex-col bg-gray-900">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-3">
          <button onClick={() => setView('home')} className="text-white">
            <X className="h-6 w-6" />
          </button>
          <span className="font-medium text-white">Video Visit with Dr. Smith</span>
          <div className="w-6" />
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="text-center text-white">
            <div className="h-32 w-32 mx-auto rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <User className="h-16 w-16 text-gray-500" />
            </div>
            <p className="text-lg">Waiting for Dr. Smith to join...</p>
          </div>

          {/* Self view */}
          <div className="absolute bottom-4 right-4 h-32 w-24 rounded-lg bg-gray-700 flex items-center justify-center">
            {cameraEnabled ? (
              <div className="text-xs text-white">Your camera</div>
            ) : (
              <VideoOff className="h-8 w-8 text-gray-500" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className={cn(
          "flex justify-center gap-4 bg-gray-800 p-4",
          simpleMode && showHint && "ring-2 ring-primary"
        )}>
          <button
            onClick={() => { setMicEnabled(!micEnabled); onAction?.('toggle_mic'); }}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              micEnabled ? "bg-gray-600" : "bg-red-500"
            )}
          >
            {micEnabled ? (
              <Mic className="h-6 w-6 text-white" />
            ) : (
              <MicOff className="h-6 w-6 text-white" />
            )}
          </button>

          <button
            onClick={() => { setCameraEnabled(!cameraEnabled); onAction?.('toggle_camera'); }}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              cameraEnabled ? "bg-gray-600" : "bg-red-500"
            )}
          >
            {cameraEnabled ? (
              <Video className="h-6 w-6 text-white" />
            ) : (
              <VideoOff className="h-6 w-6 text-white" />
            )}
          </button>

          <button
            onClick={() => { setView('home'); onAction?.('end_call'); }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {simpleMode && !cameraEnabled && !micEnabled && (
          <div className="bg-primary p-3 text-center">
            <p className="text-sm text-primary-foreground">
              Tap the camera and microphone buttons to enable them
            </p>
          </div>
        )}
      </div>
    );
  }

  // Main Portal View
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="portal-header">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">MyHealth</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onMisclick} className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
              2
            </span>
          </button>
          <button onClick={onMisclick}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="portal-nav overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={cn(
              "portal-nav-item whitespace-nowrap",
              view === item.id && "active",
              showHint && ['results', 'messages', 'medications', 'video'].includes(item.id) && "bg-primary/10"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === 'home' && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold text-foreground mb-2">Welcome back, John!</h2>
              <p className="text-sm text-muted-foreground">
                You have 1 upcoming appointment and 2 new messages.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {navItems.slice(1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border bg-card p-4 transition-all hover:shadow-md",
                    showHint && ['results', 'messages', 'medications', 'video'].includes(item.id) && "ring-2 ring-primary"
                  )}
                >
                  <item.icon className={cn("text-primary", simpleMode ? "h-8 w-8" : "h-6 w-6")} />
                  <span className={cn("font-medium", simpleMode ? "text-sm" : "text-xs")}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'results' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Test Results</h2>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Blood Panel</span>
                <span className="text-sm text-muted-foreground">Dec 15, 2024</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive metabolic panel results
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAction?.('view_results')}
              >
                View Details
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Cholesterol</span>
                <span className="text-sm text-muted-foreground">Dec 10, 2024</span>
              </div>
              <p className="text-sm text-success">All values within normal range</p>
            </div>
          </div>
        )}

        {view === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            
            <div 
              className={cn(
                "rounded-lg border bg-card p-4",
                showHint && "ring-2 ring-primary"
              )}
            >
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message to Dr. Smith..."
                className="w-full rounded-lg border p-3 text-sm resize-none"
                rows={4}
              />
              <Button 
                onClick={() => { onAction?.('send_message'); setMessageText(''); }}
                className="mt-3"
                disabled={!messageText.trim()}
              >
                Send Message
              </Button>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              Messages are typically answered within 2 business days
            </div>
          </div>
        )}

        {view === 'medications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Medications</h2>
            
            <div 
              className={cn(
                "rounded-lg border bg-card p-4",
                showHint && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Lisinopril 10mg</div>
                  <div className="text-sm text-muted-foreground">Take once daily</div>
                  <div className="text-sm text-warning mt-1">Refill needed - 5 days left</div>
                </div>
                <Button 
                  onClick={() => onAction?.('request_refill')}
                  size="sm"
                >
                  Request Refill
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Metformin 500mg</div>
                  <div className="text-sm text-muted-foreground">Take twice daily with meals</div>
                  <div className="text-sm text-success mt-1">30 days remaining</div>
                </div>
                <Button variant="outline" size="sm" onClick={onMisclick}>
                  Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
