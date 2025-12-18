import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import {
  getCategoryBySlug,
  getProductsByCategory,
} from '@/lib/api/mock-data';

// Lazy load CategoryPageClient
const CategoryPageClient = dynamic(() => import('@/components/category-page-client').then(mod => ({ default: mod.CategoryPageClient })), {
  loading: () => (
    <div className="space-y-6">
      <div className="h-12 bg-muted animate-pulse rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-96 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    </div>
  ),
  ssr: true,
});

// ISR: Revalidate every 5 minutes for better performance
export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page = '1', sort = 'popularity' } = await searchParams;
  const currentPage = parseInt(page, 10);

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { products, total, hasMore } = await getProductsByCategory(
    category.slug,
    currentPage,
    12,
    sort as 'popularity' | 'price_asc' | 'price_desc'
  );

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <CategoryPageClient
        category={category}
        products={products}
        total={total}
        hasMore={hasMore}
        currentPage={currentPage}
        currentSort={sort}
      />
    </main>
  );
}
