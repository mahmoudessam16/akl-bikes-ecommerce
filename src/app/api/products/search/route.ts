import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongoose';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query.trim()) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }
    
    // Search in title_ar, title_en, sku, and description_ar
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const products = await Product.find({
      $or: [
        { title_ar: searchRegex },
        { title_en: searchRegex },
        { sku: searchRegex },
        { description_ar: searchRegex },
      ],
    })
      .select('id sku title_ar title_en slug price oldPrice stock primary_category images')
      .limit(limit)
      .lean();
    
    const transformedProducts = products.map((p: any) => ({
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
    }));
    
    return NextResponse.json({ products: transformedProducts }, { status: 200 });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
