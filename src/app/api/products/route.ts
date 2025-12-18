import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongoose';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    // If slug is provided, return single product (more efficient)
    if (slug) {
      const product = await Product.findOne({ slug }).lean();
      if (!product) {
        return NextResponse.json({ product: null }, { status: 200 });
      }
      
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
        variants,
        colors,
      };
      
      return NextResponse.json({ product: transformedProduct }, { status: 200 });
    }
    
    // Otherwise, return all products with limit - only select needed fields
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('id sku title_ar title_en slug price oldPrice stock primary_category images attributes description_ar description_en colors variants')
      .lean();
    
    const transformedProducts = products.map((p: any) => {
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
        oldPrice: p.oldPrice,
        stock: p.stock,
        primary_category: p.primary_category,
        images: p.images || [],
        attributes: p.attributes || {},
        description_ar: p.description_ar,
        description_en: p.description_en,
        variants,
        colors,
      };
    });
    
    return NextResponse.json(transformedProducts, { status: 200 });
  } catch (error: any) {
    // Return empty array on error
    return NextResponse.json([], { status: 200 });
  }
}

