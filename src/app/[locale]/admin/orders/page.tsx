'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, CheckCircle2, XCircle, Package, Search, Calendar, User, Phone, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  productId: string;
  sku: string;
  title_ar: string;
  price: number;
  quantity: number;
  image?: string;
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
  userId?: any;
}

interface OrderStats {
  total: number;
  pending: number;
  delivered: number;
  revenue: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    delivered: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'delivered' | 'cancelled' | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) {
        throw new Error('فشل في جلب الطلبات');
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || {
        total: 0,
        pending: 0,
        delivered: 0,
        revenue: 0,
      });
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !actionType) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionType }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'حدث خطأ');
      }

      const data = await res.json();
      toast.success(data.message || 'تم تحديث حالة الطلب بنجاح');
      
      // Refresh orders
      await fetchOrders();
      
      setActionDialogOpen(false);
      setSelectedOrder(null);
      setActionType(null);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const openActionDialog = (order: Order, type: 'delivered' | 'cancelled') => {
    setSelectedOrder(order);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'حدث خطأ');
      }

      const data = await res.json();
      toast.success(data.message || 'تم حذف الطلب بنجاح');
      
      // Refresh orders
      await fetchOrders();
      
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء حذف الطلب');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive'; className?: string }> = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' },
      confirmed: { label: 'تم التأكيد', variant: 'default' },
      shipped: { label: 'تم الشحن', variant: 'default' },
      delivered: { label: 'تم الاستلام', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
      cancelled: { label: 'ملغي', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className || undefined}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (order.orderNumber?.toLowerCase() || '').includes(searchLower) ||
      (order.name?.toLowerCase() || '').includes(searchLower) ||
      (order.phone || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground">عرض وإدارة جميع الطلبات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الطلبات
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد الانتظار
            </CardTitle>
            <Package className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تم الاستلام
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الإيرادات
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.toLocaleString('ar-EG')} جنيه
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث برقم الطلب، الاسم، أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-full max-w-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">جميع الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">تم التأكيد</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">تم الاستلام</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">طلب #{order.orderNumber}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {order.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {order.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {(order.total || 0).toLocaleString('ar-EG')} جنيه
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} منتج
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">المنتجات:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(order.items || []).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-muted rounded-md"
                      >
                        {item.image && (
                          <div className="relative w-12 h-12 overflow-hidden rounded border bg-background">
                            <img
                              src={item.image}
                              alt={item.title_ar}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title_ar || 'منتج'}</p>
                          <p className="text-xs text-muted-foreground">
                            الكمية: {item.quantity || 0} × {(item.price || 0).toLocaleString('ar-EG')} جنيه
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">عنوان التوصيل:</p>
                    <p className="text-sm text-muted-foreground">{order.address}</p>
                  </div>
                </div>

                {/* Actions */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      onClick={() => openActionDialog(order, 'delivered')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                      تم الاستلام
                    </Button>
                    <Button
                      onClick={() => openActionDialog(order, 'cancelled')}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 ml-2" />
                      رفض الطلب
                    </Button>
                  </div>
                )}
                
                {/* Delete button for cancelled orders */}
                {order.status === 'cancelled' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      onClick={() => openDeleteDialog(order)}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف الطلب
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' ? 'لا توجد طلبات تطابق البحث' : 'لا توجد طلبات'}
          </p>
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'delivered' ? 'تأكيد الاستلام' : 'رفض الطلب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'delivered' ? (
                <>
                  هل أنت متأكد من أن الطلب #{selectedOrder?.orderNumber || ''} تم استلامه؟
                  <br />
                  سيتم إضافة مبلغ {(selectedOrder?.total || 0).toLocaleString('ar-EG')} جنيه إلى الإيرادات.
                </>
              ) : (
                <>
                  هل أنت متأكد من رفض الطلب #{selectedOrder?.orderNumber || ''}؟
                  <br />
                  سيتم إرجاع المنتجات إلى المخزون.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={updating}
              className={
                actionType === 'delivered'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              }
            >
              {updating ? 'جاري التحديث...' : actionType === 'delivered' ? 'تأكيد' : 'رفض'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الطلب #{selectedOrder?.orderNumber || ''}؟
              <br />
              <strong className="text-destructive">هذا الإجراء لا يمكن التراجع عنه.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
