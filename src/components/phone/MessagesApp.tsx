import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Search, Edit, Send, Paperclip, Camera, Mic } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  avatar?: string;
}

const contacts: Contact[] = [
  { id: 'dr-smith', name: 'Dr. Smith', lastMessage: 'See you at 2pm tomorrow!', time: '10:30 AM', unread: true },
  { id: 'pharmacy', name: 'CVS Pharmacy', lastMessage: 'Your prescription is ready', time: 'Yesterday' },
  { id: 'family', name: 'Family Group', lastMessage: 'Mom: Don\'t forget dinner Sunday', time: 'Yesterday' },
  { id: 'bank', name: 'SafeBank Alerts', lastMessage: 'Your balance is $1,234.56', time: 'Mon' },
  { id: 'friend', name: 'John D.', lastMessage: 'How are you feeling today?', time: 'Mon' },
];

interface MessagesAppProps {
  onBack?: () => void;
  onContactSelect?: (contactId: string) => void;
  onSendMessage?: (message: string) => void;
  onMisclick?: () => void;
  targetContact?: string;
  simpleMode?: boolean;
  showHint?: boolean;
  currentStep?: 'list' | 'conversation' | 'compose';
}

export const MessagesApp: React.FC<MessagesAppProps> = ({
  onBack,
  onContactSelect,
  onSendMessage,
  onMisclick,
  targetContact = 'dr-smith',
  simpleMode = true,
  showHint = false,
  currentStep = 'list',
}) => {
  const [view, setView] = useState<'list' | 'conversation'>(currentStep === 'conversation' ? 'conversation' : 'list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    currentStep === 'conversation' ? contacts.find(c => c.id === targetContact) || null : null
  );
  const [messageText, setMessageText] = useState('');

  const handleContactTap = (contact: Contact) => {
    if (contact.id === targetContact) {
      setSelectedContact(contact);
      setView('conversation');
      onContactSelect?.(contact.id);
    } else {
      onMisclick?.();
    }
  };

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage?.(messageText);
      setMessageText('');
    }
  };

  const displayContacts = simpleMode ? contacts.slice(0, 4) : contacts;

  if (view === 'conversation' && selectedContact) {
    return (
      <div className="flex h-full flex-col bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-gray-50 px-4 py-3">
          <button 
            onClick={() => { setView('list'); onBack?.(); }}
            className="flex items-center text-blue-500 touch-target"
          >
            <ChevronLeft className="h-6 w-6" />
            <span className={simpleMode ? "text-base" : "text-sm"}>Back</span>
          </button>
          <div className="flex-1 text-center">
            <div className={cn("font-semibold text-gray-900", simpleMode ? "text-lg" : "text-base")}>
              {selectedContact.name}
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-gray-200 px-4 py-2">
              <p className={cn("text-gray-900", simpleMode ? "text-base" : "text-sm")}>
                Hello! Just confirming our appointment for tomorrow.
              </p>
              <span className="mt-1 block text-xs text-gray-500">10:28 AM</span>
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-gray-200 px-4 py-2">
              <p className={cn("text-gray-900", simpleMode ? "text-base" : "text-sm")}>
                See you at 2pm tomorrow!
              </p>
              <span className="mt-1 block text-xs text-gray-500">10:30 AM</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className={cn(
          "border-t bg-gray-50 p-3",
          simpleMode && showHint && "ring-2 ring-primary ring-inset animate-pulse"
        )}>
          <div className="flex items-center gap-2">
            {!simpleMode && (
              <>
                <button onClick={onMisclick} className="p-2 text-gray-500">
                  <Camera className="h-6 w-6" />
                </button>
                <button onClick={onMisclick} className="p-2 text-gray-500">
                  <Paperclip className="h-6 w-6" />
                </button>
              </>
            )}
            
            <div className="flex-1">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={simpleMode ? "Type: Confirming my appointment" : "Message"}
                className={cn(
                  "w-full rounded-full border bg-white px-4 py-3 outline-none focus:border-blue-500",
                  simpleMode ? "text-base" : "text-sm"
                )}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={!messageText.trim()}
              className={cn(
                "flex items-center justify-center rounded-full p-3 transition-colors touch-target",
                messageText.trim() 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 text-gray-400"
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {simpleMode && (
            <p className="mt-2 text-center text-sm text-gray-500">
              Type your message and tap the blue send button
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <button onClick={onMisclick} className="text-blue-500">
          <Edit className={cn(simpleMode ? "h-6 w-6" : "h-5 w-5")} />
        </button>
        <h1 className={cn("font-bold text-gray-900", simpleMode ? "text-xl" : "text-lg")}>
          Messages
        </h1>
        <button onClick={onMisclick} className="text-blue-500 touch-target">
          <Edit className={cn(simpleMode ? "h-6 w-6" : "h-5 w-5")} />
        </button>
      </div>

      {/* Search */}
      {!simpleMode && (
        <div className="border-b px-4 py-2">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search"
              className="flex-1 bg-transparent text-sm outline-none"
              onClick={onMisclick}
            />
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {displayContacts.map((contact) => {
          const isTarget = contact.id === targetContact;
          
          return (
            <button
              key={contact.id}
              id={`contact-${contact.id}`}
              onClick={() => handleContactTap(contact)}
              className={cn(
                "flex w-full items-center gap-3 border-b px-4 py-4 text-left transition-colors hover:bg-gray-50",
                isTarget && showHint && "bg-blue-50 ring-2 ring-primary ring-inset"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white",
                simpleMode ? "h-14 w-14 text-lg" : "h-12 w-12 text-base"
              )}>
                {contact.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "font-semibold text-gray-900",
                    simpleMode ? "text-lg" : "text-base",
                    contact.unread && "font-bold"
                  )}>
                    {contact.name}
                  </span>
                  <span className={cn(
                    "text-gray-500",
                    simpleMode ? "text-sm" : "text-xs"
                  )}>
                    {contact.time}
                  </span>
                </div>
                <p className={cn(
                  "truncate text-gray-500",
                  simpleMode ? "text-base" : "text-sm",
                  contact.unread && "font-medium text-gray-700"
                )}>
                  {contact.lastMessage}
                </p>
              </div>
              
              {contact.unread && (
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {simpleMode && (
        <div className="border-t bg-blue-50 p-3 text-center">
          <p className="text-sm text-blue-700">
            Tap on "Dr. Smith" to open the conversation
          </p>
        </div>
      )}
    </div>
  );
};
