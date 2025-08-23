'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clearCart } from '@/lib/cart';

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get('session_id');
    if (session) {
      setSessionId(session);
      // Clear the cart after successful payment
      clearCart();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-light text-slate-800 mb-4">
            Order Successful!
          </h1>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            Thank you for your purchase! Your beautiful fine art print is being prepared 
            for shipment. You will receive an email confirmation shortly with your order details.
          </p>

          {sessionId && (
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-slate-600 mb-2">Order Reference:</p>
              <p className="text-xs font-mono text-slate-500 break-all">{sessionId}</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-medium text-slate-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Email confirmation sent to your inbox</li>
              <li>• Print production begins (1-2 business days)</li>
              <li>• Careful packaging and quality check</li>
              <li>• Shipping notification with tracking</li>
              <li>• Delivery in 5-7 business days</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-slate-900 text-white px-6 py-3 rounded-md hover:bg-slate-800 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
            
            <div className="text-sm text-slate-500">
              Questions? Contact us at orders@michaelhaslimphoto.com
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center text-slate-500 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment processed by Stripe
          </div>
        </div>
      </div>
    </div>
  );
}