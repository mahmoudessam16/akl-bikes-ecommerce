import { getProducts, getCategories } from '@/lib/api/mock-data';
import { HomeClient } from '@/components/home-client';

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();
  const featuredProducts = products.slice(0, 8);
  const featuredCategories = categories.slice(0, 6);

  return <HomeClient featuredProducts={featuredProducts} featuredCategories={featuredCategories} />;
}
