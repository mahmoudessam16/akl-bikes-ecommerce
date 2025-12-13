import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongoose';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    const transformedProducts = products.map((p: any) => ({
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
    }));
    
    return NextResponse.json(transformedProducts, { status: 200 });
  } catch (error: any) {
    console.error('Get products error:', error);
    // Return empty array on error
    return NextResponse.json([], { status: 200 });
  }
}

