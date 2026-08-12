import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Calendar,
  MessageSquare,
  FlaskConical,
  Pill,
  CreditCard,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Send,
  Plus,
  MapPin,
  Phone,
  Clock,
} from 'lucide-react';

type MyChartView = 'results' | 'appointments' | 'messages';
type MessagesSubView = 'inbox' | 'compose';

interface MyChartPortalProps {
  onAction?: (action: string) => void;
  onMisclick?: () => void;
  currentStep?: string;
  simpleMode?: boolean;
  showHint?: boolean;
  screen?: MyChartView;
  variant?: 'reassessment';
}

const MYCHART_NAVY = '#0033a0';
const MYCHART_TEAL = '#046780';
const MYCHART_TEAL_HOVER = '#045a70';

const labResultsReassessment = [
  {
    id: 'lipid',
    name: 'Lipid Panel',
    date: 'July 2, 2025',
    provider: 'Dr. Sarah Patel',
    status: 'Final',
    isRecent: true,
    values: [
      { name: 'Total Cholesterol', value: '198', unit: 'mg/dL', range: '<200', normal: true },
      { name: 'LDL Cholesterol', value: '118', unit: 'mg/dL', range: '<130', normal: true },
      { name: 'HDL Cholesterol', value: '52', unit: 'mg/dL', range: '>40', normal: true },
      { name: 'Triglycerides', value: '142', unit: 'mg/dL', range: '<150', normal: true },
    ],
  },
  {
    id: 'tsh',
    name: 'TSH (Thyroid)',
    date: 'June 20, 2025',
    provider: 'Dr. Sarah Patel',
    status: 'Final',
    isRecent: false,
    values: [],
  },
];

const appointmentReassessment = {
  provider: 'Dr. James Okafor',
  specialty: 'Physical Medicine & Rehabilitation',
  date: 'August 5, 2025',
  time: '10:00 AM',
  location: 'Ohio State Wexner Medical Center',
  address: '370 W 9th Ave, Columbus, OH 43210',
  phone: '(614) 293-8000',
  department: 'PM&R Institute',
  instructions: 'Please bring a list of your current medications and wear comfortable clothing.',
};

const nurseThread = {
  subject: 'Medication Refill Request',
  sender: 'Nurse Coordinator',
  sentAgo: '1 week ago',
  preview: 'Your refill request has been reviewed. Please see the message below for instructions on your next steps.',
};

const labResults = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    date: 'June 12, 2025',
    provider: 'Dr. Sarah Patel',
    status: 'Final',
    isRecent: true,
    values: [
      { name: 'WBC (White Blood Cells)', value: '6.2', unit: 'K/uL', range: '4.5–11.0', normal: true },
      { name: 'RBC (Red Blood Cells)', value: '4.5', unit: 'M/uL', range: '4.2–5.4', normal: true },
      { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', range: '12.0–16.0', normal: true },
      { name: 'Hematocrit', value: '41%', unit: '%', range: '36–46', normal: true },
      { name: 'Platelets', value: '245', unit: 'K/uL', range: '150–400', normal: true },
    ],
  },
  {
    id: 'hba1c',
    name: 'Hemoglobin A1c',
    date: 'May 28, 2025',
    provider: 'Dr. Sarah Patel',
    status: 'Final',
    isRecent: false,
    values: [],
  },
];

const appointment = {
  provider: 'Dr. Sarah Patel',
  specialty: 'Neurology',
  date: 'July 18, 2025',
  time: '2:30 PM',
  location: 'Ohio State Wexner Medical Center',
  address: '370 W 9th Ave, Columbus, OH 43210',
  phone: '(614) 293-8000',
  department: 'Neurological Institute',
  instructions: 'Please arrive 10 minutes early. Bring a list of your current medications.',
};

const priorThread = {
  subject: 'Re: Medication Question',
  sender: 'Dr. Sarah Patel',
  sentAgo: '3 days ago',
  preview: 'Happy to help! The dosage change should not affect your blood pressure significantly, but please monitor and contact us if you notice any changes.',
};

export const MyChartPortal: React.FC<MyChartPortalProps> = ({
  onAction,
  onMisclick,
  currentStep,
  simpleMode = true,
  showHint = false,
  screen = 'results',
  variant,
}) => {
  const isReassessment = variant === 'reassessment';
  const activeLabResults = isReassessment ? labResultsReassessment : labResults;
  const activeAppointment = isReassessment ? appointmentReassessment : appointment;
  const targetLabId = isReassessment ? 'lipid' : 'cbc';
  const [view, setView] = useState<MyChartView>(screen);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [appointmentExpanded, setAppointmentExpanded] = useState(false);
  const [messagesSubView, setMessagesSubView] = useState<MessagesSubView>('inbox');
  const [messageBody, setMessageBody] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  // Sync view when the screen prop changes (Assessment advances to next step)
  useEffect(() => {
    setView(screen);
    setExpandedResult(null);
    setAppointmentExpanded(false);
    setMessagesSubView('inbox');
    setMessageBody('');
    setMessageSubject('');
  }, [screen]);

  const handleNav = (target: MyChartView | 'medications' | 'billing') => {
    if (target === 'medications' || target === 'billing') {
      onMisclick?.();
      return;
    }
    setView(target as MyChartView);
  };

  const handleOpenResult = (resultId: string) => {
    if (resultId === targetLabId) {
      setExpandedResult(expandedResult === targetLabId ? null : targetLabId);
      if (expandedResult !== targetLabId) {
        onAction?.('open_result');
      }
    } else {
      onMisclick?.();
    }
  };

  const handleExpandAppointment = () => {
    setAppointmentExpanded(prev => !prev);
    if (!appointmentExpanded) {
      onAction?.('view_appointment');
    }
  };

  const handleSendMessage = () => {
    if (messageBody.trim()) {
      onAction?.('send_message');
    } else {
      onMisclick?.();
    }
  };

  const navItems = [
    { id: 'appointments', label: 'Appointments', icon: Calendar, active: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, active: true },
    { id: 'results', label: 'Test Results', icon: FlaskConical, active: true },
    { id: 'medications', label: 'Medications', icon: Pill, active: false },
    { id: 'billing', label: 'Billing', icon: CreditCard, active: false },
  ] as const;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white font-sans">
      {/* ── Header ── */}
      <div
        className="flex flex-shrink-0 items-center gap-3 px-4 py-3"
        style={{ backgroundColor: MYCHART_NAVY }}
      >
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="rounded p-1 text-white/80 hover:bg-white/10 transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex-1">
          <span className="text-xl font-bold tracking-tight text-white">MyChart</span>
        </div>

        <button onClick={onMisclick} className="relative rounded p-1 text-white/80 hover:bg-white/10">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            1
          </span>
        </button>

        <button onClick={onMisclick} className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition-colors">
          <User className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-40 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
            <div className="py-2">
              {navItems.map(item => {
                const isActive = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                      isActive
                        ? 'font-semibold'
                        : 'text-gray-600 hover:bg-gray-50',
                      !item.active && 'opacity-50 cursor-not-allowed',
                      showHint && item.id === screen && 'bg-blue-50',
                    )}
                    style={isActive ? { color: MYCHART_TEAL, borderLeft: `3px solid ${MYCHART_TEAL}`, paddingLeft: 9 } : {}}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-100 px-3 py-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <p className="text-xs font-semibold text-blue-800">Patient</p>
                <p className="mt-0.5 text-xs text-blue-700">John Smith</p>
                <p className="text-xs text-blue-600">DOB: 03/14/1955</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Main content area ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50">

          {/* ═══ TEST RESULTS ═══ */}
          {view === 'results' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800">Test Results</h2>
                <span className="text-xs text-gray-500">{labResults.length} results</span>
              </div>

              {activeLabResults.map(result => (
                <div
                  key={result.id}
                  className={cn(
                    'overflow-hidden rounded-xl border bg-white shadow-sm transition-all',
                    result.isRecent && showHint && 'ring-2 ring-offset-1',
                  )}
                  style={result.isRecent && showHint ? { ringColor: MYCHART_TEAL } : {}}
                >
                  <button
                    onClick={() => handleOpenResult(result.id)}
                    className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    disabled={!result.isRecent}
                  >
                    {/* Status dot */}
                    <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: MYCHART_TEAL }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('font-semibold text-sm text-gray-800 leading-tight', !result.isRecent && 'text-gray-600')}>
                          {result.name}
                        </p>
                        <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: MYCHART_TEAL }}>
                          {result.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {result.date} · {result.provider}
                      </p>
                      {result.isRecent && (
                        <p className="mt-1 text-xs font-medium" style={{ color: MYCHART_TEAL }}>
                          Most recent · Tap to view details
                        </p>
                      )}
                    </div>

                    {result.isRecent && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 flex-shrink-0 text-gray-400 transition-transform',
                          expandedResult === result.id && 'rotate-180',
                        )}
                      />
                    )}
                  </button>

                  {/* Expanded values */}
                  {expandedResult === result.id && result.values.length > 0 && (
                    <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Results
                      </p>
                      <div className="space-y-2">
                        {result.values.map(v => (
                          <div key={v.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                            <div>
                              <p className="text-xs font-medium text-gray-700">{v.name}</p>
                              <p className="text-xs text-gray-500">Range: {v.range} {v.unit}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-800">
                                {v.value} <span className="text-xs font-normal text-gray-500">{v.unit}</span>
                              </p>
                              <span className={cn(
                                'text-xs font-semibold',
                                v.normal ? 'text-green-600' : 'text-red-600',
                              )}>
                                {v.normal ? '✓ Normal' : '⚠ Abnormal'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                        <p className="text-xs font-semibold text-green-700">All values within normal range</p>
                        <p className="text-xs text-green-600 mt-0.5">No action required. Continue current care plan.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {simpleMode && !expandedResult && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
                  <p className="text-xs text-blue-700">
                    {isReassessment
                      ? <>Tap the <strong>Lipid Panel</strong> result to view your lab values</>
                      : <>Tap the <strong>Complete Blood Count (CBC)</strong> result to view your lab values</>}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══ APPOINTMENTS ═══ */}
          {view === 'appointments' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800">Appointments</h2>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Upcoming</p>

              <div
                className={cn(
                  'overflow-hidden rounded-xl border bg-white shadow-sm',
                  showHint && !appointmentExpanded && 'ring-2',
                )}
                style={showHint && !appointmentExpanded ? { outlineColor: MYCHART_TEAL } : {}}
              >
                <button
                  onClick={handleExpandAppointment}
                  className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* Date badge */}
                  <div
                    className="flex-shrink-0 rounded-lg p-2 text-center"
                    style={{ backgroundColor: `${MYCHART_NAVY}15` }}
                  >
                    <p className="text-xs font-bold uppercase" style={{ color: MYCHART_NAVY }}>
                      {isReassessment ? 'Aug' : 'Jul'}
                    </p>
                    <p className="text-xl font-bold leading-none" style={{ color: MYCHART_NAVY }}>
                      {isReassessment ? '5' : '18'}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{activeAppointment.provider}</p>
                        <p className="text-xs text-gray-500">{activeAppointment.specialty}</p>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 flex-shrink-0 text-gray-400 transition-transform mt-0.5',
                          appointmentExpanded && 'rotate-180',
                        )}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {activeAppointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {activeAppointment.location}
                      </span>
                    </div>
                    {!appointmentExpanded && (
                      <p className="mt-1.5 text-xs font-medium" style={{ color: MYCHART_TEAL }}>
                        Tap to see details
                      </p>
                    )}
                  </div>
                </button>

                {/* Expanded appointment details */}
                {appointmentExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 pb-4 pt-3 space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 border border-gray-100">
                        <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: MYCHART_TEAL }} />
                        <div>
                          <p className="text-xs text-gray-500">Date &amp; Time</p>
                          <p className="text-sm font-semibold text-gray-800">{activeAppointment.date} at {activeAppointment.time}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 border border-gray-100">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: MYCHART_TEAL }} />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-semibold text-gray-800">{activeAppointment.location}</p>
                          <p className="text-xs text-gray-500">{activeAppointment.address}</p>
                          <p className="text-xs text-gray-500">{activeAppointment.department}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 border border-gray-100">
                        <Phone className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: MYCHART_TEAL }} />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-semibold text-gray-800">{activeAppointment.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                      <p className="text-xs font-semibold text-amber-800">Instructions</p>
                      <p className="mt-0.5 text-xs text-amber-700">{activeAppointment.instructions}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule new appointment button */}
              <button
                onClick={onMisclick}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-600"
              >
                <Plus className="h-4 w-4" />
                Schedule New Appointment
              </button>

              {simpleMode && !appointmentExpanded && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
                  <p className="text-xs text-blue-700">
                    {isReassessment
                      ? <>Tap the appointment card with <strong>Dr. James Okafor</strong> to view your details</>
                      : <>Tap the appointment card with <strong>Dr. Sarah Patel</strong> to view your details</>}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══ MESSAGES ═══ */}
          {view === 'messages' && (
            <div className="flex h-full flex-col">
              {messagesSubView === 'inbox' && (
                <div className="flex h-full flex-col">
                  {/* Messages header */}
                  <div className="flex flex-shrink-0 items-center justify-between border-b bg-white px-4 py-3">
                    <h2 className="text-base font-bold text-gray-800">Messages</h2>
                    <button
                      onClick={() => {
                        setMessagesSubView('compose');
                        onAction?.('open_compose');
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      style={{ backgroundColor: MYCHART_TEAL }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Message
                    </button>
                  </div>

                  {/* Thread list */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* Reassessment: Nurse Coordinator thread is the target */}
                    {isReassessment ? (
                      <button
                        onClick={() => { setMessagesSubView('compose'); onAction?.('open_compose'); }}
                        className="flex w-full items-start gap-3 rounded-xl border bg-white p-3 shadow-sm text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-emerald-700 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">NC</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <p className="text-sm font-semibold text-gray-800">{nurseThread.sender}</p>
                            <p className="text-xs text-gray-500">{nurseThread.sentAgo}</p>
                          </div>
                          <p className="text-xs font-medium text-gray-600 mt-0.5">{nurseThread.subject}</p>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{nurseThread.preview}</p>
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={onMisclick}
                        className="flex w-full items-start gap-3 rounded-xl border bg-white p-3 shadow-sm text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-blue-700 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">SP</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <p className="text-sm font-semibold text-gray-800">{priorThread.sender}</p>
                            <p className="text-xs text-gray-500">{priorThread.sentAgo}</p>
                          </div>
                          <p className="text-xs font-medium text-gray-600 mt-0.5">{priorThread.subject}</p>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{priorThread.preview}</p>
                        </div>
                      </button>
                    )}
                  </div>

                  {simpleMode && (
                    <div className="flex-shrink-0 border-t bg-blue-50 px-3 py-2.5 text-center">
                      <p className="text-xs text-blue-700">
                        {isReassessment
                          ? <>Tap the <strong>Nurse Coordinator</strong> message to reply</>
                          : <>Tap <strong>New Message</strong> to compose a message to your doctor</>}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {messagesSubView === 'compose' && (
                <div className="flex h-full flex-col">
                  {/* Compose header */}
                  <div className="flex flex-shrink-0 items-center justify-between border-b bg-white px-4 py-3">
                    <button
                      onClick={() => setMessagesSubView('inbox')}
                      className="text-sm font-medium"
                      style={{ color: MYCHART_TEAL }}
                    >
                      ← Back
                    </button>
                    <h2 className="text-sm font-bold text-gray-800">
                      {isReassessment ? 'Reply' : 'New Message'}
                    </h2>
                    <button
                      onClick={handleSendMessage}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors',
                        messageBody.trim() ? 'opacity-100' : 'opacity-60',
                      )}
                      style={{ backgroundColor: MYCHART_TEAL }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </button>
                  </div>

                  {/* To field */}
                  <div className="flex-shrink-0 border-b bg-white px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: `${MYCHART_NAVY}15` }}>
                        <div className="h-5 w-5 rounded-full bg-blue-700 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">
                            {isReassessment ? 'NC' : 'SP'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: MYCHART_NAVY }}>
                          {isReassessment ? 'Nurse Coordinator' : 'Dr. Sarah Patel'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subject field */}
                  <div className="flex-shrink-0 border-b bg-white px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                    <input
                      className="w-full text-sm text-gray-800 outline-none placeholder:text-gray-400"
                      placeholder="Message subject (optional)"
                      value={messageSubject}
                      onChange={e => setMessageSubject(e.target.value)}
                    />
                  </div>

                  {/* Body */}
                  <textarea
                    className={cn(
                      'flex-1 resize-none bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400',
                      showHint && !messageBody && 'ring-2 ring-inset',
                    )}
                    style={showHint && !messageBody ? { ringColor: MYCHART_TEAL } : {}}
                    placeholder={isReassessment ? 'Type your reply…' : 'Type your message to Dr. Patel…'}
                    value={messageBody}
                    onChange={e => setMessageBody(e.target.value)}
                  />

                  <div className="flex-shrink-0 border-t bg-gray-50 px-3 py-2 text-center">
                    {simpleMode ? (
                      <p className="text-xs text-gray-500">
                        {messageBody.trim()
                          ? 'Tap Send when ready'
                          : 'Type your question about your medication, then tap Send'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Messages are typically answered within 2 business days
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
