'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import type { Product } from '@/types';

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    const variant = product.variants?.find((v) => v.id === selectedVariant);
    const price = variant
      ? product.price + (variant.price_modifier || 0)
      : product.price;
    const stock = variant ? variant.stock : product.stock;

    addItem({
      productId: product.id,
      sku: product.sku,
      title_ar: product.title_ar,
      price,
      image: product.images[0] || '/imgs/bike-(1).jpeg',
      variantId: variant?.id,
      variantName: variant?.name_ar,
      maxStock: stock,
    });
  };

  const isOutOfStock = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.stock === 0
    : product.stock === 0;

  return (
    <div className="space-y-4">
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

      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        size="lg"
        className="w-full"
      >
        <ShoppingCart className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
        {isOutOfStock ? 'نفدت الكمية' : 'أضف للسلة'}
      </Button>
    </div>
  );
}

