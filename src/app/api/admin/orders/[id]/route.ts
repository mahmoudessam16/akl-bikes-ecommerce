import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';

// Helper function to check if user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  return session.user.email === adminEmail;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'حالة الطلب غير صحيحة' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    const oldStatus = order.status;

    // If cancelling an order, restore stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findOne({ id: item.productId });
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    // If changing from cancelled to another status, decrease stock again
    if (oldStatus === 'cancelled' && status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findOne({ id: item.productId });
        if (product) {
          if (product.stock < item.quantity) {
            return NextResponse.json(
              { error: `المخزون غير كافي للمنتج: ${item.title_ar}` },
              { status: 400 }
            );
          }
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }

    // Update order status
    order.status = status;
    await order.save();

    return NextResponse.json(
      {
        message: 'تم تحديث حالة الطلب بنجاح',
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الطلب' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // Only allow deletion of cancelled orders
    if (order.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'يمكن حذف الطلبات الملغية فقط' },
        { status: 400 }
      );
    }

    // Delete the order using deleteOne to avoid validation issues
    const deleteResult = await Order.deleteOne({ _id: id });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'فشل حذف الطلب' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'تم حذف الطلب بنجاح',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الطلب' },
      { status: 500 }
    );
  }
}
