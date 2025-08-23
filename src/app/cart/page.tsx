'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCart, updateCartItemQuantity, removeFromCart, formatPrice, Cart, CartItem } from '@/lib/cart';
import CartIcon from '@/components/CartIcon';

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);

    const handleCartUpdate = (event: CustomEvent<Cart>) => {
      setCart(event.detail);
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateCartItemQuantity(itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    // This will navigate to checkout
    window.location.href = '/checkout';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gallery
          </Link>
          
          <div className="pointer-events-none">
            <CartIcon />
          </div>
        </div>
      </nav>

      {/* Cart Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-8 border-b border-slate-200">
            <h1 className="text-3xl font-light text-slate-800">Shopping Cart</h1>
          </div>

          {cart.items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl text-slate-600 mb-2">Your cart is empty</h2>
              <p className="text-slate-500 mb-6">Add some beautiful prints to get started.</p>
              <Link
                href="/"
                className="inline-flex items-center bg-slate-900 text-white px-6 py-3 rounded-md hover:bg-slate-800 transition-colors font-medium"
              >
                Browse Gallery
              </Link>
            </div>
          ) : (
            <>
              <div className="p-8 space-y-6">
                {cart.items.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-6 p-4 border border-slate-200 rounded-lg">
                    {/* Image */}
                    <div className="w-24 h-24 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 mb-1">{item.title}</h3>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>{item.size.name} - {item.size.dimensions}</p>
                        <p>{item.paper.name}</p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-medium text-slate-800">
                        {formatPrice(item.price * item.quantity * 100)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-sm text-slate-600">
                          {formatPrice(item.price * 100)} each
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-slate-200 p-8 bg-slate-50">
                <div className="max-w-md ml-auto">
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
                      <span>{formatPrice(cart.total * 100)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                    <div className="border-t border-slate-300 pt-3">
                      <div className="flex justify-between text-lg font-medium text-slate-800">
                        <span>Total</span>
                        <span>{formatPrice(cart.total * 100)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-6 bg-slate-900 text-white px-8 py-4 rounded-md hover:bg-slate-800 transition-colors font-medium text-lg"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <div className="mt-4 text-center">
                    <Link
                      href="/"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}