import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, MapPin, Navigation, Car, Clock, Phone, MessageSquare, Star, User } from 'lucide-react';

type TransportView = 'home' | 'destination' | 'route' | 'ride-request' | 'ride-tracking';

interface TransportAppProps {
  onBack: () => void;
  onAction: (action: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  screen?: TransportView;
}

export const TransportApp: React.FC<TransportAppProps> = ({
  onBack,
  onAction,
  onMisclick,
  simpleMode = true,
  showHint = false,
  screen,
}) => {
  const [internalView, setInternalView] = useState<TransportView>('home');
  const view = screen ?? internalView;
  const setView = (v: TransportView) => setInternalView(v);

  // Ride tracking
  if (view === 'ride-tracking') {
    return (
      <div className="flex h-full flex-col bg-gray-100">
        {/* Map area */}
        <div className="relative h-1/2 bg-emerald-100">
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-48 h-48 border-2 border-emerald-400 rounded-full" />
            <div className="absolute w-32 h-32 border border-emerald-300 rounded-full" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Car className="h-8 w-8 text-emerald-700" />
          </div>
          <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 bg-white rounded-t-3xl -mt-4 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Michael R.</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-500">4.9 • White Toyota Camry</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Arriving in 4 minutes</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onAction('track_ride')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-white font-medium hover:bg-emerald-700",
                showHint && "ring-2 ring-emerald-400 animate-pulse"
              )}
            >
              <Phone className="h-5 w-5" />
              Call Driver
            </button>
            <button
              onClick={() => onAction('track_ride')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 py-3 text-emerald-600 font-medium"
            >
              <MessageSquare className="h-5 w-5" />
              Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ride request
  if (view === 'ride-request') {
    return (
      <div className="flex h-full flex-col bg-gray-100">
        <div className="relative h-2/5 bg-emerald-100">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-1 bg-emerald-500 rotate-12" />
          </div>
          <button onClick={() => setView('route')} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 bg-white rounded-t-3xl -mt-4 p-5 space-y-3">
          <h3 className="font-bold text-gray-900">Choose a ride</h3>
          {[
            { type: 'Standard', time: '5 min', price: '$12.50' },
            { type: 'Comfort', time: '3 min', price: '$18.00' },
            ...(!simpleMode ? [{ type: 'XL', time: '8 min', price: '$22.00' }] : []),
          ].map((ride, i) => (
            <button
              key={ride.type}
              onClick={() => {
                setView('ride-tracking');
                if (i === 0) onAction('request_ride');
                else onMisclick?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border p-4 hover:bg-gray-50",
                i === 0 && showHint && "ring-2 ring-emerald-400 animate-pulse"
              )}
            >
              <Car className={cn("text-emerald-600", simpleMode ? "h-8 w-8" : "h-6 w-6")} />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{ride.type}</p>
                <p className="text-sm text-gray-500">{ride.time} away</p>
              </div>
              <span className="font-bold text-gray-900">{ride.price}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Route options
  if (view === 'route') {
    return (
      <div className="flex h-full flex-col bg-gray-100">
        <div className="relative h-2/5 bg-emerald-100">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-0.5 bg-emerald-600 rotate-6" />
          </div>
          <button onClick={() => setView('destination')} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 bg-white rounded-t-3xl -mt-4 p-5 space-y-3">
          <h3 className="font-bold text-gray-900">Route to City Hospital</h3>
          {[
            { mode: 'Drive', icon: Car, time: '15 min', dist: '4.2 mi' },
            { mode: 'Ride-share', icon: Car, time: '12 min', dist: '4.2 mi', isRide: true },
          ].map((route, i) => (
            <button
              key={route.mode}
              onClick={() => {
                if (route.isRide) {
                  setView('ride-request');
                } else {
                  onAction('select_route');
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border p-4 hover:bg-gray-50",
                i === 0 && showHint && "ring-2 ring-emerald-400 animate-pulse"
              )}
            >
              <route.icon className={cn("text-emerald-600", simpleMode ? "h-8 w-8" : "h-6 w-6")} />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{route.mode}</p>
                <p className="text-sm text-gray-500">{route.dist}</p>
              </div>
              <span className="font-bold text-emerald-700">{route.time}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Destination entry
  if (view === 'destination') {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setView('home')}><ChevronLeft className="h-5 w-5" /></button>
            <span className="font-bold text-lg">Where to?</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-500">Current Location</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border-2 border-emerald-500 px-3 py-3 cursor-pointer",
                showHint && "ring-2 ring-emerald-400 animate-pulse"
              )}
              onClick={() => {
                setView('route');
                onAction('enter_destination');
              }}
            >
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-900">City Hospital</span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Recent</h4>
          {['City Hospital', 'Grocery Mart', 'Downtown Library'].map(place => (
            <button
              key={place}
              onClick={() => {
                if (place === 'City Hospital') {
                  setView('route');
                  onAction('enter_destination');
                } else {
                  onMisclick?.();
                }
              }}
              className="w-full flex items-center gap-3 py-3 border-b hover:bg-gray-50"
            >
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{place}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Home / Map view
  return (
    <div className="flex h-full flex-col bg-emerald-100">
      {/* Simulated map */}
      <div className="relative flex-1">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="grid grid-cols-4 gap-4 w-full h-full p-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-emerald-300 rounded" />
            ))}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Navigation className="h-8 w-8 text-blue-600" />
        </div>
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="bg-white rounded-t-3xl p-5 shadow-lg">
        <button
          onClick={() => {
            setView('destination');
          }}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-4 mb-4",
            showHint && "ring-2 ring-emerald-400 animate-pulse"
          )}
        >
          <MapPin className={cn("text-emerald-600", simpleMode ? "h-6 w-6" : "h-5 w-5")} />
          <span className={cn("text-gray-500", simpleMode ? "text-base" : "text-sm")}>Where are you going?</span>
        </button>

        {!simpleMode && (
          <div className="flex gap-3">
            {['Home', 'Work', 'Hospital'].map(fav => (
              <button key={fav} onClick={() => onMisclick?.()} className="flex-1 rounded-lg bg-gray-100 py-2 text-xs text-gray-600">
                {fav}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
