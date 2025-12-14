'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductColor } from '@/types';

interface ProductImageSliderProps {
  images: string[];
  productTitle: string;
  colors?: ProductColor[];
  selectedColorId?: string | null;
}

export function ProductImageSlider({ 
  images, 
  productTitle, 
  colors,
  selectedColorId 
}: ProductImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get images based on selected color
  const displayImages = selectedColorId && colors
    ? (() => {
        const selectedColor = colors.find(c => c.id === selectedColorId);
        if (selectedColor?.image) {
          // Show color image first, then other product images
          return [selectedColor.image, ...images.filter(img => img !== selectedColor.image)];
        }
        return images;
      })()
    : images;
  
  // Reset index when color changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedColorId]);

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src="/imgs/bike-(1).jpeg"
          alt={productTitle}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted group">
        <div className="relative w-full h-full">
          {displayImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-in-out",
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <Image
                src={image}
                alt={`${productTitle} - صورة ${index + 1}`}
                fill
                className="object-contain"
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="الصورة التالية"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md bg-muted border-2 transition-all",
                currentIndex === index
                  ? "border-primary scale-105"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <Image
                src={image}
                alt={`${productTitle} - معاينة ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
