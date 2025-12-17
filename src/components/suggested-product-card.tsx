'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cart-store';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface SuggestedProductCardProps {
  product: Product;
}

export function SuggestedProductCard({ product }: SuggestedProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const locale = 'ar';

  const image = product.images[0] || '/imgs/bike-(1).jpeg';
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      sku: product.sku,
      title_ar: product.title_ar,
      price: product.price,
      image: image,
      maxStock: product.stock,
    });
  };

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="block h-full">
      <Card className="group overflow-hidden hover:shadow-md border hover:border-primary/30 cursor-pointer h-full flex flex-col bg-white">
        <div className="relative aspect-square w-full overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={image}
            alt={product.title_ar}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105 p-2"
            sizes="(max-width: 768px) 150px, 200px"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <span className="text-white text-xs font-semibold">نفدت الكمية</span>
            </div>
          )}
        </div>
        <CardContent className="p-2 sm:p-3 flex-1 flex flex-col">
          <h3 className="font-medium text-xs line-clamp-2 mb-1.5 min-h-[2rem] text-foreground">
            {product.title_ar}
          </h3>
          <div className="flex items-center justify-between mb-2 mt-auto">
            {product.stock > 0 && product.stock < 10 && (
              <span className="text-[10px] text-muted-foreground">
                متبقي {product.stock}
              </span>
            )}
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-bold text-primary">
                {product.price.toLocaleString('ar-EG')} ج.م
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[11px] text-muted-foreground">
                  <span className='font-bold text-primary'>بدلاً من </span>
                  <span className="line-through">
                    {product.oldPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant="outline"
            size="sm"
            className="w-full h-7 text-[10px] sm:text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingCart className="h-3 w-3 ml-1 rtl:ml-0 rtl:mr-1" />
            أضف للسلة
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

