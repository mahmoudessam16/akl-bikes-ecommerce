import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Product from '@/models/Product';

// GET all products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    const query: any = {};
    if (categoryId) {
      query.primary_category = categoryId;
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Product.countDocuments(query);
    
    return NextResponse.json(
      {
        products,
        total,
        page,
        limit,
        hasMore: skip + products.length < total,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      id,
      sku,
      title_ar,
      title_en,
      slug,
      price,
      stock,
      primary_category,
      images,
      attributes,
      description_ar,
      description_en,
      variants,
    } = body;
    
    // Validate required fields
    if (!title_ar || title_ar.trim() === '') {
      return NextResponse.json(
        { error: 'اسم المنتج مطلوب' },
        { status: 400 }
      );
    }
    
    if (price === undefined || price <= 0) {
      return NextResponse.json(
        { error: 'السعر مطلوب ويجب أن يكون أكبر من صفر' },
        { status: 400 }
      );
    }
    
    if (stock === undefined || stock < 0) {
      return NextResponse.json(
        { error: 'المخزون مطلوب' },
        { status: 400 }
      );
    }
    
    if (!primary_category) {
      return NextResponse.json(
        { error: 'الفئة مطلوبة' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Auto-generate id, sku, and slug if not provided
    const finalId = id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const finalSku = sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const finalSlug = slug || title_ar.toLowerCase()
      .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
      .replace(/[^a-z0-9\s-]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      || `product-${Date.now()}`;
    
    if (!finalSlug || finalSlug.trim() === '') {
      return NextResponse.json(
        { error: 'حدث خطأ في توليد الرابط' },
        { status: 400 }
      );
    }
    
    // Check if id, sku, or slug already exists
    const existing = await Product.findOne({
      $or: [{ id: finalId }, { sku: finalSku }, { slug: finalSlug }],
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'المنتج موجود بالفعل' },
        { status: 400 }
      );
    }
    
    const product = await Product.create({
      id: finalId,
      sku: finalSku,
      title_ar: title_ar.trim(),
      title_en: title_en || title_ar.trim(),
      slug: finalSlug,
      price,
      stock,
      primary_category,
      images: images || [],
      attributes: attributes || {},
      description_ar,
      description_en,
      variants: variants || [],
    });
    
    return NextResponse.json(
      { message: 'تم إنشاء المنتج بنجاح', product },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء المنتج' },
      { status: 500 }
    );
  }
}

