import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, Menu, ChevronLeft, Reply, MoreVertical, Pencil, Send, X } from 'lucide-react';

type GmailView = 'inbox' | 'thread' | 'compose';

interface GmailAppProps {
  onAction?: (action: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  variant?: 'reassessment';
}

const emails = [
  {
    id: 'doctor-office',
    from: "Dr. Patel's Office",
    initials: 'DO',
    avatarBg: 'bg-blue-600',
    subject: 'Your Upcoming Appointment & Lab Results',
    preview: 'Please review your recent lab results. Your appointment is scheduled for July 18…',
    time: '10:42 AM',
    unread: true,
  },
  {
    id: 'cvs',
    from: 'CVS Pharmacy',
    initials: 'CV',
    avatarBg: 'bg-red-600',
    subject: 'Prescription ready for pickup',
    preview: 'Your Lisinopril 10mg prescription is ready at our Main Street location.',
    time: 'Yesterday',
    unread: false,
  },
];

const emailsReassessment = [
  {
    id: 'ohiohealth',
    from: 'OhioHealth Patient Services',
    initials: 'OH',
    avatarBg: 'bg-emerald-600',
    subject: 'Your appointment summary is ready',
    preview: 'Your recent visit summary and follow-up instructions are now available…',
    time: '9:18 AM',
    unread: true,
  },
  {
    id: 'cvs',
    from: 'CVS Pharmacy',
    initials: 'CV',
    avatarBg: 'bg-red-600',
    subject: 'Prescription ready for pickup',
    preview: 'Your Lisinopril 10mg prescription is ready at our Main Street location.',
    time: 'Yesterday',
    unread: false,
  },
];

export const GmailApp: React.FC<GmailAppProps> = ({
  onAction,
  onMisclick,
  simpleMode = true,
  showHint = false,
  variant,
}) => {
  const isReassessment = variant === 'reassessment';
  const emailList = isReassessment ? emailsReassessment : emails;
  const targetEmailId = isReassessment ? 'ohiohealth' : 'doctor-office';
  const defaultSubject = isReassessment
    ? 'Re: Your appointment summary is ready'
    : 'Re: Your Upcoming Appointment & Lab Results';

  const [view, setView] = useState<GmailView>('inbox');
  const [replyText, setReplyText] = useState('');
  const [replySubject, setReplySubject] = useState(defaultSubject);

  const handleEmailTap = (emailId: string) => {
    if (emailId === targetEmailId) {
      setView('thread');
      onAction?.('open_email');
    } else {
      onMisclick?.();
    }
  };

  const handleReply = () => {
    setView('compose');
    onAction?.('reply');
  };

  const handleSend = () => {
    if (replyText.trim()) {
      onAction?.('send_email');
    } else {
      onMisclick?.();
    }
  };

  /* ── Compose / Reply view ── */
  if (view === 'compose') {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center gap-3 border-b bg-white px-3 py-3 shadow-sm">
          <button onClick={() => setView('thread')} className="p-1">
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <span className="flex-1 font-medium text-gray-800 text-sm">New message</span>
          <button
            onClick={handleSend}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              replyText.trim() ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              showHint && replyText.trim() && 'ring-2 ring-primary ring-offset-1',
            )}
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>

        <div className="border-b px-4 py-2.5">
          <span className="text-xs text-gray-500 mr-1">To</span>
          <span className="text-sm text-gray-800">dr.patel@osumc.edu</span>
        </div>

        <div className="border-b px-4 py-2.5">
          <input
            className="w-full text-sm text-gray-800 outline-none placeholder:text-gray-400"
            placeholder="Subject"
            value={replySubject}
            onChange={e => setReplySubject(e.target.value)}
          />
        </div>

        <textarea
          className={cn(
            'flex-1 resize-none px-4 py-3 text-sm text-gray-800 outline-none',
            showHint && !replyText && 'ring-2 ring-primary ring-inset',
          )}
          placeholder="Compose email…"
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
        />

        {simpleMode && (
          <div className="border-t bg-blue-50 px-3 py-2 text-center">
            <p className="text-xs text-blue-700">
              {replyText.trim() ? 'Tap Send when ready' : 'Type your reply, then tap Send'}
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── Thread view ── */
  if (view === 'thread') {
    const threadSubject = isReassessment
      ? 'Your appointment summary is ready'
      : 'Your Upcoming Appointment & Lab Results';
    const threadFrom = isReassessment ? 'OhioHealth Patient Services' : "Dr. Patel's Office";
    const threadInitials = isReassessment ? 'OH' : 'DO';
    const threadTime = isReassessment ? '9:18 AM' : '10:42 AM';
    const threadAvatarBg = isReassessment ? 'bg-emerald-600' : 'bg-blue-600';

    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center gap-2 border-b bg-white px-3 py-3 shadow-sm">
          <button onClick={() => setView('inbox')} className="p-1">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="flex-1 truncate text-sm font-medium text-gray-800">
            {threadSubject}
          </span>
          <button onClick={onMisclick} className="p-1">
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm">{threadSubject}</h2>

          <div className="flex items-start gap-3">
            <div className={`h-9 w-9 flex-shrink-0 rounded-full ${threadAvatarBg} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{threadInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-sm text-gray-800">{threadFrom}</span>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{threadTime}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">to me</p>
              {isReassessment ? (
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  <p>Dear Patient,</p>
                  <p>
                    Your visit summary from your recent appointment is now available. Please
                    review your follow-up instructions and contact us if you have any questions.
                  </p>
                  <p>
                    Your next appointment has been scheduled. Please log in to MyChart for
                    full details.
                  </p>
                  <p>
                    Best regards,
                    <br />
                    OhioHealth Patient Services
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  <p>Dear Patient,</p>
                  <p>
                    We wanted to follow up regarding your recent lab results. Your most recent
                    Complete Blood Count looks good — please log in to MyChart to review the
                    full details.
                  </p>
                  <p>
                    Your upcoming appointment with Dr. Patel is scheduled for{' '}
                    <strong>July 18, 2025 at 2:30 PM</strong> at Ohio State Wexner Medical
                    Center. Please arrive 10 minutes early.
                  </p>
                  <p>
                    If you have any questions about your medications or results, don't hesitate
                    to reach out.
                  </p>
                  <p>
                    Best regards,
                    <br />
                    Dr. Patel's Office
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply bar */}
        <div className={cn('border-t px-4 py-3', showHint && 'bg-blue-50')}>
          <button
            onClick={handleReply}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium transition-colors',
              showHint
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50',
            )}
          >
            <Reply className="h-4 w-4" />
            Reply
          </button>
        </div>
      </div>
    );
  }

  /* ── Inbox view ── */
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Gmail header */}
      <div className="flex items-center gap-2 border-b bg-white px-3 py-2.5 shadow-sm">
        <button onClick={onMisclick} className="p-1">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
          <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-500">Search in mail</span>
        </div>
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">P</span>
        </div>
      </div>

      {/* Inbox label */}
      <div className="border-b px-4 py-2">
        <span className="text-sm font-semibold text-gray-700">Inbox</span>
        <span className="ml-2 text-xs text-gray-400">2</span>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto relative">
        {emailList.map(email => {
          const isTarget = email.id === targetEmailId;
          return (
            <button
              key={email.id}
              onClick={() => handleEmailTap(email.id)}
              className={cn(
                'flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-gray-50',
                isTarget && showHint && 'bg-blue-50 ring-2 ring-inset ring-blue-400',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center',
                  email.avatarBg,
                )}
              >
                <span className="text-xs font-bold text-white">{email.initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span
                    className={cn(
                      'truncate text-sm',
                      email.unread ? 'font-bold text-gray-900' : 'text-gray-600',
                    )}
                  >
                    {email.from}
                  </span>
                  <span
                    className={cn(
                      'ml-2 flex-shrink-0 text-xs',
                      email.unread ? 'font-semibold text-gray-800' : 'text-gray-500',
                    )}
                  >
                    {email.time}
                  </span>
                </div>
                <p
                  className={cn(
                    'truncate text-sm',
                    email.unread ? 'font-semibold text-gray-800' : 'text-gray-600',
                  )}
                >
                  {email.subject}
                </p>
                <p className="truncate text-xs text-gray-500">{email.preview}</p>
              </div>
              {email.unread && (
                <div className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}

        {/* Compose FAB */}
        <div
          className="sticky bottom-4 flex justify-start pl-4 pointer-events-none"
          style={{ marginTop: -8 }}
        >
          <button
            onClick={onMisclick}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: '#EA4335' }}
          >
            <Pencil className="h-4 w-4" />
            Compose
          </button>
        </div>
      </div>

      {simpleMode && (
        <div className="border-t bg-blue-50 px-3 py-2 text-center">
          <p className="text-xs text-blue-700">
            {isReassessment
              ? 'Tap the bold email from OhioHealth Patient Services to open it'
              : "Tap the bold email from Dr. Patel's Office to open it"}
          </p>
        </div>
      )}
    </div>
  );
};
