'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuggestedProductCard } from './suggested-product-card';
import type { Product } from '@/types';

interface SuggestedProductsProps {
  currentProductId: string;
  currentCategoryId?: string;
}

export function SuggestedProducts({ currentProductId, currentCategoryId }: SuggestedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSuggestedProducts() {
      try {
        setLoading(true);
        // Fetch all products
        const response = await fetch('/api/products');
        if (response.ok) {
          const allProducts: Product[] = await response.json();
          
          // Filter out current product
          let filtered = allProducts.filter(p => p.id !== currentProductId);
          
          // If we have a category, prioritize products from the same category
          if (currentCategoryId) {
            const sameCategory = filtered.filter(p => p.primary_category === currentCategoryId);
            const otherProducts = filtered.filter(p => p.primary_category !== currentCategoryId);
            
            // Take up to 12 from same category, then fill with others
            const suggested = [
              ...sameCategory.slice(0, 12),
              ...otherProducts.slice(0, Math.max(0, 12 - sameCategory.length))
            ];
            
            setProducts(suggested.slice(0, 12));
          } else {
            // Just take first 12 products excluding current
            setProducts(filtered.slice(0, 12));
          }
        }
      } catch (error) {
        console.error('Failed to fetch suggested products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestedProducts();
  }, [currentProductId, currentCategoryId]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4">منتجات مقترحة</h2>
        <div className="relative">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 hide-scrollbar">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="min-w-[140px] sm:min-w-[180px] h-[240px] sm:h-[280px] bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4">منتجات مقترحة</h2>
      <div className="relative group">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
          aria-label="السابق"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 hide-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[140px] sm:min-w-[180px] flex-shrink-0"
            >
              <SuggestedProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
          aria-label="التالي"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

