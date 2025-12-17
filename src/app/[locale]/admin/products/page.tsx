'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
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
import type { Product, Category } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    variants: [] as any[],
    colors: [] as Array<{ id: string; name_ar: string; name_en?: string; image: string; stock: number; available: boolean }>,
  });
  const [imageInput, setImageInput] = useState('');
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [imagePreview, setImagePreview] = useState('');
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Color management
  const [colorName, setColorName] = useState('');
  const [colorImage, setColorImage] = useState('');
  const [colorStock, setColorStock] = useState(0);
  const [colorImageSource, setColorImageSource] = useState<'url' | 'file'>('url');
  const [colorImagePreview, setColorImagePreview] = useState('');

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

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
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
        variants: product.variants || [],
        colors: product.colors || [],
      });
      setImageInput('');
      setImageSource('url');
      setImagePreview('');
    } else {
      setSelectedProduct(null);
      setFormData({
        id: '',
        sku: '',
        title_ar: '',
        title_en: '',
        slug: '',
        price: 0,
        oldPrice: 0,
        stock: 0,
        primary_category: '',
        images: [],
        attributes: {},
        description_ar: '',
        description_en: '',
        variants: [],
        colors: [],
      });
      setImageInput('');
      setImageSource('url');
      setImagePreview('');
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
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

      // Auto-generate ID, SKU, slug, and title_en
      const titleAr = formData.title_ar.trim();
      const generatedSlug = generateSlug(titleAr);
      const generatedId = selectedProduct ? formData.id : `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const generatedSku = selectedProduct && formData.sku ? formData.sku : `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Ensure slug is not empty
      if (!generatedSlug || generatedSlug.trim() === '') {
        toast.error('حدث خطأ في توليد الرابط. يرجى المحاولة مرة أخرى.');
        setSubmitting(false);
        return;
      }

      const submitData = {
        id: generatedId,
        sku: generatedSku,
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
        variants: formData.variants || [],
        colors: formData.colors || [],
      };

      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products';
      const method = selectedProduct ? 'PUT' : 'POST';

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
      fetchProducts();
      toast.success(selectedProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
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

  const addImage = () => {
    if (imageSource === 'url' && imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput('');
      setImagePreview('');
    } else if (imageSource === 'file' && imagePreview) {
      setFormData({
        ...formData,
        images: [...formData.images, imagePreview],
      });
      setImagePreview('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
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

  const addColor = () => {
    if (!colorName.trim() || !colorImage.trim()) {
      toast.error('يرجى إدخال اسم اللون وصورة');
      return;
    }

    const newColor = {
      id: `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name_ar: colorName.trim(),
      name_en: colorName.trim(),
      image: colorImage,
      stock: colorStock,
      available: colorStock > 0,
    };

    setFormData({
      ...formData,
      colors: [...formData.colors, newColor],
    });

    // Reset form
    setColorName('');
    setColorImage('');
    setColorStock(0);
    setColorImagePreview('');
  };

  const removeColor = (colorId: string) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((c) => c.id !== colorId),
    });
  };

  const generateSlug = (text: string) => {
    if (!text || text.trim() === '') return '';
    
    // Convert Arabic text to transliterated slug
    return text
      .trim()
      .toLowerCase()
      .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '') // Remove Arabic characters
      .replace(/[^a-z0-9\s-]+/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
      || `product-${Date.now()}`; // Fallback if result is empty
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
              <DialogDescription>
                {selectedProduct
                  ? 'قم بتعديل معلومات المنتج'
                  : 'أدخل معلومات المنتج الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title_ar" className="text-base">اسم المنتج بالعربية *</Label>
                <Input
                  id="title_ar"
                  value={formData.title_ar}
                  onChange={(e) => {
                    setFormData({ ...formData, title_ar: e.target.value });
                  }}
                  placeholder="مثال: دراجة جبلية 2024"
                  className="h-12 text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base">السعر (جنيه) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oldPrice" className="text-base">السعر القديم (اختياري)</Label>
                  <Input
                    id="oldPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.oldPrice || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, oldPrice: parseFloat(e.target.value) || 0 })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="primary_category" className="text-base">الفئة *</Label>
                  <select
                    id="primary_category"
                    value={formData.primary_category}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_category: e.target.value })
                    }
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

              <div className="space-y-2">
                <Label className="text-base">صورة المنتج (اختياري)</Label>
                
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
                        placeholder="https://example.com/image.jpg أو /imgs/product.jpg"
                        className="h-12 text-base"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addImage();
                          }
                        }}
                      />
                      <Button type="button" onClick={addImage} variant="outline" className="h-12">
                        إضافة
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      💡 يمكنك نسخ رابط أي صورة من الإنترنت ولصقه هنا
                    </p>
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">معاينة الصورة:</p>
                        <div className="relative w-full h-48 overflow-hidden rounded-md border bg-muted">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={() => setImagePreview('')}
                          />
                        </div>
                      </div>
                    )}
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
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result as string;
                            setImagePreview(result);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview('');
                        }
                        e.target.value = '';
                      }}
                      className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-10 file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:rounded-md file:mr-4 file:text-sm file:font-semibold hover:file:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 اختر صورة من جهاز الكمبيوتر الخاص بك (JPG, PNG, GIF)
                    </p>
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">معاينة الصورة:</p>
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
                        >
                          إضافة هذه الصورة
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">الصور المضافة:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group border rounded-md overflow-hidden bg-muted"
                        >
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

              <div className="space-y-2">
                <Label className="text-base">الخصائص (اختياري)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={attributeKey}
                    onChange={(e) => setAttributeKey(e.target.value)}
                    placeholder="اسم الخاصية (مثل: المقاس)"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={attributeValue}
                      onChange={(e) => setAttributeValue(e.target.value)}
                      placeholder="القيمة (مثل: 12)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAttribute();
                        }
                      }}
                    />
                    <Button type="button" onClick={addAttribute} variant="outline" className='cursor-pointer'>
                      إضافة
                    </Button>
                  </div>
                </div>
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
                        className="text-destructive hover:text-destructive/80 cursor-pointer "
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-3 border-t pt-4">
                <Label className="text-base font-semibold">الألوان (اختياري)</Label>
                <p className="text-sm text-muted-foreground">
                  أضف ألوان مختلفة للمنتج مع صورة لكل لون
                </p>
                
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
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
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result as string;
                            setColorImagePreview(result);
                            setColorImage(result);
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = '';
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
                  >
                    إضافة لون
                  </Button>
                </div>

                {formData.colors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">الألوان المضافة:</p>
                    <div className="grid grid-cols-2 gap-2">
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

              <div className="space-y-2">
                <Label htmlFor="description_ar" className="text-base">الوصف (اختياري)</Label>
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className='cursor-pointer'
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={submitting} className='cursor-pointer'>
                  {submitting ? 'جاري الحفظ...' : selectedProduct ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(product)}
                    className="h-8 w-8 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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

