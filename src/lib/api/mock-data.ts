import type { Product, Category } from '@/types';
import productsData from '@/mock/products.json';
import categoriesData from '@/mock/categories.json';

export const getProducts = async (): Promise<Product[]> => {
  // In production, this would be an API call
  // For now, return mock data
  return productsData as unknown as Product[];
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
};

export const getCategories = async (): Promise<Category[]> => {
  // In production, this would be an API call
  return categoriesData as unknown as Category[];
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const categories = await getCategories();
  
  // Search in main categories
  const mainCategory = categories.find((c) => c.slug === slug);
  if (mainCategory) return mainCategory;
  
  // Search in children categories
  for (const category of categories) {
    if (category.children) {
      const childCategory = category.children.find((c) => c.slug === slug);
      if (childCategory) return childCategory;
    }
  }
  
  return null;
};

export const getProductsByCategory = async (
  categoryIdOrSlug: string,
  page: number = 1,
  limit: number = 12,
  sortBy: 'popularity' | 'price_asc' | 'price_desc' = 'popularity'
): Promise<{ products: Product[]; total: number; hasMore: boolean }> => {
  const allProducts = await getProducts();
  const categories = await getCategories();
  
  // Find category by ID or slug
  let category = categories.find((c) => c.id === categoryIdOrSlug || c.slug === categoryIdOrSlug);
  
  // If not found in main categories, search in children
  if (!category) {
    for (const cat of categories) {
      if (cat.children) {
        const child = cat.children.find((c) => c.id === categoryIdOrSlug || c.slug === categoryIdOrSlug);
        if (child) {
          category = child;
          break;
        }
      }
    }
  }
  
  // Find all child category IDs if this is a main category
  const categoryIds = category?.children 
    ? [category.id, ...category.children.map((c) => c.id)]
    : category 
    ? [category.id]
    : [];
  
  let filtered = allProducts.filter((p) => categoryIds.includes(p.primary_category));

  // Sort
  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Pagination (cursor-based simulation)
  const start = (page - 1) * limit;
  const end = start + limit;
  const products = filtered.slice(start, end);

  return {
    products,
    total: filtered.length,
    hasMore: end < filtered.length,
  };
};

