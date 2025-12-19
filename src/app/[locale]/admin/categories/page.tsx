'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      // Error fetching categories
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'حدث خطأ');
        return;
      }

      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
      window.dispatchEvent(new Event('categoriesUpdated'));
      toast.success('تم حذف الفئة بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };


  const mainCategories = categories.filter(c => !c.parentId);
  const childCategories = categories.filter(c => c.parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الفئات</h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف فئات المنتجات</p>
        </div>
        <Link href="/ar/admin/categories/new">
          <Button className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            إضافة فئة جديدة
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainCategories.map((category) => (
          <Card
            key={category.id}
            className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 border-2 border-transparent hover-card-scale cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-primary" />
                  <CardTitle>{category.name_ar}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Link href={`/ar/admin/categories/${category.id}/edit`}>
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
                      setSelectedCategory(category);
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
              {category.image && (
                <div className="relative w-full h-48 overflow-hidden rounded-md mb-3 bg-muted">
                  <img
                    src={category.image}
                    alt={category.name_ar}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-3">
                {category.description_ar || 'لا يوجد وصف'}
              </p>
              {category.children && category.children.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">الفئات الفرعية:</p>
                  {category.children.map((child) => {
                    // Use child directly as it contains all necessary data
                    const childCategory: Category = {
                      id: child.id,
                      name_ar: child.name_ar,
                      name_en: child.name_en || child.name_ar,
                      slug: child.slug,
                      parentId: child.parentId,
                      image: child.image,
                      description_ar: child.description_ar,
                      description_en: child.description_en,
                    };
                    return (
                      <div
                        key={child.id}
                        className="flex items-center justify-between bg-muted px-3 py-2 rounded-md group hover:bg-muted/80 transition-colors"
                      >
                        <span className="text-sm">{child.name_ar}</span>
                        <div className="flex gap-1">
                          <Link href={`/ar/admin/categories/${child.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 cursor-pointer"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(childCategory);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-6 w-6 text-destructive hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الفئة "{selectedCategory?.name_ar}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


