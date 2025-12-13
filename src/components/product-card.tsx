'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cart-store';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const locale = 'ar'; // TODO: Get from context

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      sku: product.sku,
      title_ar: product.title_ar,
      price: product.price,
      image: product.images[0] || '/imgs/bike-(1).jpeg',
      maxStock: product.stock,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart first
    addItem({
      productId: product.id,
      sku: product.sku,
      title_ar: product.title_ar,
      price: product.price,
      image: product.images[0] || '/imgs/bike-(1).jpeg',
      maxStock: product.stock,
    });
    
    // Navigate to checkout
    router.push(`/${locale}/checkout`);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="block">
      <Card className="group overflow-hidden hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 border-2 border-transparent hover-card-scale cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Image
              src={product.images[0] || '/imgs/bike-(1).jpeg'}
              alt={product.title_ar}
              fill
              className="object-cover hover-image-zoom"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">نفدت الكمية</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title_ar}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(product.attributes)
              .slice(0, 2)
              .map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs bg-muted px-2 py-1 rounded"
                >
                  {String(value)}
                </span>
              ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {product.price.toLocaleString('ar-EG')} جنيه مصري
            </span>
            {product.stock > 0 && product.stock < 10 && (
              <span className="text-xs text-muted-foreground">
                متبقي {product.stock}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant="outline"
            className="flex-1 cursor-pointer !transition-all !duration-300 hover:!bg-primary hover:!text-primary-foreground hover:!border-primary hover:!shadow-md hover:!scale-105 active:!scale-100"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            أضف للسلة
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 cursor-pointer !transition-all !duration-300 hover:!bg-transparent hover:!text-primary hover:!border-2 hover:!border-primary hover:!shadow-md hover:!scale-105 active:!scale-100"
            size="sm"
          >
            <Zap className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            شراء الآن
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

