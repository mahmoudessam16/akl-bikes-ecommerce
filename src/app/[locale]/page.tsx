import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProductCarousel } from '@/components/product-carousel';
import { CategoryCard } from '@/components/category-card';
import { Button } from '@/components/ui/button';
import { getProducts, getCategories } from '@/lib/api/mock-data';
import Link from 'next/link';

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();
  const featuredProducts = products.slice(0, 8);
  const featuredCategories = categories.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                عقل للدراجات الهوائية
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                اكتشف مجموعتنا الواسعة من الدراجات والإكسسوارات عالية الجودة
              </p>
              <Link href="/ar/category/mountain-bikes">
                <Button size="lg" className="text-lg px-8 cursor-pointer">
                  تسوق الآن
                </Button>
              </Link>
            </div>
          </div>
          {/* Hero background image */}
          <div className="absolute inset-0 opacity-40">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Carousel */}
        <ProductCarousel
          products={featuredProducts}
          title="منتجات مميزة"
        />
      </main>
      <Footer />
    </div>
  );
}
