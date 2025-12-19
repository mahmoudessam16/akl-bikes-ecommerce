'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Category, Product } from '@/types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    sku: '',
    title_ar: '',
    title_en: '',
    slug: '',
    price: 0,
    oldPrice: 0,
    stock: 0,
    primary_category: '',
    images: [] as string[],
    attributes: {} as Record<string, string | number>,
    description_ar: '',
    description_en: '',
    colors: [] as Array<{ id: string; name_ar: string; name_en?: string; image: string; stock: number; available: boolean }>,
  });
  const [imageInput, setImageInput] = useState('');
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [colorName, setColorName] = useState('');
  const [colorImage, setColorImage] = useState('');
  const [colorStock, setColorStock] = useState(0);
  const [colorImageSource, setColorImageSource] = useState<'url' | 'file'>('url');
  const [colorImagePreview, setColorImagePreview] = useState('');
  const [colorUploading, setColorUploading] = useState(false);
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      if (!res.ok) {
        toast.error('المنتج غير موجود');
        router.push('/ar/admin/products');
        return;
      }
      const data = await res.json();
      const product = data.product as Product;
      
      setFormData({
        id: product.id,
        sku: product.sku,
        title_ar: product.title_ar,
        title_en: product.title_en || '',
        slug: product.slug,
        price: product.price,
        oldPrice: (product as any).oldPrice || 0,
        stock: product.stock,
        primary_category: product.primary_category,
        images: product.images || [],
        attributes: product.attributes || {},
        description_ar: product.description_ar || '',
        description_en: product.description_en || '',
        colors: product.colors || [],
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب بيانات المنتج');
      router.push('/ar/admin/products');
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
      toast.error('حدث خطأ أثناء جلب الفئات');
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'bike-store/products');

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
      body: JSON.stringify({ url, folder: 'bike-store/products' }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'فشل رفع الصورة من الرابط');
    }

    const data = await res.json();
    return data.url;
  };

  const addImage = async () => {
    if (imageSource === 'url' && imageInput.trim()) {
      setUploading(true);
      try {
        const cloudinaryUrl = await uploadUrlToCloudinary(imageInput.trim());
        setFormData({
          ...formData,
          images: [...formData.images, cloudinaryUrl],
        });
        setImageInput('');
        setImagePreview('');
        toast.success('تم رفع الصورة بنجاح');
      } catch (error: any) {
        toast.error(error.message || 'فشل رفع الصورة');
      } finally {
        setUploading(false);
      }
    } else if (imageSource === 'file') {
      const fileInput = document.getElementById('image-file') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) {
        toast.error('يرجى اختيار ملف');
        return;
      }
      setUploading(true);
      try {
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        setFormData({
          ...formData,
          images: [...formData.images, cloudinaryUrl],
        });
        setImagePreview('');
        fileInput.value = '';
        toast.success('تم رفع الصورة بنجاح');
      } catch (error: any) {
        toast.error(error.message || 'فشل رفع الصورة');
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addColor = async () => {
    if (!colorName.trim() || !colorImage.trim()) {
      toast.error('يرجى إدخال اسم اللون وصورة');
      return;
    }

    setColorUploading(true);
    try {
      let finalImageUrl = colorImage;

      if (colorImageSource === 'file') {
        const fileInput = document.getElementById('color-image-file') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (file) {
          finalImageUrl = await uploadImageToCloudinary(file);
        } else if (colorImage.startsWith('data:')) {
          const response = await fetch(colorImage);
          const blob = await response.blob();
          const file = new File([blob], 'color-image.jpg', { type: blob.type });
          finalImageUrl = await uploadImageToCloudinary(file);
        }
      } else {
        finalImageUrl = await uploadUrlToCloudinary(colorImage);
      }

      const newColor = {
        id: `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name_ar: colorName.trim(),
        name_en: colorName.trim(),
        image: finalImageUrl,
        stock: colorStock,
        available: colorStock > 0,
      };

      setFormData({
        ...formData,
        colors: [...formData.colors, newColor],
      });

      setColorName('');
      setColorImage('');
      setColorStock(0);
      setColorImagePreview('');
      if (fileInput) fileInput.value = '';
      toast.success('تم إضافة اللون بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل رفع صورة اللون');
    } finally {
      setColorUploading(false);
    }
  };

  const removeColor = (colorId: string) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((c) => c.id !== colorId),
    });
  };

  const addAttribute = () => {
    if (attributeKey.trim() && attributeValue.trim()) {
      setFormData({
        ...formData,
        attributes: {
          ...formData.attributes,
          [attributeKey.trim()]: attributeValue.trim(),
        },
      });
      setAttributeKey('');
      setAttributeValue('');
    }
  };

  const removeAttribute = (key: string) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData({ ...formData, attributes: newAttributes });
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
      || `product-${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.title_ar || formData.title_ar.trim() === '') {
        toast.error('يرجى إدخال اسم المنتج');
        setSubmitting(false);
        return;
      }

      if (formData.price <= 0) {
        toast.error('يرجى إدخال سعر صحيح');
        setSubmitting(false);
        return;
      }

      if (formData.stock < 0) {
        toast.error('يرجى إدخال مخزون صحيح');
        setSubmitting(false);
        return;
      }

      if (!formData.primary_category) {
        toast.error('يرجى اختيار الفئة');
        setSubmitting(false);
        return;
      }

      const titleAr = formData.title_ar.trim();
      const generatedSlug = generateSlug(titleAr);

      if (!generatedSlug || generatedSlug.trim() === '') {
        toast.error('حدث خطأ في توليد الرابط. يرجى المحاولة مرة أخرى.');
        setSubmitting(false);
        return;
      }

      const submitData = {
        id: formData.id,
        sku: formData.sku,
        title_ar: titleAr,
        title_en: formData.title_en || titleAr,
        slug: generatedSlug,
        price: formData.price,
        oldPrice: formData.oldPrice || undefined,
        stock: formData.stock,
        primary_category: formData.primary_category,
        images: formData.images || [],
        attributes: formData.attributes || {},
        description_ar: formData.description_ar || undefined,
        description_en: formData.description_en || undefined,
        variants: [],
        colors: formData.colors || [],
      };

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'حدث خطأ');
        return;
      }

      toast.success('تم تحديث المنتج بنجاح');
      router.push('/ar/admin/products');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold">تعديل المنتج</h1>
          <p className="text-muted-foreground text-sm sm:text-base">قم بتعديل معلومات المنتج</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">المعلومات الأساسية</h2>
          
          <div className="space-y-2">
            <Label htmlFor="title_ar" className="text-base">اسم المنتج بالعربية *</Label>
            <Input
              id="title_ar"
              value={formData.title_ar}
              onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
              placeholder="مثال: دراجة جبلية 2024"
              className="h-12 text-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-base">السعر (جنيه) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-12 text-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oldPrice" className="text-base">السعر القديم</Label>
              <Input
                id="oldPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.oldPrice || ''}
                onChange={(e) => setFormData({ ...formData, oldPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-base">المخزون *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="h-12 text-lg"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="primary_category" className="text-base">الفئة *</Label>
              <select
                id="primary_category"
                value={formData.primary_category}
                onChange={(e) => setFormData({ ...formData, primary_category: e.target.value })}
                required
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-4 py-2 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name_ar}>
                    <option value={cat.id}>{cat.name_ar} (رئيسية)</option>
                    {cat.children?.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name_ar}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-card rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">صور المنتج</h2>
          
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
              <div className="flex gap-2">
                <Input
                  value={imageInput}
                  onChange={(e) => {
                    setImageInput(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImage();
                    }
                  }}
                />
                <Button type="button" onClick={addImage} variant="outline" className="h-12" disabled={uploading}>
                  {uploading ? 'جاري الرفع...' : 'رفع وإضافة'}
                </Button>
              </div>
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
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-10 file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:rounded-md file:mr-4 file:text-sm file:font-semibold hover:file:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              />
              {imagePreview && (
                <div className="mt-2">
                  <div className="relative w-full h-48 overflow-hidden rounded-md border bg-muted">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addImage}
                    variant="outline"
                    className="mt-2 w-full"
                    disabled={uploading}
                  >
                    {uploading ? 'جاري الرفع...' : 'رفع وإضافة هذه الصورة'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {formData.images.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">الصور المضافة:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group border rounded-md overflow-hidden bg-muted">
                    <div className="relative w-full h-32">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attributes Section */}
        <div className="bg-card rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">الخصائص (اختياري)</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              value={attributeKey}
              onChange={(e) => setAttributeKey(e.target.value)}
              placeholder="اسم الخاصية (مثل: المقاس)"
              className="h-10"
            />
            <div className="flex gap-2">
              <Input
                value={attributeValue}
                onChange={(e) => setAttributeValue(e.target.value)}
                placeholder="القيمة (مثل: 12)"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAttribute();
                  }
                }}
              />
              <Button type="button" onClick={addAttribute} variant="outline" className="cursor-pointer">
                إضافة
              </Button>
            </div>
          </div>
          
          {Object.keys(formData.attributes).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(formData.attributes).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md"
                >
                  <span className="text-sm">
                    <strong>{key}:</strong> {String(value)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttribute(key)}
                    className="text-destructive hover:text-destructive/80 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors Section */}
        <div className="bg-card rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">الألوان (اختياري)</h2>
          
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="اسم اللون (مثل: أحمر)"
                className="h-10"
              />
              <Input
                type="number"
                min="0"
                value={colorStock || ''}
                onChange={(e) => setColorStock(parseInt(e.target.value) || 0)}
                placeholder="المخزون"
                className="h-10"
              />
            </div>
            
            <div className="flex border-b border-border mb-2">
              <button
                type="button"
                onClick={() => {
                  setColorImageSource('url');
                  setColorImagePreview('');
                }}
                className={`px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  colorImageSource === 'url'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                رابط
              </button>
              <button
                type="button"
                onClick={() => {
                  setColorImageSource('file');
                  setColorImagePreview('');
                }}
                className={`px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  colorImageSource === 'file'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                ملف
              </button>
            </div>

            {colorImageSource === 'url' ? (
              <div className="flex gap-2">
                <Input
                  value={colorImage}
                  onChange={(e) => {
                    setColorImage(e.target.value);
                    setColorImagePreview(e.target.value);
                  }}
                  placeholder="رابط صورة اللون"
                  className="h-10 text-sm"
                />
              </div>
            ) : (
              <input
                id="color-image-file"
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
                      setColorImagePreview(result);
                      setColorImage(result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              />
            )}

            {colorImagePreview && (
              <div className="mt-2">
                <div className="relative w-20 h-20 overflow-hidden rounded border bg-muted">
                  <img
                    src={colorImagePreview}
                    alt="Color preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={addColor}
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
              disabled={colorUploading}
            >
              {colorUploading ? 'جاري الرفع...' : 'إضافة لون'}
            </Button>
          </div>

          {formData.colors.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium">الألوان المضافة:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.colors.map((color) => (
                  <div
                    key={color.id}
                    className="flex items-center gap-2 p-2 bg-muted rounded-md group"
                  >
                    <div className="relative w-12 h-12 overflow-hidden rounded border bg-muted">
                      <img
                        src={color.image}
                        alt={color.name_ar}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{color.name_ar}</p>
                      <p className="text-xs text-muted-foreground">
                        مخزون: {color.stock}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColor(color.id)}
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            placeholder="وصف المنتج بالعربية..."
            rows={4}
            className="text-base"
          />
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
          <Button type="submit" disabled={submitting} className="flex-1 sm:flex-initial cursor-pointer">
            {submitting ? 'جاري الحفظ...' : 'تحديث المنتج'}
          </Button>
        </div>
      </form>
    </div>
  );
}
