'use client';

import { useEffect, useState } from 'react';
import { Package, FolderTree, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products?limit=1'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/orders'),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const ordersData = await ordersRes.json();

      setStats({
        products: productsData.total || 0,
        categories: categoriesData.length || 0,
        orders: ordersData.stats?.total || 0,
        revenue: ordersData.stats?.revenue || 0, // Only delivered orders revenue
      });
    } catch (error) {
      // Error fetching stats
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'المنتجات',
      value: stats.products,
      icon: Package,
      href: '/ar/admin/products',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'الفئات',
      value: stats.categories,
      icon: FolderTree,
      href: '/ar/admin/categories',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'الطلبات',
      value: stats.orders,
      icon: ShoppingCart,
      href: '/ar/admin/orders',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'الإيرادات',
      value: `${stats.revenue.toLocaleString('ar-EG')} جنيه`,
      icon: TrendingUp,
      href: '/ar/admin/orders',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

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
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة التحكم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href} className="block">
              <Card className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 border-2 border-transparent hover-card-scale cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>إدارة سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/ar/admin/products">
              <Button variant="outline" className="w-full justify-start mb-2 cursor-pointer">
                <Package className="h-4 w-4 ml-2" />
                إضافة منتج جديد
              </Button>
            </Link>
            <Link href="/ar/admin/categories">
              <Button variant="outline" className="w-full justify-start mb-2 cursor-pointer">
                <FolderTree className="h-4 w-4 ml-2" />
                إضافة فئة جديدة
              </Button>
            </Link>
            <Link href="/ar/admin/settings">
              <Button variant="outline" className="w-full justify-start mb-2 cursor-pointer">
                <TrendingUp className="h-4 w-4 ml-2" />
                إعدادات الموقع
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              استخدم القائمة الجانبية للتنقل بين صفحات الإدارة المختلفة.
              يمكنك إضافة وتعديل وحذف الفئات والمنتجات بسهولة.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

