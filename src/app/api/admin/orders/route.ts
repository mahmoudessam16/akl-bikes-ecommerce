import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';

// Helper function to check if user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  return session.user.email === adminEmail;
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get all orders sorted by creation date (newest first)
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .lean();

    // Calculate stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
    const revenue = orders
      .filter((o: any) => o.status === 'delivered')
      .reduce((sum: number, order: any) => sum + order.total, 0);

    return NextResponse.json(
      {
        orders,
        stats: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
          revenue,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}
