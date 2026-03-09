import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, CheckCircle2, Circle, AlertTriangle, Phone, Shield, Bell, Settings, Activity, ToggleLeft, ToggleRight } from 'lucide-react';

type SafetyView = 'reminders' | 'alert' | 'emergency' | 'settings';

interface HomeSafetyAppProps {
  onBack: () => void;
  onAction: (action: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  screen?: SafetyView;
}

const reminders = [
  { id: 1, text: 'Take medication', time: '8:00 AM', done: false, isTarget: true },
  { id: 2, text: 'Check blood pressure', time: '10:00 AM', done: true },
  { id: 3, text: 'Walk for 20 minutes', time: '2:00 PM', done: false },
  { id: 4, text: 'Doctor appointment', time: '3:30 PM', done: false },
];

export const HomeSafetyApp: React.FC<HomeSafetyAppProps> = ({
  onBack,
  onAction,
  onMisclick,
  simpleMode = true,
  showHint = false,
  screen,
}) => {
  const [internalView, setInternalView] = useState<SafetyView>('reminders');
  const view = screen ?? internalView;
  const setView = (v: SafetyView) => setInternalView(v);

  const [medicationDone, setMedicationDone] = useState(false);
  const [fallDetection, setFallDetection] = useState(false);

  // Settings
  if (view === 'settings') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-teal-700 text-white">
          <button onClick={() => setView('reminders')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Safety Settings</span>
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="rounded-xl bg-white p-4 shadow-sm border">
            <h4 className="font-medium text-gray-900 mb-4">Detection Features</h4>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setFallDetection(true);
                  onAction('adjust_settings');
                }}
                className={cn(
                  "w-full flex items-center justify-between py-2",
                  showHint && !fallDetection && "bg-teal-50 -mx-2 px-2 rounded-lg ring-2 ring-teal-400 animate-pulse"
                )}
              >
                <div className="flex items-center gap-3">
                  <Activity className={cn("text-teal-600", simpleMode ? "h-6 w-6" : "h-5 w-5")} />
                  <div className="text-left">
                    <p className={cn("font-medium text-gray-900", simpleMode ? "text-base" : "text-sm")}>Fall Detection</p>
                    {simpleMode && <p className="text-xs text-gray-500">Alerts emergency contacts if a fall is detected</p>}
                  </div>
                </div>
                {fallDetection
                  ? <ToggleRight className="h-8 w-8 text-teal-600" />
                  : <ToggleLeft className="h-8 w-8 text-gray-400" />
                }
              </button>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className={cn("text-teal-600", simpleMode ? "h-6 w-6" : "h-5 w-5")} />
                  <div>
                    <p className={cn("font-medium text-gray-900", simpleMode ? "text-base" : "text-sm")}>Smoke Detection</p>
                  </div>
                </div>
                <ToggleRight className="h-8 w-8 text-teal-600" />
              </div>

              {!simpleMode && (
                <>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-teal-600" />
                      <p className="text-sm font-medium text-gray-900">Motion Alerts</p>
                    </div>
                    <ToggleRight className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-teal-600" />
                      <p className="text-sm font-medium text-gray-900">CO₂ Detection</p>
                    </div>
                    <ToggleLeft className="h-8 w-8 text-gray-400" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Emergency call
  if (view === 'emergency') {
    return (
      <div className="flex h-full flex-col bg-red-600">
        <div className="flex items-center gap-3 p-4 text-white">
          <button onClick={() => setView('reminders')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Emergency</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-white">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
            <Phone className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Emergency Call</h3>
          <p className="text-center text-red-100 mb-8">
            This will contact emergency services and alert your emergency contacts.
          </p>
          <button
            onClick={() => onAction('call_emergency')}
            className={cn(
              "w-full max-w-xs rounded-2xl bg-white py-5 text-red-600 font-bold text-xl hover:bg-red-50",
              showHint && "ring-4 ring-white/50 animate-pulse"
            )}
          >
            📞 Call 911
          </button>
          <button
            onClick={() => setView('reminders')}
            className="mt-4 text-white/80 underline text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Safety alert
  if (view === 'alert') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-teal-700 text-white">
          <button onClick={() => setView('reminders')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">HomeSafe</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-xl border-2 border-orange-400 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-700">Smoke Detected</h3>
                <p className="text-sm text-gray-500">Kitchen sensor • Just now</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              The kitchen smoke detector has been triggered. Please check and acknowledge.
            </p>
            <button
              onClick={() => onAction('acknowledge_alert')}
              className={cn(
                "w-full rounded-xl bg-orange-500 py-4 text-white font-bold hover:bg-orange-600",
                showHint && "ring-2 ring-orange-400 animate-pulse"
              )}
            >
              Acknowledge Alert
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reminders (home)
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-teal-700 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold text-lg">HomeSafe</span>
          <button onClick={() => setView('settings')}>
            <Settings className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-teal-200">Today's Reminders</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-2 space-y-3 pb-4">
        {reminders.map((reminder) => {
          const isDone = reminder.isTarget ? medicationDone : reminder.done;
          return (
            <button
              key={reminder.id}
              onClick={() => {
                if (reminder.isTarget && !medicationDone) {
                  setMedicationDone(true);
                  onAction('complete_reminder');
                } else {
                  onMisclick?.();
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border text-left",
                reminder.isTarget && showHint && !medicationDone && "ring-2 ring-teal-400 animate-pulse"
              )}
            >
              {isDone
                ? <CheckCircle2 className={cn("text-green-500 shrink-0", simpleMode ? "h-8 w-8" : "h-6 w-6")} />
                : <Circle className={cn("text-gray-300 shrink-0", simpleMode ? "h-8 w-8" : "h-6 w-6")} />
              }
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  isDone ? "text-gray-400 line-through" : "text-gray-900",
                  simpleMode ? "text-base" : "text-sm"
                )}>
                  {reminder.text}
                </p>
                <p className="text-sm text-gray-500">{reminder.time}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="border-t bg-white p-4">
        <div className={cn("grid gap-3", simpleMode ? "grid-cols-2" : "grid-cols-3")}>
          <button
            onClick={() => setView('emergency')}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600",
              simpleMode ? "p-4" : "p-3"
            )}
          >
            <Phone className={cn(simpleMode ? "h-7 w-7" : "h-5 w-5")} />
            <span className={cn("font-medium", simpleMode ? "text-sm" : "text-xs")}>Emergency</span>
          </button>
          <button
            onClick={() => setView('settings')}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-600",
              simpleMode ? "p-4" : "p-3"
            )}
          >
            <Settings className={cn(simpleMode ? "h-7 w-7" : "h-5 w-5")} />
            <span className={cn("font-medium", simpleMode ? "text-sm" : "text-xs")}>Settings</span>
          </button>
          {!simpleMode && (
            <button
              onClick={() => onMisclick?.()}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 p-3"
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs font-medium">Activity</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
