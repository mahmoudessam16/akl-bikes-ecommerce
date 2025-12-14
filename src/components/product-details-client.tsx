'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import type { Product } from '@/types';

// Lazy load ProductColorSelector - not critical for initial render
const ProductColorSelector = dynamic(() => import('@/components/product-color-selector').then(mod => ({ default: mod.ProductColorSelector })), {
  ssr: false,
});

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Auto-select first available color
  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      const firstAvailable = product.colors.find(c => c.available && c.stock > 0);
      if (firstAvailable) {
        setSelectedColorId(firstAvailable.id);
      }
    }
  }, [product.colors]);

  // Notify image slider when color changes
  useEffect(() => {
    const event = new CustomEvent('productColorChange', { detail: selectedColorId });
    window.dispatchEvent(event);
  }, [selectedColorId]);

  const handleAddToCart = () => {
    const variant = product.variants?.find((v) => v.id === selectedVariant);
    const selectedColor = product.colors?.find((c) => c.id === selectedColorId);
    const price = variant
      ? product.price + (variant.price_modifier || 0)
      : product.price;
    const stock = variant 
      ? variant.stock 
      : selectedColor 
        ? selectedColor.stock 
        : product.stock;

    // Use color image if available, otherwise use first product image
    const image = selectedColor?.image || product.images[0] || '/imgs/bike-(1).jpeg';

    addItem({
      productId: product.id,
      sku: product.sku,
      title_ar: product.title_ar,
      price,
      image,
      variantId: variant?.id,
      variantName: variant?.name_ar,
      maxStock: stock,
    });
  };

  const handleBuyNow = () => {
    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    router.push('/ar/checkout');
  };

  const selectedColor = product.colors?.find((c) => c.id === selectedColorId);
  const isOutOfStock = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.stock === 0
    : selectedColor
      ? selectedColor.stock === 0 || !selectedColor.available
      : product.stock === 0;

  return (
    <div className="space-y-6">
      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <Suspense fallback={
          <div className="space-y-3 p-4 border rounded-lg bg-card">
            <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-24 h-24 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          </div>
        }>
          <ProductColorSelector
            colors={product.colors}
            selectedColorId={selectedColorId}
            onColorSelect={setSelectedColorId}
          />
        </Suspense>
      )}

      {/* Variant Selector */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">اختر المتغير</label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <Button
                key={variant.id}
                variant={selectedVariant === variant.id ? 'default' : 'outline'}
                onClick={() => setSelectedVariant(variant.id)}
                disabled={variant.stock === 0}
              >
                {variant.name_ar}
                {variant.price_modifier && variant.price_modifier !== 0 && (
                  <span className="mr-2">
                    ({variant.price_modifier > 0 ? '+' : ''}
                    {variant.price_modifier.toLocaleString('ar-EG')} جنيه مصري)
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant="outline"
          size="lg"
          className="flex-1 cursor-pointer !transition-all !duration-300 hover:!bg-primary hover:!text-primary-foreground hover:!border-primary hover:!shadow-md hover:!scale-105 active:!scale-100" 
        >
          <ShoppingCart className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
          {isOutOfStock ? 'نفدت الكمية' : 'أضف للسلة'}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          size="lg"
          className="flex-1 cursor-pointer !transition-all !duration-300 hover:!bg-transparent hover:!text-primary hover:!border-2 hover:!border-primary hover:!shadow-md hover:!scale-105 active:!scale-100"
        >
          <Zap className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
          شراء الآن
        </Button>
      </div>
      
      {/* Stock Info */}
      {selectedColor && (
        <div className="text-sm">
          {selectedColor.stock > 0 ? (
            <p className="text-green-600 font-medium">
              متوفر ({selectedColor.stock} قطعة متبقية)
            </p>
          ) : (
            <p className="text-red-600 font-medium">نفدت الكمية</p>
          )}
        </div>
      )}
    </div>
  );
}

