import { NextResponse } from 'next/server';
import connectDB from '@/db/mongoose';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    
    // Transform to match frontend structure (with children)
    const mainCategories = categories.filter((c: any) => !c.parentId);
    const childCategories = categories.filter((c: any) => c.parentId);
    
    const categoriesWithChildren = mainCategories.map((main: any) => ({
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
    }));
    
    return NextResponse.json(categoriesWithChildren, { status: 200 });
  } catch (error: any) {
    // Return empty array on error
    return NextResponse.json([], { status: 200 });
  }
}

