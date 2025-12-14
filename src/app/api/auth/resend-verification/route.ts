import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongoose';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
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

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    user.emailVerificationCode = verificationCode;
    user.emailVerificationCodeExpires = expiresAt;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      return NextResponse.json(
        { error: 'فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إعادة إرسال رمز التحقق' },
      { status: 500 }
    );
  }
}

