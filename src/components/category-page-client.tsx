'use client';

import { useRouter } from 'next/navigation';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, Product } from '@/types';

interface CategoryPageClientProps {
  category: Category;
  products: Product[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  currentSort: string;
}

export function CategoryPageClient({
  category,
  products,
  total,
  hasMore,
  currentPage,
  currentSort,
}: CategoryPageClientProps) {
  const router = useRouter();

  const handleSortChange = (value: string) => {
    router.push(`?page=1&sort=${value}`);
  };

  return (
    <>
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name_ar}</h1>
        {category.description_ar && (
          <p className="text-muted-foreground">{category.description_ar}</p>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">
          عرض {products.length} من {total} منتج
        </p>
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">الأكثر شعبية</SelectItem>
            <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
            <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-8">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {currentPage > 1 && (
          <Button
            variant="outline"
            onClick={() => router.push(`?page=${currentPage - 1}&sort=${currentSort}`)}
          >
            السابق
          </Button>
        )}
        {hasMore && (
          <Button
            variant="outline"
            onClick={() => router.push(`?page=${currentPage + 1}&sort=${currentSort}`)}
          >
            التالي
          </Button>
        )}
      </div>
    </>
  );
}

