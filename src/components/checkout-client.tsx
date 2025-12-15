'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import type { CheckoutFormData, OrderItem } from '@/types';

export function CheckoutClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    phone: '',
    address: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const total = getTotal();

  // Pre-fill form with user data if available
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || prev.name,
        phone: prev.phone, // Phone not in session
      }));
    }
  }, [session]);

  // Get store phone from env or use default
  // Note: In production, set NEXT_PUBLIC_STORE_PHONE in .env.local
  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || '+201020166056';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (status === 'loading') {
      setError('جاري التحقق من تسجيل الدخول...');
      return;
    }

    if (!session?.user) {
      router.push('/ar/auth/signin?callbackUrl=/ar/checkout');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare order items for database
      const orderItems = items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        title_ar: item.title_ar,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variantId: item.variantId,
        variantName: item.variantName,
      }));

      // Save order to database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          total,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        setError(orderData.error || 'حدث خطأ أثناء إنشاء الطلب');
        setIsLoading(false);
        return;
      }

      // Generate order ID from response
      const orderId = orderData.order.orderNumber;

      // Prepare order items for WhatsApp message
      const orderItemsForMessage: OrderItem[] = items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        title_ar: item.title_ar,
      }));

      // Build message
      let message = `مرحباً، أريد إتمام الطلب التالي:\n\n`;
      message += `رقم الطلب: ${orderId}\n`;
      message += `الاسم: ${formData.name}\n`;
      message += `الهاتف: ${formData.phone}\n`;
      message += `العنوان: ${formData.address}\n\n`;
      message += `المنتجات:\n`;
      orderItemsForMessage.forEach((item) => {
        message += `- ${item.title_ar} (SKU: ${item.sku})\n`;
        message += `  الكمية: ${item.quantity} × ${item.price.toLocaleString('ar-EG')} جنيه مصري = ${(item.quantity * item.price).toLocaleString('ar-EG')} جنيه مصري\n`;
      });
      message += `\nالإجمالي: ${total.toLocaleString('ar-EG')} جنيه مصري`;

      setMessageBody(message);

      // Generate WhatsApp link
      const encodedMessage = encodeURIComponent(message);
      const link = `https://wa.me/${storePhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
      setWhatsappLink(link);
      setIsDialogOpen(true);
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappLink, '_blank');
    clearCart();
    router.push('/ar/orders');
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">جاري التحقق من تسجيل الدخول...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              يجب تسجيل الدخول لإتمام الطلب
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/ar/auth/signin?callbackUrl=/ar/checkout')}>
            تسجيل الدخول
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">سلة التسوق فارغة</p>
          <Button onClick={() => router.push('/ar')}>تسوق الآن</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className='mb-3'>الاسم الكامل</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone" className='mb-3'>رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address" className='mb-3'>العنوان</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex justify-between text-sm">
                    <span>{item.title_ar} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('ar-EG')} جنيه مصري</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-lg font-bold pt-4 border-t">
                <span>الإجمالي</span>
                <span>{total.toLocaleString('ar-EG')} جنيه مصري</span>
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري إنشاء الطلب...
                  </>
                ) : (
                  'تأكيد الطلب'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>مراجعة الطلب</DialogTitle>
            <DialogDescription>
              راجع رسالة الطلب قبل إرسالها عبر واتساب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>رسالة الطلب</Label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={12}
                className="mt-2 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleOpenWhatsApp}>
              فتح في واتساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

