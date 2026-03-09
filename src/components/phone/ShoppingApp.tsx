import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Search, ShoppingCart, Plus, Minus, CheckCircle2, Package, Star, Truck } from 'lucide-react';

type ShoppingView = 'home' | 'search-results' | 'cart' | 'checkout' | 'order-status';

interface ShoppingAppProps {
  onBack: () => void;
  onAction: (action: string) => void;
  onMisclick?: () => void;
  simpleMode?: boolean;
  showHint?: boolean;
  screen?: ShoppingView;
}

const searchResults = [
  { id: 1, name: 'Digital Blood Pressure Monitor', price: 34.99, rating: 4.5, reviews: 2341 },
  { id: 2, name: 'Automatic Wrist BP Monitor', price: 24.99, rating: 4.2, reviews: 1876 },
  { id: 3, name: 'Premium Upper Arm Monitor', price: 59.99, rating: 4.8, reviews: 982 },
];

export const ShoppingApp: React.FC<ShoppingAppProps> = ({
  onBack,
  onAction,
  onMisclick,
  simpleMode = true,
  showHint = false,
  screen,
}) => {
  const [internalView, setInternalView] = useState<ShoppingView>('home');
  const view = screen ?? internalView;
  const setView = (v: ShoppingView) => setInternalView(v);

  const [searchQuery, setSearchQuery] = useState('');
  const [cartItem, setCartItem] = useState<typeof searchResults[0] | null>(null);

  // Order status
  if (view === 'order-status') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-orange-500 text-white">
          <button onClick={() => setView('home')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Order Status</span>
        </div>
        <div className="flex-1 p-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-bold text-gray-900">Order Confirmed</h3>
                <p className="text-sm text-gray-500">Order #QS-28491</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {/* Progress steps */}
              {[
                { label: 'Order Placed', done: true, icon: Package },
                { label: 'Processing', done: true, icon: CheckCircle2 },
                { label: 'Shipped', done: false, icon: Truck },
                { label: 'Delivered', done: false, icon: CheckCircle2 },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    step.done ? "bg-green-100" : "bg-gray-100"
                  )}>
                    <step.icon className={cn("h-4 w-4", step.done ? "text-green-600" : "text-gray-400")} />
                  </div>
                  <span className={cn("text-sm", step.done ? "text-gray-900 font-medium" : "text-gray-400")}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-orange-50 p-3">
              <p className="text-sm text-orange-700">
                <span className="font-medium">Estimated delivery:</span> March 12-14
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout
  if (view === 'checkout') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-orange-500 text-white">
          <button onClick={() => setView('cart')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Checkout</span>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border">
            <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
            <p className="text-sm text-gray-600">123 Main Street</p>
            <p className="text-sm text-gray-600">Apt 4B</p>
            <p className="text-sm text-gray-600">Springfield, IL 62704</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border">
            <h4 className="font-medium text-gray-900 mb-2">Payment</h4>
            <p className="text-sm text-gray-600">Visa ending in ••4521</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${cartItem?.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between font-bold mt-3 pt-3 border-t">
              <span>Total</span>
              <span>${cartItem?.price.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setView('order-status');
              onAction('confirm_checkout');
            }}
            className={cn(
              "w-full rounded-xl bg-orange-500 py-4 text-white font-bold text-lg hover:bg-orange-600",
              showHint && "ring-2 ring-orange-400 animate-pulse"
            )}
          >
            Confirm & Place Order
          </button>
        </div>
      </div>
    );
  }

  // Cart
  if (view === 'cart') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-orange-500 text-white">
          <button onClick={() => setView('search-results')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Your Cart</span>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {cartItem ? (
            <>
              <div className="rounded-xl bg-white p-4 shadow-sm border flex gap-3">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{cartItem.name}</p>
                  <p className="text-lg font-bold text-orange-600">${cartItem.price.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="w-8 h-8 rounded-full border flex items-center justify-center">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-medium">1</span>
                    <button className="w-8 h-8 rounded-full border flex items-center justify-center">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setView('checkout');
                }}
                className={cn(
                  "w-full rounded-xl bg-orange-500 py-4 text-white font-bold text-lg hover:bg-orange-600",
                  showHint && "ring-2 ring-orange-400 animate-pulse"
                )}
              >
                Proceed to Checkout
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Search results
  if (view === 'search-results') {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-orange-500 text-white">
          <button onClick={() => setView('home')}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold">Results</span>
        </div>
        <div className="p-3">
          <div className="rounded-lg bg-white border px-3 py-2 text-sm text-gray-500">
            "blood pressure monitor"
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {searchResults.map((item, i) => (
            <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm border">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-500">{item.rating} ({item.reviews})</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCartItem(item);
                  setView('cart');
                  if (i === 0) onAction('add_item');
                  else onMisclick?.();
                }}
                className={cn(
                  "mt-3 w-full rounded-lg bg-orange-500 py-2.5 text-white font-medium text-sm hover:bg-orange-600",
                  i === 0 && showHint && "ring-2 ring-orange-400 animate-pulse"
                )}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Home
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-orange-500 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-bold text-lg">QuickShop</span>
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div
          onClick={() => {
            setView('search-results');
            onAction('search');
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-white px-4 py-3 cursor-pointer",
            showHint && "ring-2 ring-orange-300 animate-pulse"
          )}
        >
          <Search className="h-5 w-5 text-gray-400" />
          <span className="text-gray-400">Search "blood pressure monitor"</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <h3 className="font-bold text-gray-900">Categories</h3>
        <div className={cn("grid gap-3", simpleMode ? "grid-cols-2" : "grid-cols-3")}>
          {['Health', 'Electronics', 'Groceries', 'Home'].map(cat => (
            <button
              key={cat}
              onClick={() => onMisclick?.()}
              className={cn(
                "rounded-xl bg-white p-4 shadow-sm border text-center",
                simpleMode && "p-5"
              )}
            >
              <span className={cn("font-medium text-gray-700", simpleMode ? "text-sm" : "text-xs")}>{cat}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
