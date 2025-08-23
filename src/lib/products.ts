export interface PrintSize {
  id: string;
  name: string;
  dimensions: string;
  price: number;
  description: string;
}

export interface PaperType {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
}

export interface Product {
  id: string;
  title: string;
  imageKey: string;
  imageUrl: string;
  description: string;
  category: string;
  available: boolean;
}

export const PRINT_SIZES: PrintSize[] = [
  {
    id: 'small',
    name: 'Small',
    dimensions: '12" × 16"',
    price: 85,
    description: 'Perfect for smaller spaces and galleries'
  },
  {
    id: 'medium',
    name: 'Medium',
    dimensions: '16" × 20"',
    price: 125,
    description: 'Most popular size for home and office'
  },
  {
    id: 'large',
    name: 'Large',
    dimensions: '24" × 32"',
    price: 195,
    description: 'Statement piece for larger walls'
  }
];

export const PAPER_TYPES: PaperType[] = [
  {
    id: 'standard',
    name: 'Fine Art Paper',
    description: 'Premium matte finish on archival paper',
    priceMultiplier: 1.0
  },
  {
    id: 'metallic',
    name: 'Metallic Print',
    description: 'Vibrant colors with metallic sheen',
    priceMultiplier: 1.3
  },
  {
    id: 'canvas',
    name: 'Gallery Canvas',
    description: 'Museum-quality canvas with gallery wrap',
    priceMultiplier: 1.5
  }
];

export function calculatePrice(size: PrintSize, paper: PaperType): number {
  return Math.round(size.price * paper.priceMultiplier);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}