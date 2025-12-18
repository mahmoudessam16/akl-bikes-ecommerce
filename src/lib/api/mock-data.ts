import type { Product, Category } from '@/types';
import { unstable_cache } from 'next/cache';

// --- Internal helpers (server-only) ---

// Products: استخدام cache مع revalidate قصير للصفحة الرئيسية
async function getProductsFromDb(limit?: number): Promise<Product[]> {
  const { default: connectDB } = await import('@/db/mongoose');
  const ProductModel = (await import('@/models/Product')).default;
  await connectDB();

  let query = ProductModel.find()
    .sort({ createdAt: -1 })
    .select(
      'id sku title_ar title_en slug price oldPrice stock primary_category images attributes description_ar description_en colors variants'
    )
    .lean();
  
  if (limit) {
    query = query.limit(limit);
  }

  const products = await query;

  // Optimize data transformation - only transform what we need
  return products.map((p: any) => {
    // Only transform colors/variants if they exist
    const colors = p.colors?.length 
      ? p.colors.map((color: any) => ({
          id: color.id,
          name_ar: color.name_ar,
          name_en: color.name_en,
          image: color.image,
          stock: color.stock,
          available: color.available,
        }))
      : [];

    const variants = p.variants?.length
      ? p.variants.map((variant: any) => ({
          id: variant.id,
          name_ar: variant.name_ar,
          name_en: variant.name_en,
          price_modifier: variant.price_modifier,
          stock: variant.stock,
          attributes: variant.attributes || {},
        }))
      : [];

    return {
      id: p.id,
      sku: p.sku,
      title_ar: p.title_ar,
      title_en: p.title_en,
      slug: p.slug,
      price: p.price,
      oldPrice: p.oldPrice,
      stock: p.stock,
      primary_category: p.primary_category,
      images: p.images || [],
      attributes: p.attributes || {},
      description_ar: p.description_ar,
      description_en: p.description_en,
      variants,
      colors,
    } as Product;
  });
}

// Categories: استخدام cache مع revalidate قصير
async function getCategoriesFromDb(): Promise<Category[]> {
  const { default: connectDB } = await import('@/db/mongoose');
  const CategoryModel = (await import('@/models/Category')).default;
  await connectDB();

  const categories = await CategoryModel.find()
    .sort({ createdAt: -1 })
    .select('id name_ar name_en slug parentId image description_ar description_en createdAt updatedAt')
    .lean();

  // Optimize category processing - use Map for O(1) lookups
  const mainCategories = categories.filter((c: any) => !c.parentId);
  const childCategoriesByParent = new Map<string, any[]>();
  
  categories.forEach((c: any) => {
    if (c.parentId) {
      if (!childCategoriesByParent.has(c.parentId)) {
        childCategoriesByParent.set(c.parentId, []);
      }
      childCategoriesByParent.get(c.parentId)!.push(c);
    }
  });

  return mainCategories.map((main: any) => ({
    id: main.id,
    name_ar: main.name_ar,
    name_en: main.name_en,
    slug: main.slug,
    parentId: main.parentId,
    image: main.image,
    description_ar: main.description_ar,
    description_en: main.description_en,
    children: (childCategoriesByParent.get(main.id) || []).map((child: any) => ({
      id: child.id,
      name_ar: child.name_ar,
      name_en: child.name_en,
      slug: child.slug,
      parentId: child.parentId,
      image: child.image,
    })),
  })) as Category[];
}

export const getProducts = async (limit?: number): Promise<Product[]> => {
  // Server-side: use cached DB access
  if (typeof window === 'undefined') {
    try {
      // Only use cache if limit is provided and small (to avoid 2MB cache limit)
      // For unlimited queries, skip cache to avoid 2MB limit error
      if (limit && limit <= 50) {
        try {
          const cachedGetProducts = unstable_cache(
            async () => getProductsFromDb(limit),
            [`products-limit-${limit}`],
            {
              revalidate: 60, // Cache for 60 seconds
              tags: ['products'],
            }
          );
          return await cachedGetProducts();
        } catch (cacheError: any) {
          // If cache fails (e.g., > 2MB), fallback to direct DB call
          if (cacheError?.message?.includes('2MB') || cacheError?.message?.includes('can not be cached')) {
            return await getProductsFromDb(limit);
          }
          throw cacheError;
        }
      } else {
        // No cache for unlimited or large queries (too large for cache)
        return await getProductsFromDb(limit);
      }
    } catch (error: any) {
      // Silently fail and return empty array - don't log to avoid console errors
      // The error is expected when cache size exceeds 2MB or DB connection fails
      return [];
    }
  } else {
    // Client-side: use API
    try {
      const url = limit ? `/api/products?limit=${limit}` : '/api/products';
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fetch failed, return empty array
    }
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
        oldPrice: (product as any).oldPrice,
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
  // Server-side: use cached DB access
  if (typeof window === 'undefined') {
    try {
      // Cache for 120 seconds (categories change less frequently)
      const cachedGetCategories = unstable_cache(
        async () => getCategoriesFromDb(),
        ['categories'],
        {
          revalidate: 120, // Cache for 2 minutes
          tags: ['categories'],
        }
      );
      return await cachedGetCategories();
    } catch {
      return [];
    }
  } else {
    // Client-side: use API
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fetch failed, return empty array
    }
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
  // Server-side: query MongoDB directly for better performance
  if (typeof window === 'undefined') {
    const [categories] = await Promise.all([getCategories()]);

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

    // If still not found, return empty
    if (!category) {
      return { products: [], total: 0, hasMore: false };
    }

    // Build list of category IDs this category represents (main + children)
    const categoryIds =
      category.children && category.children.length > 0
        ? [category.id, ...category.children.map((c) => c.id)]
        : [category.id];

    const { default: connectDB } = await import('@/db/mongoose');
    const ProductModel = (await import('@/models/Product')).default;
    await connectDB();

    const query: any = { primary_category: { $in: categoryIds } };

    // Map sort option to Mongo sort
    const sort: any = {};
    if (sortBy === 'price_asc') {
      sort.price = 1;
    } else if (sortBy === 'price_desc') {
      sort.price = -1;
    } else {
      // popularity: use createdAt desc as a proxy
      sort.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [rawProducts, total] = await Promise.all([
      ProductModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(
          'id sku title_ar title_en slug price oldPrice stock primary_category images attributes description_ar description_en colors variants'
        )
        .lean(),
      ProductModel.countDocuments(query),
    ]);

    const products = rawProducts.map((p: any) => {
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
        oldPrice: p.oldPrice,
        stock: p.stock,
        primary_category: p.primary_category,
        images: p.images || [],
        attributes: p.attributes || {},
        description_ar: p.description_ar,
        description_en: p.description_en,
        variants,
        colors,
      } as Product;
    });

    return {
      products,
      total,
      hasMore: skip + products.length < total,
    };
  }

  // Client-side fallback: use existing in-memory logic
  const allProducts = await getProducts();
  const categories = await getCategories();

  let category = categories.find((c) => c.id === categoryIdOrSlug || c.slug === categoryIdOrSlug);

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

  const categoryIds = category?.children
    ? [category.id, ...category.children.map((c) => c.id)]
    : category
    ? [category.id]
    : [];

  let filtered = allProducts.filter((p) => categoryIds.includes(p.primary_category));

  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const products = filtered.slice(start, end);

  return {
    products,
    total: filtered.length,
    hasMore: end < filtered.length,
  };
};

