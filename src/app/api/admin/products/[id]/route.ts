import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Product from '@/models/Product';

// GET product by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    await connectDB();
    
    const product = await Product.findOne({ id }).lean();
    
    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }
    
    // Transform product data
    const colors = (product.colors || []).map((color: any) => ({
      id: color.id,
      name_ar: color.name_ar,
      name_en: color.name_en,
      image: color.image,
      stock: color.stock,
      available: color.available,
    }));
    
    const transformedProduct = {
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
      colors,
      variants: product.variants || [],
    };
    
    return NextResponse.json(
      { product: transformedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب المنتج' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    await connectDB();
    
    const product = await Product.findOne({ id });
    
    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }
    
    // Check if slug or sku is being changed and if it conflicts
    if (body.slug && body.slug !== product.slug) {
      const slugExists = await Product.findOne({ slug: body.slug, id: { $ne: id } });
      if (slugExists) {
        return NextResponse.json(
          { error: 'الرابط (slug) مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }
    
    if (body.sku && body.sku !== product.sku) {
      const skuExists = await Product.findOne({ sku: body.sku, id: { $ne: id } });
      if (skuExists) {
        return NextResponse.json(
          { error: 'رمز المنتج (SKU) مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }
    
    // Update fields
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined && key !== 'id') {
        (product as any)[key] = body[key];
      }
    });
    
    await product.save();
    
    return NextResponse.json(
      { message: 'تم تحديث المنتج بنجاح', product },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث المنتج' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    await connectDB();
    
    const product = await Product.findOneAndDelete({ id });
    
    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'تم حذف المنتج بنجاح' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
}

