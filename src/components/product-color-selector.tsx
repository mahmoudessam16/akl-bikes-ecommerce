'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProductColor } from '@/types';

interface ProductColorSelectorProps {
  colors: ProductColor[];
  selectedColorId: string | null;
  onColorSelect: (colorId: string) => void;
}

export function ProductColorSelector({
  colors,
  selectedColorId,
  onColorSelect,
}: ProductColorSelectorProps) {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
      <label className="block text-base font-semibold mb-3">اختر اللون</label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selectedColorId === color.id;
          const isDisabled = !color.available || color.stock === 0;
          
          return (
            <button
              key={color.id}
              onClick={() => !isDisabled && onColorSelect(color.id)}
              disabled={isDisabled}
              className={cn(
                "relative group flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 min-w-[100px]",
                isSelected
                  ? "border-primary bg-primary/10 scale-105 shadow-lg ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                isDisabled && "opacity-50 cursor-not-allowed grayscale"
              )}
              title={isDisabled ? 'غير متوفر' : color.name_ar}
            >
              <div className={cn(
                "relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all",
                isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
              )}>
                <Image
                  src={color.image}
                  alt={color.name_ar}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {isDisabled && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">غير متوفر</span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span className={cn(
                "text-sm font-medium text-center",
                isSelected && "text-primary font-semibold"
              )}>
                {color.name_ar}
              </span>
              {color.stock > 0 && color.stock < 10 && (
                <span className="text-xs text-muted-foreground font-medium">
                  متبقي {color.stock}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
