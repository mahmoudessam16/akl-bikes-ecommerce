import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { CategoryCard } from '@/components/category-card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, Category } from '@/types';

// Lazy load ProductCarousel - heavy component with framer-motion
// Note: ProductCarousel itself handles SSR:false for framer-motion internally
const ProductCarousel = dynamic(() => import('@/components/product-carousel').then(mod => ({ default: mod.ProductCarousel })), {
  ssr: true, // Keep SSR for SEO, framer-motion is lazy loaded inside ProductCarousel
});

interface HomeClientProps {
  featuredProducts: Product[];
  featuredCategories: Category[];
}

export function HomeClient({ featuredProducts, featuredCategories }: HomeClientProps) {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              عقل للدراجات الهوائية
            </h1>
            <p className="text-lg md:text-xl text-black mb-6">
              اكتشف مجموعتنا الواسعة من الدراجات والإكسسوارات عالية الجودة
            </p>
            <Link href="/ar/products">
              <Button size="lg" className="text-lg px-8 cursor-pointer">
                تسوق الآن
              </Button>
            </Link>
          </div>
        </div>
        {/* Hero background image */}
        <div className="absolute inset-0 opacity-50">
          <Image
            src="/imgs/hero-bg.png"
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">الفئات المميزة</h2>
          <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {featuredCategories.map((category) => (
                <div key={category.id} className="flex-shrink-0 w-[calc((100vw-3rem)/2)] sm:w-[calc((100vw-4rem)/3)] md:w-[calc((100vw-5rem)/4)] lg:w-[calc((100vw-6rem)/6)] max-w-[200px]">
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <Suspense fallback={
        <section className="py-8">
          <h2 className="text-2xl font-bold mb-6 px-4">منتجات مميزة</h2>
          <div className="flex gap-4 px-4 overflow-x-auto pb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] h-96 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </section>
      }>
        <ProductCarousel
          products={featuredProducts}
          title="منتجات مميزة"
        />
      </Suspense>
    </main>
  );
}

