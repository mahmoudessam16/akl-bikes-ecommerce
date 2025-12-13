import { NavbarServer } from '@/components/navbar-server';
import { FooterServer } from '@/components/footer-server';
import { ProductsPageClient } from '@/components/products-page-client';
import { getProducts, getCategories } from '@/lib/api/mock-data';

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarServer />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProductsPageClient 
          initialProducts={products}
          categories={categories}
        />
      </main>
      <FooterServer />
    </div>
  );
}

