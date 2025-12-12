import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductDetailsClient } from '@/components/product-details-client';
import { getProductBySlug } from '@/lib/api/mock-data';

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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.images[0] || '/imgs/bike-(1).jpeg'}
                alt={product.title_ar}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-md bg-muted"
                  >
                    <Image
                      src={image}
                      alt={`${product.title_ar} ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

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
      <Footer />
    </div>
  );
}

