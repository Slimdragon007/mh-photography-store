'use client';

import { useState, useEffect } from 'react';
import { getCart, Cart } from '@/lib/cart';

export default function CartIcon() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initial load
    setCart(getCart());
    setMounted(true);

    // Listen for cart updates
    const handleCartUpdate = (event: CustomEvent<Cart>) => {
      setCart(event.detail);
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative">
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg className="w-6 h-6 text-slate-600 hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {cart.itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {cart.itemCount}
        </span>
      )}
    </div>
  );
}