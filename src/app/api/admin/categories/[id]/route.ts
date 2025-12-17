import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Category from '@/models/Category';

// PUT update category
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
    const { name_ar, name_en, slug, parentId, image, description_ar, description_en } = body;
    
    await connectDB();
    
    const category = await Category.findOne({ id });
    
    if (!category) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      );
    }
    
    // Check if slug is being changed and if it conflicts
    if (slug && slug !== category.slug) {
      const slugExists = await Category.findOne({ slug, id: { $ne: id } });
      if (slugExists) {
        return NextResponse.json(
          { error: 'الرابط (slug) مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }
    
    // Update fields
    if (name_ar) category.name_ar = name_ar;
    if (name_en !== undefined) category.name_en = name_en;
    if (slug) category.slug = slug;
    if (parentId !== undefined) category.parentId = parentId;
    if (image !== undefined) category.image = image;
    if (description_ar !== undefined) category.description_ar = description_ar;
    if (description_en !== undefined) category.description_en = description_en;
    
    await category.save();

    // Invalidate cached categories so navbar & filters reflect updates
    revalidateTag('categories');

    return NextResponse.json(
      { message: 'تم تحديث الفئة بنجاح', category },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الفئة' },
      { status: 500 }
    );
  }
}

// DELETE category
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
    
    // Check if category has children
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الفئة لأنها تحتوي على فئات فرعية' },
        { status: 400 }
      );
    }
    
    const category = await Category.findOneAndDelete({ id });

    if (!category) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      );
    }

    // Invalidate cached categories so navbar & filters reflect deletion
    revalidateTag('categories');

    return NextResponse.json(
      { message: 'تم حذف الفئة بنجاح' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الفئة' },
      { status: 500 }
    );
  }
}

