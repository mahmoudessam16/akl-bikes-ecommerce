import type { Product, Category } from '@/types';
import productsData from '@/mock/products.json';
import categoriesData from '@/mock/categories.json';

export const getProducts = async (): Promise<Product[]> => {
  // Check if we're in a server environment
  if (typeof window === 'undefined') {
    try {
      // Use direct database access in server components
      const { default: connectDB } = await import('@/db/mongoose');
      const Product = (await import('@/models/Product')).default;
      await connectDB();
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      return products.map((p: any) => ({
        id: p.id,
        sku: p.sku,
        title_ar: p.title_ar,
        title_en: p.title_en,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        primary_category: p.primary_category,
        images: p.images || [],
        attributes: p.attributes || {},
        description_ar: p.description_ar,
        description_en: p.description_en,
        variants: p.variants || [],
      })) as Product[];
    } catch (error) {
      console.error('Error fetching products from database:', error);
      // Fallback to mock data
      return productsData as unknown as Product[];
    }
  } else {
    // Client-side: use API
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error('Error fetching products from API:', error);
    }
    // Fallback to mock data
    return productsData as unknown as Product[];
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
};

export const getCategories = async (): Promise<Category[]> => {
  // Check if we're in a server environment
  if (typeof window === 'undefined') {
    try {
      // Use direct database access in server components
      const { default: connectDB } = await import('@/db/mongoose');
      const Category = (await import('@/models/Category')).default;
      await connectDB();
      const categories = await Category.find().sort({ createdAt: -1 }).lean();
      
      // Transform to match frontend structure (with children)
      const mainCategories = categories.filter((c: any) => !c.parentId);
      const childCategories = categories.filter((c: any) => c.parentId);
      
      return mainCategories.map((main: any) => ({
        id: main.id,
        name_ar: main.name_ar,
        name_en: main.name_en,
        slug: main.slug,
        parentId: main.parentId,
        image: main.image,
        description_ar: main.description_ar,
        description_en: main.description_en,
        children: childCategories
          .filter((child: any) => child.parentId === main.id)
          .map((child: any) => ({
            id: child.id,
            name_ar: child.name_ar,
            name_en: child.name_en,
            slug: child.slug,
            parentId: child.parentId,
            image: child.image,
          })),
      })) as Category[];
    } catch (error) {
      console.error('Error fetching categories from database:', error);
      // Fallback to mock data
      return categoriesData as unknown as Category[];
    }
  } else {
    // Client-side: use API
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error('Error fetching categories from API:', error);
    }
    // Fallback to mock data
    return categoriesData as unknown as Category[];
  }
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

