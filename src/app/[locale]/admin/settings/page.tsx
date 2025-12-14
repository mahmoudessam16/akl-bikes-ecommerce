'use client';

import { useEffect, useState } from 'react';
import { Save, Upload, Image as ImageIcon, Link as LinkIcon, X, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Image from 'next/image';

export default function SettingsPage() {
  const [logoUrl, setLogoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (logoUrl) {
      setImagePreview(logoUrl);
    }
  }, [logoUrl]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      setLogoUrl(data.logo_url || '/imgs/logo-light.PNG');
      setImagePreview(data.logo_url || '/imgs/logo-light.PNG');
      setPhone(data.phone || '+966 50 123 4567');
      setEmail(data.email || 'info@bikestore.com');
      setAddress(data.address || 'المملكة العربية السعودية\nالرياض، حي العليا\nشارع الملك فهد');
      setWorkingHours(data.working_hours || 'السبت - الخميس: 9:00 ص - 9:00 م\nالجمعة: 2:00 م - 9:00 م');
      setGoogleMapsUrl(data.google_maps_url || 'https://maps.app.goo.gl/jDiErmUTh2nqXRLBA?g_st=aw');
    } catch (error) {
      setLogoUrl('/imgs/logo-light.PNG');
      setImagePreview('/imgs/logo-light.PNG');
      setPhone('+966 50 123 4567');
      setEmail('info@bikestore.com');
      setAddress('المملكة العربية السعودية\nالرياض، حي العليا\nشارع الملك فهد');
      setWorkingHours('السبت - الخميس: 9:00 ص - 9:00 م\nالجمعة: 2:00 م - 9:00 م');
      setGoogleMapsUrl('https://maps.app.goo.gl/jDiErmUTh2nqXRLBA?g_st=aw');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة صحيح');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setLogoUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setLogoUrl(url);
    if (url) {
      setImagePreview(url);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview('/imgs/logo-light.PNG');
    setLogoUrl('/imgs/logo-light.PNG');
  };

  const validateUrl = (url: string): boolean => {
    // Check if it's a valid absolute URL (http/https) or absolute path (starts with /)
    if (!url) return false;
    
    // Absolute path (starts with /)
    if (url.startsWith('/')) return true;
    
    // Absolute URL (starts with http:// or https://)
    if (url.startsWith('http://') || url.startsWith('https://')) return true;
    
    // Base64 data URL
    if (url.startsWith('data:image/')) return true;
    
    return false;
  };

  const handleSave = async () => {
    if (!logoUrl || !logoUrl.trim()) {
      toast.error('الرجاء إدخال رابط أو رفع صورة للوجو');
      return;
    }

    if (!validateUrl(logoUrl)) {
      toast.error('الرجاء إدخال رابط صحيح للوجو (يجب أن يبدأ بـ http:// أو https:// أو /)');
      return;
    }

    if (!phone.trim()) {
      toast.error('الرجاء إدخال رقم الموبايل');
      return;
    }

    if (!email.trim()) {
      toast.error('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    if (!address.trim()) {
      toast.error('الرجاء إدخال العنوان');
      return;
    }

    if (!workingHours.trim()) {
      toast.error('الرجاء إدخال مواعيد العمل');
      return;
    }

    setSaving(true);
    try {
      // Save all settings
      const settings = [
        { key: 'logo_url', value: logoUrl.trim() },
        { key: 'phone', value: phone.trim() },
        { key: 'email', value: email.trim() },
        { key: 'address', value: address.trim() },
        { key: 'working_hours', value: workingHours.trim() },
        { key: 'google_maps_url', value: googleMapsUrl.trim() },
      ];

      const promises = settings.map(setting =>
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting),
        })
      );

      const results = await Promise.all(promises);
      const errors = results.filter(res => !res.ok);

      if (errors.length > 0) {
        const error = await errors[0].json();
        toast.error(error.error || 'حدث خطأ أثناء الحفظ');
        return;
      }

      // Trigger updates
      window.dispatchEvent(new Event('logoUpdated'));
      window.dispatchEvent(new Event('contactInfoUpdated'));
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات الموقع</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات اللوجو</CardTitle>
          <CardDescription>
            قم بتغيير لوجو الموقع. يمكنك رفع صورة من الكمبيوتر أو إدخال رابط أونلاين.
            سيتم تحديث اللوجو في جميع صفحات الموقع تلقائياً.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={imageSource} onValueChange={(v) => setImageSource(v as 'url' | 'file')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                رابط أونلاين
              </TabsTrigger>
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" />
                رفع من الكمبيوتر
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="logo-url">رابط اللوجو</Label>
                <Input
                  id="logo-url"
                  value={imageSource === 'url' ? logoUrl : ''}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/logo.png أو /imgs/logo-light.PNG"
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  أدخل رابط صورة مطلق (يبدأ بـ http:// أو https://) أو مسار مطلق (يبدأ بـ /)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="logo-file">اختر صورة من الكمبيوتر</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="logo-file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-file"
                    className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span>اختر ملف</span>
                  </label>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  الحد الأقصى لحجم الملف: 5MB. الصيغ المدعومة: PNG, JPG, JPEG, GIF, WebP
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {imagePreview && (
            <div className="space-y-2">
              <Label>معاينة اللوجو</Label>
              <div className="border rounded-lg p-6 bg-muted/50 flex items-center justify-center min-h-[120px]">
                <Image
                  src={imagePreview}
                  alt="Logo Preview"
                  width={200}
                  height={80}
                  className="h-20 w-auto object-contain max-w-full"
                  unoptimized={imagePreview.startsWith('data:')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<p className="text-muted-foreground">لا يمكن عرض الصورة</p>';
                    }
                  }}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>معلومات التواصل</CardTitle>
          <CardDescription>
            قم بتحديث معلومات التواصل التي تظهر في صفحة "اتصل بنا". سيتم تحديث المعلومات مباشرة في الموقع.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              رقم الموبايل
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 50 123 4567"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@bikestore.com"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="working-hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              مواعيد العمل
            </Label>
            <Textarea
              id="working-hours"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="السبت - الخميس: 9:00 ص - 9:00 م&#10;الجمعة: 2:00 م - 9:00 م"
              className="min-h-[100px] text-base"
            />
            <p className="text-xs text-muted-foreground">
              يمكنك استخدام Enter لإنشاء سطر جديد
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              العنوان
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="المملكة العربية السعودية&#10;الرياض، حي العليا&#10;شارع الملك فهد"
              className="min-h-[100px] text-base"
            />
            <p className="text-xs text-muted-foreground">
              يمكنك استخدام Enter لإنشاء سطر جديد
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-maps-url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              رابط Google Maps
            </Label>
            <Input
              id="google-maps-url"
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/jDiErmUTh2nqXRLBA?g_st=aw"
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">
              أدخل رابط Google Maps للموقع. يمكنك الحصول عليه من Google Maps
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

