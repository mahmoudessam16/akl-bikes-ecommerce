export interface Product {
  id: string;
  sku: string;
  title_ar: string;
  title_en?: string;
  slug: string;
  price: number;
  stock: number;
  primary_category: string;
  images: string[];
  attributes: Record<string, string | number>;
  description_ar?: string;
  description_en?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name_ar: string;
  name_en?: string;
  price_modifier?: number;
  stock: number;
  attributes: Record<string, string | number>;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  parentId: string | null;
  image?: string;
  description_ar?: string;
  children?: Category[];
}

export interface CartItem {
  productId: string;
  sku: string;
  title_ar: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantName?: string;
  maxStock: number;
}

export interface OrderItem {
  sku: string;
  quantity: number;
  price: number;
  title_ar: string;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

