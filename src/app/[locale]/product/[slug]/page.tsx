import dynamic from 'next/dynamic';
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
            <div className="text-3xl font-bold text-primary mb-4">
              {product.price.toLocaleString('ar-EG')} جنيه مصري
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
    </main>
  );
}

