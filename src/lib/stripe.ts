import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const config = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

// Helper function to create Stripe products for photos
export async function createStripeProduct(product: {
  name: string;
  description: string;
  images: string[];
  metadata?: Record<string, string>;
}) {
  try {
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      images: product.images,
      metadata: product.metadata || {},
    });
    return stripeProduct;
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    throw error;
  }
}

// Helper function to create price for a product variant
export async function createStripePrice(productId: string, priceData: {
  amount: number; // in cents
  currency: string;
  nickname?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: priceData.amount,
      currency: priceData.currency,
      nickname: priceData.nickname,
      metadata: priceData.metadata || {},
    });
    return price;
  } catch (error) {
    console.error('Error creating Stripe price:', error);
    throw error;
  }
}