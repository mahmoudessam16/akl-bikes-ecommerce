import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug } from '@/lib/api/mock-data';

// Lazy load heavy client components
const ProductImageSliderWrapper = dynamic(() => import('@/components/product-image-slider-wrapper').then(mod => ({ default: mod.ProductImageSliderWrapper })), {
  loading: () => <div className="h-[500px] bg-muted animate-pulse rounded-lg"></div>,
  ssr: true,
});

const ProductDetailsClient = dynamic(() => import('@/components/product-details-client').then(mod => ({ default: mod.ProductDetailsClient })), {
  loading: () => <div className="space-y-6"><div className="h-32 bg-muted animate-pulse rounded"></div></div>,
  ssr: true,
});

// Lazy load suggested products component
const SuggestedProducts = dynamic(() => import('@/components/suggested-products').then(mod => ({ default: mod.SuggestedProducts })), {
  loading: () => (
    <div className="mt-12">
      <div className="h-6 sm:h-8 bg-muted animate-pulse rounded w-40 sm:w-48 mb-4 sm:mb-6 px-4"></div>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 hide-scrollbar">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="min-w-[140px] sm:min-w-[180px] h-[240px] sm:h-[280px] bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
        ))}
      </div>
    </div>
  ),
});

// ISR: Revalidate every hour
export const revalidate = 3600;

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery with Slider - Will be controlled by ProductDetailsClient */}
        <ProductImageSliderWrapper 
          product={product}
        />

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title_ar}</h1>
            <div className="mb-4">
              <div className="text-3xl font-bold text-primary">
                {product.price.toLocaleString('ar-EG')} جنيه مصري
              </div>
              {product.oldPrice && product.oldPrice > product.price && (
                <div className="text-sm text-muted-foreground mt-1">
                  <span className='font-bold text-primary'>بدلاً من </span>
                  <span className="line-through">
                    {product.oldPrice.toLocaleString('ar-EG')} جنيه مصري
                  </span>
                </div>
              )}
            </div>
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium">
                متوفر ({product.stock} قطعة)
              </p>
            ) : (
              <p className="text-red-600 font-medium">نفدت الكمية</p>
            )}
          </div>

          {product.description_ar && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-2">الوصف</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description_ar}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Attributes */}
          {Object.keys(product.attributes).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">المواصفات</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm text-muted-foreground">{key}:</span>
                      <span className="mr-2 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add to Cart - Client Component */}
          <ProductDetailsClient product={product} />
        </div>
      </div>

      {/* Suggested Products with Lazy Loading and Suspense */}
      <Suspense
        fallback={
          <div className="mt-12">
            <div className="h-6 sm:h-8 bg-muted animate-pulse rounded w-40 sm:w-48 mb-4 sm:mb-6 px-4"></div>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 hide-scrollbar">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="min-w-[140px] sm:min-w-[180px] h-[240px] sm:h-[280px] bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
              ))}
            </div>
          </div>
        }
      >
        <SuggestedProducts 
          currentProductId={product.id} 
          currentCategoryId={product.primary_category}
        />
      </Suspense>
    </main>
  );
}

