import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Settings from '@/models/Settings';

// GET settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    await connectDB();
    
    if (key) {
      const setting = await Settings.findOne({ key });
      return NextResponse.json(
        { key, value: setting?.value || null },
        { status: 200 }
      );
    }
    
    const allSettings = await Settings.find().lean();
    const settingsObj: Record<string, string> = {};
    allSettings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    return NextResponse.json(settingsObj, { status: 200 });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// POST/PUT update settings
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
    const { key, value } = body;
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: key, value' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(
      { message: 'تم تحديث الإعداد بنجاح', setting },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الإعداد' },
      { status: 500 }
    );
  }
}

