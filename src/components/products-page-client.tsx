'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search, X } from 'lucide-react';

// Lazy load framer-motion to reduce initial bundle size
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
);

const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false }
);
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductCard } from './product-card';
import type { Product, Category } from '@/types';

interface ProductsPageClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsPageClient({
  initialProducts,
  categories,
}: ProductsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price_asc' | 'price_desc'>('popularity');

  // Get all child categories for filter
  const allCategories = useMemo(() => {
    const childCategories: Category[] = [];
    categories.forEach((cat) => {
      if (cat.children) {
        childCategories.push(...cat.children);
      }
    });
    return childCategories;
  }, [categories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title_ar.toLowerCase().includes(query) ||
          product.title_en?.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.description_ar?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.primary_category === selectedCategory
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [initialProducts, searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('popularity');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'popularity';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">كل المنتجات</h1>
          <p className="text-muted-foreground">
            عرض {filteredProducts.length} منتج
          </p>
        </div>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="w-fit">
            <X className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Filters and Search - Compact Design */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-3 bg-card rounded-lg border">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-auto rtl:left-2" />
          <Input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 rtl:pr-2 rtl:pl-8 h-9 text-sm"
          />
        </div>

        {/* Filters - Flex Row */}
        <div className="flex gap-2 sm:gap-3">
          {/* Category Filter */}
          <div className="flex-1 sm:flex-initial sm:min-w-[140px]">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفئات</SelectItem>
                {categories.map((category) => (
                  <div key={category.id}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {category.name_ar}
                    </div>
                    {category.children?.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name_ar}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="flex-1 sm:flex-initial sm:min-w-[140px]">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="ترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">الأكثر شعبية</SelectItem>
                <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {filteredProducts.length > 0 ? (
          <MotionDiv
            key={`${searchQuery}-${selectedCategory}-${sortBy}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
          >
            {filteredProducts.map((product, index) => (
              <MotionDiv
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                className="h-full"
              >
                <ProductCard product={product} />
              </MotionDiv>
            ))}
          </MotionDiv>
        ) : (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-muted-foreground mb-4">
              لم يتم العثور على منتجات
            </p>
            <Button variant="outline" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

