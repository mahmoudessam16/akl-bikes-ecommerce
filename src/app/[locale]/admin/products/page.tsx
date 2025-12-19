'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import Link from 'next/link';
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
import type { Product, Category } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?limit=100');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      // Error fetching products
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      // Error fetching categories
    }
  };



  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'حدث خطأ');
        return;
      }

      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };


  const filteredProducts = products.filter((product) =>
    product.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة المنتجات</h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف المنتجات</p>
        </div>
        <Link href="/ar/admin/products/new">
          <Button className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            إضافة منتج جديد
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 border-2 border-transparent hover-card-scale cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="line-clamp-2">{product.title_ar}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Link href={`/ar/admin/products/${product.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setDeleteDialogOpen(true);
                    }}
                    className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 && (
                <div className="relative w-full h-48 overflow-hidden rounded-md mb-3 bg-muted">
                  <img
                    src={product.images[0]}
                    alt={product.title_ar}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>SKU:</strong> {product.sku}
                </p>
                <p className="text-lg font-bold text-primary">
                  {product.price.toLocaleString('ar-EG')} جنيه
                </p>
                {(product as any).oldPrice && (product as any).oldPrice > product.price && (
                  <p className="text-sm text-muted-foreground">
                    <span className='font-bold text-primary'>بدلاً من </span>
                    <span className="line-through">
                      {(product as any).oldPrice.toLocaleString('ar-EG')} جنيه
                    </span>
                  </p>
                )}
                <p className="text-sm">
                  <strong>المخزون:</strong> {product.stock}
                </p>
                {product.description_ar && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description_ar}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد منتجات</p>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المنتج "{selectedProduct?.title_ar}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}