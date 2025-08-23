# Michael Haslim Photography - E-Commerce Store

A professional fine art photography e-commerce platform built with Next.js, featuring Stripe payments and Cloudflare R2 storage.

## 🌟 Features

- **Professional Gallery**: Responsive photo gallery with beautiful UI
- **E-Commerce Integration**: Complete shopping cart and checkout system
- **Stripe Payments**: Secure payment processing with Stripe
- **Print Customization**: Multiple sizes and paper types
- **Cloud Storage**: Images hosted on Cloudflare R2
- **Mobile Responsive**: Optimized for all devices
- **SEO Optimized**: Professional metadata and performance

## 🛍️ Product Options

### Print Sizes
- **Small (12" × 16")**: $85
- **Medium (16" × 20")**: $125  
- **Large (24" × 32")**: $195

### Paper Types
- **Fine Art Paper**: Premium matte finish (base price)
- **Metallic Print**: Vibrant colors with metallic sheen (+30%)
- **Gallery Canvas**: Museum-quality canvas with gallery wrap (+50%)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Stripe account
- Cloudflare R2 account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mh-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - Stripe keys (publishable, secret, webhook secret)
   - Cloudflare R2 credentials
   - Site URL

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mh-store/
├── src/
│   ├── app/                 # Next.js 13+ app router
│   │   ├── api/            # API routes
│   │   │   ├── checkout/   # Stripe checkout session
│   │   │   ├── webhook/    # Stripe webhook handler
│   │   │   └── r2/         # R2 storage API
│   │   ├── cart/           # Shopping cart page
│   │   ├── checkout/       # Checkout page
│   │   ├── photos/         # Individual photo pages
│   │   ├── success/        # Payment success page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable components
│   │   ├── AddToCartButton.tsx
│   │   └── CartIcon.tsx
│   └── lib/               # Utilities and configurations
│       ├── cart.ts        # Shopping cart logic
│       ├── products.ts    # Product definitions
│       ├── stripe.ts      # Stripe configuration
│       ├── r2.ts          # R2 storage client
│       └── r2-list.ts     # R2 listing functions
├── scripts/
│   └── sync_r2.ts         # Upload images to R2
├── gallery/               # Local images to upload
└── public/               # Static assets
```

## 🔧 Configuration

### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up webhook endpoints for order processing

### Cloudflare R2 Setup
1. Create a Cloudflare account
2. Set up R2 storage bucket
3. Generate API tokens for bucket access
4. Configure CORS for web access

### Image Upload
Upload your photos to the gallery:
```bash
# Copy images to gallery folder
cp /path/to/your/photos/* ./gallery/

# Sync to R2
npm run sync:r2
```

## 🌐 Deployment

### Recommended: Vercel
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Update Stripe webhook URL to your production domain

### Environment Variables for Production
- Update `SITE_URL` to your production domain
- Use production Stripe keys
- Set up production webhook endpoint

## 🔒 Security

- Environment variables are gitignored
- Stripe handles all payment processing
- Webhook signature verification
- HTTPS enforced in production

## 📧 Order Processing

Orders are processed via Stripe webhooks:
- Payment confirmation
- Order logging
- Email notifications (configure in webhook handler)
- Fulfillment workflow integration

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run sync:r2` - Upload images to R2

### Adding New Photos
1. Add images to the `gallery/` folder
2. Run `npm run sync:r2` to upload to R2
3. Images will automatically appear in the gallery

## 📦 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **Storage**: Cloudflare R2
- **Deployment**: Vercel (recommended)

## 📝 License

This project is for Michael Haslim Photography. All rights reserved.

## 🤝 Support

For technical support or customization requests, please contact the development team.

---

Built with ❤️ for fine art photography