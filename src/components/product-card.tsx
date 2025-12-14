'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cart-store';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const locale = 'ar'; // TODO: Get from context

  const images = product.images.length > 0 ? product.images : ['/imgs/bike-(1).jpeg'];
  const hasMultipleImages = images.length > 1;

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

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
          <div className="relative aspect-square w-full overflow-hidden bg-muted group">
            <div className="relative w-full h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.title_ar} - صورة ${index + 1}`}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
            
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  aria-label="الصورة السابقة"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  aria-label="الصورة التالية"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
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

