import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Category from '@/models/Category';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    
    // Transform to match frontend structure (with children)
    const mainCategories = categories.filter(c => !c.parentId);
    const childCategories = categories.filter(c => c.parentId);
    
    const categoriesWithChildren = mainCategories.map(main => ({
      ...main,
      children: childCategories
        .filter(child => child.parentId === main.id)
        .map(child => ({
          id: child.id,
          name_ar: child.name_ar,
          name_en: child.name_en,
          slug: child.slug,
          parentId: child.parentId,
          image: child.image,
          description_ar: child.description_ar,
          description_en: child.description_en,
        })),
    }));
    
    return NextResponse.json(categoriesWithChildren, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الفئات' },
      { status: 500 }
    );
  }
}

// POST create category
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
    const { id, name_ar, name_en, slug, parentId, image, description_ar, description_en } = body;
    
    // Validate required fields with better error messages
    if (!name_ar || name_ar.trim() === '') {
      return NextResponse.json(
        { error: 'اسم الفئة مطلوب' },
        { status: 400 }
      );
    }
    
    // Auto-generate id and slug if not provided (shouldn't happen, but just in case)
    const finalId = id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const finalSlug = slug || name_ar.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    if (!finalSlug || finalSlug.trim() === '') {
      return NextResponse.json(
        { error: 'حدث خطأ في توليد الرابط' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if id or slug already exists
    const existing = await Category.findOne({
      $or: [{ id: finalId }, { slug: finalSlug }],
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'الفئة موجودة بالفعل' },
        { status: 400 }
      );
    }
    
    const category = await Category.create({
      id: finalId,
      name_ar: name_ar.trim(),
      name_en: name_en || name_ar.trim(),
      slug: finalSlug,
      parentId: parentId || null,
      image,
      description_ar,
      description_en,
    });
    
    return NextResponse.json(
      { message: 'تم إنشاء الفئة بنجاح', category },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الفئة' },
      { status: 500 }
    );
  }
}

