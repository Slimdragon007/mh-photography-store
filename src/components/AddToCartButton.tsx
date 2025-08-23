'use client';

import { useState } from 'react';
import { addToCart } from '@/lib/cart';
import { PRINT_SIZES, PAPER_TYPES, PrintSize, PaperType, formatPrice, calculatePrice } from '@/lib/products';

interface AddToCartButtonProps {
  productId: string;
  title: string;
  imageUrl: string;
}

export default function AddToCartButton({ productId, title, imageUrl }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState<PrintSize>(PRINT_SIZES[1]); // Default to medium
  const [selectedPaper, setSelectedPaper] = useState<PaperType>(PAPER_TYPES[0]); // Default to standard
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const currentPrice = calculatePrice(selectedSize, selectedPaper);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      addToCart({
        productId,
        title,
        imageUrl,
        size: selectedSize,
        paper: selectedPaper,
        quantity,
      });
      
      // Show success feedback
      setShowOptions(false);
      // You could add a toast notification here
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You could add error handling here
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showOptions ? (
        <button
          onClick={() => setShowOptions(true)}
          className="w-full bg-slate-900 text-white px-8 py-3 rounded-md hover:bg-slate-800 transition-colors font-medium"
        >
          Purchase Print
        </button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Customize Your Print</h3>
          
          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Size</label>
            <div className="grid grid-cols-1 gap-3">
              {PRINT_SIZES.map((size) => (
                <label
                  key={size.id}
                  className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedSize.id === size.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="size"
                      value={size.id}
                      checked={selectedSize.id === size.id}
                      onChange={() => setSelectedSize(size)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-slate-800">
                        {size.name} - {size.dimensions}
                      </div>
                      <div className="text-sm text-slate-600">{size.description}</div>
                    </div>
                  </div>
                  <div className="text-slate-800 font-medium">
                    {formatPrice(calculatePrice(size, selectedPaper))}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Paper Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Paper Type</label>
            <div className="grid grid-cols-1 gap-3">
              {PAPER_TYPES.map((paper) => (
                <label
                  key={paper.id}
                  className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedPaper.id === paper.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paper"
                      value={paper.id}
                      checked={selectedPaper.id === paper.id}
                      onChange={() => setSelectedPaper(paper)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-slate-800">{paper.name}</div>
                      <div className="text-sm text-slate-600">{paper.description}</div>
                    </div>
                  </div>
                  <div className="text-slate-600 text-sm">
                    {paper.priceMultiplier === 1 ? 'Base price' : `+${Math.round((paper.priceMultiplier - 1) * 100)}%`}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Quantity</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full p-3 border border-slate-200 rounded-md focus:border-slate-900 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Price Display */}
          <div className="bg-slate-50 p-4 rounded-md">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Total:</span>
              <span>{formatPrice(currentPrice * quantity)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowOptions(false)}
              className="flex-1 border border-slate-300 text-slate-700 px-6 py-3 rounded-md hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-md hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}