'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '@/types';

export default function NewCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    parentId: null as string | null,
    image: '',
    description_ar: '',
    description_en: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الفئات');
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'bike-store/categories');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'فشل رفع الصورة');
    }

    const data = await res.json();
    return data.url;
  };

  const uploadUrlToCloudinary = async (url: string): Promise<string> => {
    if (url.includes('res.cloudinary.com')) {
      return url;
    }

    const res = await fetch('/api/upload', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, folder: 'bike-store/categories' }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'فشل رفع الصورة من الرابط');
    }

    const data = await res.json();
    return data.url;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.name_ar || formData.name_ar.trim() === '') {
        toast.error('يرجى إدخال اسم الفئة');
        setSubmitting(false);
        return;
      }

      const nameAr = formData.name_ar.trim();
      const generatedSlug = generateSlug(nameAr);
      const generatedId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (!generatedSlug || generatedSlug.trim() === '') {
        toast.error('حدث خطأ في توليد الرابط. يرجى المحاولة مرة أخرى.');
        setSubmitting(false);
        return;
      }

      // Upload image to Cloudinary if needed
      let finalImageUrl = formData.image;
      if (formData.image && formData.image.trim() !== '') {
        setUploading(true);
        try {
          if (imageSource === 'file' && formData.image.startsWith('data:')) {
            const response = await fetch(formData.image);
            const blob = await response.blob();
            const file = new File([blob], 'category-image.jpg', { type: blob.type });
            finalImageUrl = await uploadImageToCloudinary(file);
          } else if (imageSource === 'url' && !formData.image.includes('res.cloudinary.com')) {
            finalImageUrl = await uploadUrlToCloudinary(formData.image);
          }
        } catch (error: any) {
          toast.error(error.message || 'فشل رفع الصورة');
          setSubmitting(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const submitData = {
        id: generatedId,
        name_ar: nameAr,
        name_en: formData.name_en || nameAr,
        slug: generatedSlug,
        parentId: formData.parentId || null,
        image: finalImageUrl || undefined,
        description_ar: formData.description_ar || undefined,
        description_en: formData.description_en || undefined,
      };

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'حدث خطأ');
        return;
      }

      toast.success('تم إضافة الفئة بنجاح');
      window.dispatchEvent(new Event('categoriesUpdated'));
      router.push('/ar/admin/categories');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const mainCategories = categories.filter(c => !c.parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowRight className="h-5 w-5 rtl:rotate-0 rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">إضافة فئة جديدة</h1>
          <p className="text-muted-foreground text-sm sm:text-base">أدخل معلومات الفئة الجديدة</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">المعلومات الأساسية</h2>
          
          <div className="space-y-2">
            <Label htmlFor="name_ar" className="text-base">اسم الفئة بالعربية *</Label>
            <Input
              id="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder="مثال: دراجات جبلية"
              className="h-12 text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_en" className="text-base">اسم الفئة بالإنجليزية (اختياري)</Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Mountain Bikes"
              className="h-12 text-lg"
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
        </div>

        {/* Description Section */}
        <div className="bg-card rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">الوصف (اختياري)</h2>
          <Textarea
            id="description_ar"
            value={formData.description_ar}
            onChange={(e) =>
              setFormData({ ...formData, description_ar: e.target.value })
            }
            placeholder="وصف الفئة بالعربية..."
            rows={4}
            className="text-base"
          />
          <Textarea
            id="description_en"
            value={formData.description_en}
            onChange={(e) =>
              setFormData({ ...formData, description_en: e.target.value })
            }
            placeholder="وصف الفئة بالإنجليزية..."
            rows={4}
            className="text-base"
          />
        </div>

        {/* Image Section */}
        <div className="bg-card rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">صورة الفئة (اختياري)</h2>
          
          <div className="flex border-b border-border mb-4">
            <button
              type="button"
              onClick={() => {
                setImageSource('url');
                setImagePreview('');
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
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
                placeholder="https://example.com/image.jpg"
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
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error('حجم الملف كبير جداً. الحد الأقصى 10MB');
                      e.target.value = '';
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result as string;
                      setImagePreview(result);
                      setFormData({ ...formData, image: result });
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview('');
                    setFormData({ ...formData, image: '' });
                  }
                  e.target.value = '';
                }}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-10 file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:rounded-md file:mr-4 file:text-sm file:font-semibold hover:file:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                💡 اختر صورة من جهاز الكمبيوتر الخاص بك (JPG, PNG, GIF) - سيتم رفعها على Cloudinary
              </p>
            </div>
          )}

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

        {/* Submit Button */}
        <div className="flex gap-4 sticky bottom-0 bg-background border-t p-4 -mx-4 sm:mx-0 sm:border-0 sm:static sm:p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 sm:flex-initial cursor-pointer"
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={submitting || uploading} className="flex-1 sm:flex-initial cursor-pointer">
            {uploading ? 'جاري رفع الصورة...' : submitting ? 'جاري الحفظ...' : 'إضافة الفئة'}
          </Button>
        </div>
      </form>
    </div>
  );
}
