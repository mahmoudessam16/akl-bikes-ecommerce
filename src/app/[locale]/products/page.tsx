import dynamic from 'next/dynamic';
import { getProducts, getCategories } from '@/lib/api/mock-data';

// Lazy load ProductsPageClient - heavy component with animations
const ProductsPageClient = dynamic(() => import('@/components/products-page-client').then(mod => ({ default: mod.ProductsPageClient })), {
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

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <ProductsPageClient 
        initialProducts={products}
        categories={categories}
      />
    </main>
  );
}

