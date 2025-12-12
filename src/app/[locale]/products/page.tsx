import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProductsPageClient } from '@/components/products-page-client';
import { getProducts, getCategories } from '@/lib/api/mock-data';

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProductsPageClient 
          initialProducts={products}
          categories={categories}
        />
      </main>
      <Footer />
    </div>
  );
}

