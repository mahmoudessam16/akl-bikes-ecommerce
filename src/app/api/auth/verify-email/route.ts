import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongoose';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني والرمز مطلوبان' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني تم التحقق منه بالفعل' },
        { status: 400 }
      );
    }

    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صحيح' },
        { status: 400 }
      );
    }

    if (user.emailVerificationCodeExpires && new Date() > user.emailVerificationCodeExpires) {
      return NextResponse.json(
        { error: 'رمز التحقق منتهي الصلاحية. يرجى طلب رمز جديد' },
        { status: 400 }
      );
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'تم التحقق من البريد الإلكتروني بنجاح' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء التحقق من البريد الإلكتروني' },
      { status: 500 }
    );
  }
}

