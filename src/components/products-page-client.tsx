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

      {/* Filters and Search */}
      <div className="space-y-4 p-4 bg-card rounded-lg border">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-auto rtl:left-3" />
          <Input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 rtl:pr-3 rtl:pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">الفئة</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
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
          <div>
            <label className="text-sm font-medium mb-2 block">ترتيب حسب</label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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

