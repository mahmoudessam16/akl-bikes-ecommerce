'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cart-store';
import { CartItemComponent } from './cart-item';

export function CartClient() {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);

  const total = getTotal();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">سلة التسوق فارغة</p>
          <Link href="/ar">
            <Button>تسوق الآن</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <CartItemComponent key={`${item.productId}-${item.variantId || 'default'}`} item={item} />
        ))}
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span className="font-semibold">{total.toLocaleString('ar-EG')} جنيه مصري</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-4 border-t">
              <span>الإجمالي</span>
              <span>{total.toLocaleString('ar-EG')} جنيه مصري</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/ar/checkout" className="w-full">
              <Button className="w-full" size="lg">
                إتمام الطلب
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

