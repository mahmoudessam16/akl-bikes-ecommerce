import dynamic from 'next/dynamic';
import { getProducts, getCategories } from '@/lib/api/mock-data';

// Lazy load HomeClient - contains heavy ProductCarousel
const HomeClient = dynamic(() => import('@/components/home-client').then(mod => ({ default: mod.HomeClient })), {
  loading: () => (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 bg-background border-b"></div>
      <main className="flex-1">
        <div className="h-[60vh] bg-muted animate-pulse"></div>
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="h-8 bg-muted animate-pulse rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <div className="h-32 bg-muted"></div>
    </div>
  ),
  ssr: true, // Keep SSR for SEO
});

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();
  const featuredProducts = products.slice(0, 8);
  const featuredCategories = categories.slice(0, 6);

  return <HomeClient featuredProducts={featuredProducts} featuredCategories={featuredCategories} />;
}
