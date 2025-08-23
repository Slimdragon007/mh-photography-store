'use client';

import { PrintSize, PaperType, calculatePrice } from './products';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  imageUrl: string;
  size: PrintSize;
  paper: PaperType;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const CART_STORAGE_KEY = 'mh-photography-cart';

// Get cart from localStorage
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const cart = JSON.parse(saved) as Cart;
      return cart;
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }

  return { items: [], total: 0, itemCount: 0 };
}

// Save cart to localStorage
export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

// Calculate cart totals
export function calculateCartTotals(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
}

// Add item to cart
export function addToCart(item: Omit<CartItem, 'id' | 'price'>): Cart {
  const cart = getCart();
  const price = calculatePrice(item.size, item.paper);
  const cartItemId = `${item.productId}-${item.size.id}-${item.paper.id}`;

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(cartItem => cartItem.id === cartItemId);

  if (existingItemIndex >= 0) {
    // Update quantity
    cart.items[existingItemIndex].quantity += item.quantity;
  } else {
    // Add new item
    cart.items.push({
      ...item,
      id: cartItemId,
      price,
    });
  }

  const totals = calculateCartTotals(cart.items);
  const updatedCart = { ...cart, ...totals };
  
  saveCart(updatedCart);
  return updatedCart;
}

// Remove item from cart
export function removeFromCart(itemId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.id !== itemId);
  
  const totals = calculateCartTotals(cart.items);
  const updatedCart = { ...cart, ...totals };
  
  saveCart(updatedCart);
  return updatedCart;
}

// Update item quantity
export function updateCartItemQuantity(itemId: string, quantity: number): Cart {
  const cart = getCart();
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  }
  
  const totals = calculateCartTotals(cart.items);
  const updatedCart = { ...cart, ...totals };
  
  saveCart(updatedCart);
  return updatedCart;
}

// Clear cart
export function clearCart(): Cart {
  const emptyCart = { items: [], total: 0, itemCount: 0 };
  saveCart(emptyCart);
  return emptyCart;
}

// Format price for display
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
}