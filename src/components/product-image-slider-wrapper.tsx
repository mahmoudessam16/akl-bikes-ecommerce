'use client';

import { useState, useEffect } from 'react';
import { ProductImageSlider } from './product-image-slider';
import type { Product } from '@/types';

interface ProductImageSliderWrapperProps {
  product: Product;
}

export function ProductImageSliderWrapper({ product }: ProductImageSliderWrapperProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  // Auto-select first available color
  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      const firstAvailable = product.colors.find(c => c.available && c.stock > 0);
      if (firstAvailable) {
        setSelectedColorId(firstAvailable.id);
      }
    }
  }, [product.colors]);

  // Listen for color changes from ProductDetailsClient
  useEffect(() => {
    const handleColorChange = (e: CustomEvent<string | null>) => {
      setSelectedColorId(e.detail);
    };

    window.addEventListener('productColorChange' as any, handleColorChange as EventListener);
    return () => {
      window.removeEventListener('productColorChange' as any, handleColorChange as EventListener);
    };
  }, []);

  return (
    <div className="lg:sticky lg:top-8 h-fit">
      <ProductImageSlider
        images={product.images.length > 0 ? product.images : ['/imgs/bike-(1).jpeg']}
        productTitle={product.title_ar}
        colors={product.colors}
        selectedColorId={selectedColorId}
      />
    </div>
  );
}
