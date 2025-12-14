import type { Product, Category } from '@/types';

export const getProducts = async (): Promise<Product[]> => {
  // Check if we're in a server environment
  if (typeof window === 'undefined') {
    try {
      // Use direct database access in server components
      const { default: connectDB } = await import('@/db/mongoose');
      const Product = (await import('@/models/Product')).default;
      await connectDB();
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      return products.map((p: any) => {
        // Convert colors and variants to plain objects (remove _id)
        const colors = (p.colors || []).map((color: any) => ({
          id: color.id,
          name_ar: color.name_ar,
          name_en: color.name_en,
          image: color.image,
          stock: color.stock,
          available: color.available,
        }));
        
        const variants = (p.variants || []).map((variant: any) => ({
          id: variant.id,
          name_ar: variant.name_ar,
          name_en: variant.name_en,
          price_modifier: variant.price_modifier,
          stock: variant.stock,
          attributes: variant.attributes || {},
        }));

        return {
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
          variants,
          colors,
        };
      }) as Product[];
    } catch (error) {
      // Return empty array if database fails
      return [];
    }
  } else {
    // Client-side: use API
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      // API fetch failed, return empty array
    }
    // Return empty array if API fails
    return [];
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  // Check if we're in a server environment
  if (typeof window === 'undefined') {
    try {
      // Use direct database access - much more efficient
      const { default: connectDB } = await import('@/db/mongoose');
      const Product = (await import('@/models/Product')).default;
      await connectDB();
      const product = await Product.findOne({ slug }).lean();
      
      if (!product) return null;
      
      // Convert colors and variants to plain objects (remove _id)
      const colors = (product.colors || []).map((color: any) => ({
        id: color.id,
        name_ar: color.name_ar,
        name_en: color.name_en,
        image: color.image,
        stock: color.stock,
        available: color.available,
      }));
      
      const variants = (product.variants || []).map((variant: any) => ({
        id: variant.id,
        name_ar: variant.name_ar,
        name_en: variant.name_en,
        price_modifier: variant.price_modifier,
        stock: variant.stock,
        attributes: variant.attributes || {},
      }));

      return {
        id: product.id,
        sku: product.sku,
        title_ar: product.title_ar,
        title_en: product.title_en,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        primary_category: product.primary_category,
        images: product.images || [],
        attributes: product.attributes || {},
        description_ar: product.description_ar,
        description_en: product.description_en,
        variants,
        colors,
      } as Product;
    } catch (error) {
      // Fallback: fetch all products (less efficient but works)
      const products = await getProducts();
      return products.find((p) => p.slug === slug) || null;
    }
  } else {
    // Client-side: use API
    try {
      const res = await fetch(`/api/products?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        return data.product || null;
      }
    } catch (error) {
      // API fetch failed, try fallback
    }
    // Fallback
    const products = await getProducts();
    return products.find((p) => p.slug === slug) || null;
  }
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
      // Return empty array if database fails
      return [];
    }
  } else {
    // Client-side: use API
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      // API fetch failed, return empty array
    }
    // Return empty array if API fails
    return [];
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

