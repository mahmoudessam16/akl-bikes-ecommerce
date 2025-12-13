import { notFound } from 'next/navigation';
import { NavbarServer } from '@/components/navbar-server';
import { FooterServer } from '@/components/footer-server';
import { CategoryPageClient } from '@/components/category-page-client';
import {
  getCategoryBySlug,
  getProductsByCategory,
} from '@/lib/api/mock-data';

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page = '1', sort = 'popularity' } = await searchParams;
  const currentPage = parseInt(page, 10);

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { products, total, hasMore } = await getProductsByCategory(
    category.slug,
    currentPage,
    12,
    sort as 'popularity' | 'price_asc' | 'price_desc'
  );

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarServer />
      <main className="flex-1 container mx-auto px-4 py-8">
        <CategoryPageClient
          category={category}
          products={products}
          total={total}
          hasMore={hasMore}
          currentPage={currentPage}
          currentSort={sort}
        />
      </main>
      <FooterServer />
    </div>
  );
}
