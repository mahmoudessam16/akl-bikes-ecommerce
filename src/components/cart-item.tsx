'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import type { CartItem } from '@/types';

interface CartItemProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleIncrease = () => {
    if (item.quantity < item.maxStock) {
      updateQuantity(item.productId, item.quantity + 1, item.variantId);
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1, item.variantId);
    }
  };

  const handleRemove = () => {
    removeItem(item.productId, item.variantId);
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 p-4 border-b">
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.title_ar}
          fill
          className="object-cover rounded-md"
          sizes="96px"
        />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{item.title_ar}</h3>
            {item.variantName && (
              <p className="text-sm text-muted-foreground">{item.variantName}</p>
            )}
            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrease}
              disabled={item.quantity >= item.maxStock}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-right">
            <p className="font-semibold">{subtotal.toLocaleString('ar-EG')} جنيه مصري</p>
            <p className="text-sm text-muted-foreground">
              {item.price.toLocaleString('ar-EG')} جنيه مصري للواحدة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

