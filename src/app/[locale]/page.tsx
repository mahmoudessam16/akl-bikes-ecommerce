import dynamicImport from 'next/dynamic';
import { getProducts, getCategories } from '@/lib/api/mock-data';

// Lazy load HomeClient - contains heavy ProductCarousel
const HomeClient = dynamicImport(() => import('@/components/home-client').then(mod => ({ default: mod.HomeClient })), {
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

// Force dynamic rendering to avoid build-time timeouts on Vercel
// This prevents static generation which can timeout when connecting to MongoDB
export const dynamic = 'force-dynamic';
export const revalidate = 300; // ISR: Revalidate every 5 minutes

export default async function Home() {
  // Fetch only what we need - much faster!
  // Use lightweight mode to reduce cache size and avoid 2MB limit
  // Add timeout handling for build time
  let products: any[] = [];
  let categories: any[] = [];

  try {
    // Add timeout wrapper for build time
    const fetchPromise = Promise.all([
      getProducts(8, true), // Only fetch 8 products for homepage with lightweight mode
      getCategories(), // Categories are cached and small
    ]);

    // 20 second timeout for data fetching during build
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Data fetch timeout')), 20000);
    });

    [products, categories] = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]).catch(() => {
      // Return empty arrays if timeout or error occurs during build
      return [[], []];
    });
  } catch (error) {
    // Gracefully handle errors during build - return empty arrays
    console.error('Error fetching data:', error);
    products = [];
    categories = [];
  }
  
  const featuredProducts = products.slice(0, 8);
  const featuredCategories = categories.slice(0, 6);

  return <HomeClient featuredProducts={featuredProducts} featuredCategories={featuredCategories} />;
}
