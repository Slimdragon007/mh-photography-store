import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Payment successful!', {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        paymentStatus: session.payment_status,
      });

      // Here you would typically:
      // 1. Save order to database
      // 2. Send confirmation email to customer
      // 3. Notify fulfillment team
      // 4. Update inventory
      
      // For now, let's just log the successful payment
      if (session.payment_status === 'paid') {
        console.log('Order confirmed:', session.id);
        
        // You could add email sending here using a service like:
        // - SendGrid
        // - AWS SES
        // - Resend
        // - Nodemailer with SMTP
        
        // Example structure for order data:
        const orderData = {
          sessionId: session.id,
          customerEmail: session.customer_details?.email,
          customerName: session.customer_details?.name,
          amountTotal: session.amount_total,
          paymentStatus: session.payment_status,
          orderDate: new Date().toISOString(),
          // You could retrieve line items with:
          // const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        };
        
        console.log('Order data:', orderData);
      }
      
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}