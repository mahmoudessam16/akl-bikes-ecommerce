'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name_ar: '',
    name_en: '',
    slug: '',
    parentId: null as string | null,
    image: '',
    description_ar: '',
    description_en: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [submitting, setSubmitting] = useState(false);

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

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        id: category.id,
        name_ar: category.name_ar,
        name_en: category.name_en || '',
        slug: category.slug,
        parentId: category.parentId,
        image: category.image || '',
        description_ar: category.description_ar || '',
        description_en: (category as any).description_en || '',
      });
      setImagePreview(category.image || '');
      setImageSource(category.image?.startsWith('data:') ? 'file' : 'url');
    } else {
      setSelectedCategory(null);
      setFormData({
        id: '',
        name_ar: '',
        name_en: '',
        slug: '',
        parentId: null,
        image: '',
        description_ar: '',
        description_en: '',
      });
      setImagePreview('');
      setImageSource('url');
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name_ar || formData.name_ar.trim() === '') {
        toast.error('يرجى إدخال اسم الفئة');
        setSubmitting(false);
        return;
      }

      // Auto-generate ID and slug - always generate them, don't rely on formData
      const nameAr = formData.name_ar.trim();
      
      if (!nameAr) {
        toast.error('يرجى إدخال اسم الفئة');
        setSubmitting(false);
        return;
      }
      
      const generatedSlug = generateSlug(nameAr);
      const generatedId = selectedCategory ? formData.id : `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Ensure slug is not empty
      if (!generatedSlug || generatedSlug.trim() === '') {
        toast.error('حدث خطأ في توليد الرابط. يرجى المحاولة مرة أخرى.');
        setSubmitting(false);
        return;
      }
      
      const submitData = {
        id: generatedId,
        name_ar: nameAr,
        name_en: formData.name_en || nameAr,
        slug: generatedSlug,
        parentId: formData.parentId || null,
        image: formData.image || undefined,
        description_ar: formData.description_ar || undefined,
        description_en: formData.description_en || undefined,
      };


      const url = selectedCategory
        ? `/api/admin/categories/${selectedCategory.id}`
        : '/api/admin/categories';
      const method = selectedCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'حدث خطأ');
        return;
      }

      setDialogOpen(false);
      fetchCategories();
      // Refresh navbar by triggering a custom event
      window.dispatchEvent(new Event('categoriesUpdated'));
      toast.success(selectedCategory ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
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

  const generateSlug = (text: string) => {
    if (!text || text.trim() === '') return '';
    
    return text
      .trim()
      .toLowerCase()
      .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
      .replace(/[^a-z0-9\s-]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      || `category-${Date.now()}`;
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory
                  ? 'قم بتعديل معلومات الفئة'
                  : 'أدخل معلومات الفئة الجديدة'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name_ar" className="text-base">اسم الفئة بالعربية *</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => {
                    setFormData({ ...formData, name_ar: e.target.value });
                  }}
                  placeholder="مثال: دراجات جبلية"
                  className="h-12 text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId" className="text-base">نوع الفئة</Label>
                <select
                  id="parentId"
                  value={formData.parentId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value || null })
                  }
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-4 py-2 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">فئة رئيسية (تظهر في القائمة الرئيسية)</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      فئة فرعية تحت: {cat.name_ar}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.parentId 
                    ? '✓ هذه فئة فرعية - ستظهر في القائمة المنسدلة'
                    : '✓ هذه فئة رئيسية - ستظهر في القائمة الرئيسية'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ar" className="text-base">الوصف (اختياري)</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, description_ar: e.target.value })
                  }
                  placeholder="وصف الفئة..."
                  rows={5}
                  className="text-base"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base">صورة الفئة (اختياري)</Label>
                
                {/* Tabs for image source */}
                <div className="flex gap-2 border-b">
                  <button
                    type="button"
                    onClick={() => {
                      setImageSource('url');
                      setImagePreview('');
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      imageSource === 'url'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    رابط صورة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSource('file');
                      setImagePreview('');
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      imageSource === 'file'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    رفع من الكمبيوتر
                  </button>
                </div>

                {imageSource === 'url' ? (
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="url"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg أو /imgs/category.jpg"
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 يمكنك نسخ رابط أي صورة من الإنترنت ولصقه هنا
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Create a local preview
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result as string;
                            setImagePreview(result);
                            // For now, we'll use the data URL directly
                            // In production, you'd upload to a server
                            setFormData({ ...formData, image: result });
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview('');
                          setFormData({ ...formData, image: '' });
                        }
                        // Reset the input so the same file can be selected again
                        e.target.value = '';
                      }}
                      className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-10 file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:rounded-md file:mr-4 file:text-sm file:font-semibold hover:file:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 اختر صورة من جهاز الكمبيوتر الخاص بك (JPG, PNG, GIF)
                    </p>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">معاينة الصورة:</Label>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-48 object-contain mx-auto rounded"
                        onError={() => setImagePreview('')}
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : selectedCategory ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(category)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedCategory(category);
                      setDeleteDialogOpen(true);
                    }}
                    className="h-8 w-8 text-destructive hover:text-destructive"
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(childCategory)}
                            className="h-6 w-6"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(childCategory);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-6 w-6 text-destructive hover:text-destructive"
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


