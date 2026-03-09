import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Fingerprint, Eye, EyeOff, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownLeft, CreditCard, Send } from 'lucide-react';

type BankingView = 'login' | 'home' | 'transactions' | 'bill-pay' | 'security-alert';

interface BankingAppProps {
  onBack: () => void;
  onAction: (action: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  screen?: BankingView;
}

const transactions = [
  { id: 1, name: 'Grocery Mart', amount: -42.50, date: 'Today', type: 'debit' },
  { id: 2, name: 'Direct Deposit', amount: 2450.00, date: 'Yesterday', type: 'credit' },
  { id: 3, name: 'Netflix', amount: -15.99, date: 'Mar 5', type: 'debit' },
  { id: 4, name: 'Gas Station', amount: -38.00, date: 'Mar 4', type: 'debit' },
  { id: 5, name: 'Transfer from Savings', amount: 200.00, date: 'Mar 3', type: 'credit' },
  { id: 6, name: 'Electric Company', amount: -92.00, date: 'Mar 2', type: 'debit' },
];

export const BankingApp: React.FC<BankingAppProps> = ({
  onBack,
  onAction,
  onMisclick,
  simpleMode = true,
  showHint = false,
  screen,
}) => {
  const [internalView, setInternalView] = useState<BankingView>('login');
  const view = screen ?? internalView;
  const setView = (v: BankingView) => setInternalView(v);

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [billConfirmed, setBillConfirmed] = useState(false);

  const handlePinEntry = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          setView('home');
          onAction('authenticate');
        }, 300);
      }
    }
  };

  const handleBiometric = () => {
    setView('home');
    onAction('authenticate');
  };

  // Login / PIN screen
  if (view === 'login') {
    return (
      <div className="flex h-full flex-col bg-indigo-700 text-white">
        <div className="flex items-center gap-3 p-4">
          <button onClick={onBack}><ChevronLeft className="h-5 w-5" /></button>
          <span className="text-lg font-bold">SafeBank</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <CreditCard className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium">Enter your PIN</p>

          {/* PIN dots */}
          <div className="flex gap-3">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={cn(
                  "w-4 h-4 rounded-full border-2 border-white transition-all",
                  i < pin.length ? "bg-white" : "bg-transparent"
                )}
              />
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9','','0',''].map((d, i) => (
              d ? (
                <button
                  key={i}
                  onClick={() => handlePinEntry(d)}
                  className="w-14 h-14 rounded-full bg-white/20 text-xl font-bold hover:bg-white/30 transition-colors"
                >
                  {d}
                </button>
              ) : i === 11 ? (
                <button
                  key={i}
                  onClick={handleBiometric}
                  className={cn(
                    "w-14 h-14 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30",
                    showHint && "ring-2 ring-white animate-pulse"
                  )}
                >
                  <Fingerprint className="h-6 w-6" />
                </button>
              ) : <div key={i} />
            ))}
          </div>

          {showHint && (
            <p className="text-sm text-white/70">Use fingerprint or enter PIN: 1234</p>
          )}
        </div>
      </div>
    );
  }

  // Security Alert overlay
  if (view === 'security-alert') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-indigo-700 text-white">
          <button onClick={() => { setView('home'); onMisclick?.(); }}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">SafeBank</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-xl border-2 border-red-400 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h3 className="text-lg font-bold text-red-700">Security Alert</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Unusual transaction detected:
            </p>
            <div className="rounded-lg bg-red-50 p-3 mb-4">
              <p className="font-medium text-gray-900">$247.00 — Online Electronics Store</p>
              <p className="text-sm text-gray-500">March 8, 2026 • 2:34 AM</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">Was this you?</p>
            <div className="flex gap-3">
              <button
                onClick={() => { onAction('handle_alert'); }}
                className={cn(
                  "flex-1 rounded-lg bg-green-600 py-3 text-white font-medium hover:bg-green-700",
                  showHint && "ring-2 ring-green-400 animate-pulse"
                )}
              >
                Yes, it's me
              </button>
              <button
                onClick={() => { onAction('handle_alert'); }}
                className="flex-1 rounded-lg bg-red-600 py-3 text-white font-medium hover:bg-red-700"
              >
                Not me
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bill Pay
  if (view === 'bill-pay') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-indigo-700 text-white">
          <button onClick={() => setView('home')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Pay Bill</span>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {!billConfirmed ? (
            <>
              <div className="rounded-xl bg-white p-4 shadow-sm border">
                <label className="text-sm text-gray-500">Payee</label>
                <p className="font-medium text-gray-900">City Power Co.</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm border">
                <label className="text-sm text-gray-500">Amount</label>
                <input
                  type="text"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="$85.00"
                  className="w-full mt-1 text-2xl font-bold text-gray-900 outline-none"
                />
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm border">
                <label className="text-sm text-gray-500">From Account</label>
                <p className="font-medium text-gray-900">Checking ••4521</p>
              </div>
              <button
                onClick={() => {
                  setBillConfirmed(true);
                  onAction('pay_bill');
                }}
                className={cn(
                  "w-full rounded-xl bg-indigo-600 py-4 text-white font-bold text-lg hover:bg-indigo-700",
                  showHint && "ring-2 ring-indigo-400 animate-pulse"
                )}
              >
                <Send className="inline h-5 w-5 mr-2" />
                Pay $85.00
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Payment Sent!</h3>
              <p className="text-gray-500 mt-2">$85.00 to City Power Co.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Transactions list
  if (view === 'transactions') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-indigo-700 text-white">
          <button onClick={() => setView('home')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Transactions</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => onMisclick?.()}
              className="w-full flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border hover:bg-gray-50"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                tx.type === 'credit' ? "bg-green-100" : "bg-red-100"
              )}>
                {tx.type === 'credit' 
                  ? <ArrowDownLeft className="h-5 w-5 text-green-600" />
                  : <ArrowUpRight className="h-5 w-5 text-red-600" />
                }
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{tx.name}</p>
                <p className="text-sm text-gray-500">{tx.date}</p>
              </div>
              <span className={cn(
                "font-bold",
                tx.type === 'credit' ? "text-green-600" : "text-gray-900"
              )}>
                {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Home / Account overview
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-indigo-700 text-white p-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold text-lg">SafeBank</span>
          <div className="w-5" />
        </div>
        <p className="text-sm text-indigo-200">Welcome back</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-4 space-y-4 pb-4">
        {/* Checking Account */}
        <button
          onClick={() => {
            setView('transactions');
            onAction('view_balance');
          }}
          className={cn(
            "w-full rounded-xl bg-white p-5 shadow-md border text-left",
            showHint && "ring-2 ring-indigo-400 animate-pulse"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Checking Account</p>
              <p className="text-2xl font-bold text-gray-900">$3,247.82</p>
            </div>
            <div className="text-sm text-gray-400">••4521</div>
          </div>
        </button>

        {/* Savings Account */}
        {!simpleMode && (
          <button
            onClick={() => onMisclick?.()}
            className="w-full rounded-xl bg-white p-5 shadow-sm border text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Savings Account</p>
                <p className="text-2xl font-bold text-gray-900">$12,580.00</p>
              </div>
              <div className="text-sm text-gray-400">••7893</div>
            </div>
          </button>
        )}

        {/* Quick Actions */}
        <div className={cn("grid gap-3", simpleMode ? "grid-cols-2" : "grid-cols-3")}>
          <button
            onClick={() => {
              setView('bill-pay');
              // Don't score yet - scoring happens when they actually pay
            }}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm border",
              simpleMode && "p-5"
            )}
          >
            <Send className={cn("text-indigo-600", simpleMode ? "h-8 w-8" : "h-6 w-6")} />
            <span className={cn("font-medium text-gray-700", simpleMode ? "text-sm" : "text-xs")}>Pay Bill</span>
          </button>
          <button
            onClick={() => {
              setView('transactions');
              onAction('view_transactions');
            }}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm border",
              simpleMode && "p-5"
            )}
          >
            <ArrowUpRight className={cn("text-indigo-600", simpleMode ? "h-8 w-8" : "h-6 w-6")} />
            <span className={cn("font-medium text-gray-700", simpleMode ? "text-sm" : "text-xs")}>Transactions</span>
          </button>
          {!simpleMode && (
            <button
              onClick={() => onMisclick?.()}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm border"
            >
              <CreditCard className="h-6 w-6 text-indigo-600" />
              <span className="text-xs font-medium text-gray-700">Cards</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
