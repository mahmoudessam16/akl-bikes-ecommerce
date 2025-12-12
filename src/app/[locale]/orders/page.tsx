'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface OrderItem {
  productId: string;
  sku: string;
  title_ar: string;
  price: number;
  quantity: number;
  image?: string;
  variantId?: string;
  variantName?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  name: string;
  phone: string;
  address: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session?.user) {
      router.push('/ar/auth/signin?callbackUrl=/ar/orders');
      return;
    }

    fetchOrders();
  }, [session, sessionStatus, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'حدث خطأ أثناء جلب الطلبات');
        return;
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError('حدث خطأ أثناء جلب الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">طلباتي</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">لا توجد طلبات حتى الآن</p>
              <Button onClick={() => router.push('/ar/products')}>تسوق الآن</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2">طلب #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`${statusColors[order.status]} text-white`}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">الإجمالي</p>
                        <p className="text-xl font-bold">
                          {order.total.toLocaleString('ar-EG')} جنيه مصري
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">المنتجات:</h3>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                          >
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.title_ar}
                                width={80}
                                height={80}
                                className="rounded-md object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{item.title_ar}</p>
                              {item.variantName && (
                                <p className="text-sm text-muted-foreground">
                                  {item.variantName}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                SKU: {item.sku}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                الكمية: {item.quantity}
                              </p>
                              <p className="font-medium">
                                {(item.price * item.quantity).toLocaleString('ar-EG')} جنيه مصري
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">الاسم:</span>
                        <span>{order.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">الهاتف:</span>
                        <span>{order.phone}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">العنوان:</span>
                        <span>{order.address}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

