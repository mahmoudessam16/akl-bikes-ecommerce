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
    <Link href={`/${locale}/product/${product.slug}`} className="block h-full">
      <Card className="group overflow-hidden hover:shadow-md hover:border-primary/30 border cursor-pointer h-full flex flex-col bg-white pb-1 sm:pb-0">
        <CardHeader className="p-0 flex-shrink-0">
          <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-t-lg group bg-white">
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
                    className="object-cover transition-transform duration-300 group-hover:scale-105 p-0.5 sm:p-2"
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
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-8 sm:w-8"
                  aria-label="الصورة السابقة"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextImage}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-8 sm:w-8"
                  aria-label="الصورة التالية"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded-t-lg">
                <span className="text-white text-xs sm:text-sm font-semibold">نفدت الكمية</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 md:p-3 flex-1 flex flex-col">
          <h3 className="font-medium text-[11px] line-clamp-2 mb-1 min-h-[1.75rem] text-foreground px-2 sm:px-0">{product.title_ar}</h3>
          <div className="flex items-center justify-between mb-1 mt-auto gap-1 px-2 sm:px-0">
            {/* Left side - Stock and first attribute */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              {product.stock > 0 && product.stock < 10 && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  متبقي {product.stock}
                </span>
              )}
              {Object.entries(product.attributes).length > 0 && (
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded truncate">
                  {String(Object.entries(product.attributes)[0][1])}
                </span>
              )}
            </div>
            {/* Right side - Price */}
            <div className="flex flex-col items-end gap-0.5 flex-1 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                {product.price.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-0 sm:p-3 pt-0 flex gap-1.5 flex-shrink-0 flex-col px-2">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant="outline"
            className="w-full cursor-pointer !transition-all !duration-300 hover:!bg-primary hover:!text-primary-foreground hover:!border-primary hover:!shadow-md text-[10px] sm:text-xs h-7 sm:h-8"
            size="sm"
          >
            <ShoppingCart className="h-3 w-3 ml-1 rtl:ml-0 rtl:mr-1" />
            <span className="hidden sm:inline">أضف للسلة</span>
            <span className="sm:hidden">السلة</span>
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="w-full cursor-pointer !transition-all !duration-300 hover:!bg-transparent hover:!text-primary hover:!border-2 hover:!border-primary hover:!shadow-md text-[10px] sm:text-xs h-7 sm:h-8"
            size="sm"
          >
            <Zap className="h-3 w-3 ml-1 rtl:ml-0 rtl:mr-1" />
            <span className="hidden sm:inline">شراء الآن</span>
            <span className="sm:hidden">شراء</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

