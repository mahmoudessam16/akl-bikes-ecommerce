import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لإتمام الطلب' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, total, name, phone, address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'السلة فارغة' },
        { status: 400 }
      );
    }

    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify user exists - البحث باستخدام email لأن id قد يكون string وليس ObjectId
    if (!session.user.email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير موجود في الجلسة' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      userId: user._id,
      orderNumber,
      items,
      total,
      name,
      phone,
      address,
      status: 'pending',
    });

    return NextResponse.json(
      {
        message: 'تم إنشاء الطلب بنجاح',
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الطلب' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لعرض الطلبات' },
        { status: 401 }
      );
    }

    await connectDB();

    // البحث عن User باستخدام email (لأن id قد يكون string)
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // استخدام user._id (ObjectId) للبحث في Orders
    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}

