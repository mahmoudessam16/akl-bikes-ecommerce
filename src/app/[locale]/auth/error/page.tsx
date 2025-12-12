'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'هناك مشكلة في إعدادات الخادم. يرجى التحقق من إعدادات Google OAuth أو قاعدة البيانات.',
    AccessDenied: 'تم رفض الوصول',
    Verification: 'لم يتم التحقق من البريد الإلكتروني',
    OAuthSignin: 'حدث خطأ أثناء تسجيل الدخول مع Google',
    OAuthCallback: 'حدث خطأ أثناء معالجة استجابة Google',
    OAuthCreateAccount: 'فشل إنشاء الحساب',
    EmailCreateAccount: 'فشل إنشاء الحساب',
    Callback: 'حدث خطأ في callback',
    OAuthAccountNotLinked: 'هذا الحساب مربوط بحساب آخر',
    EmailSignin: 'فشل إرسال البريد الإلكتروني',
    CredentialsSignin: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    SessionRequired: 'يجب تسجيل الدخول',
    Default: 'حدث خطأ أثناء تسجيل الدخول',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-center">خطأ في تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/ar/auth/signin">
            <Button className="w-full">العودة لتسجيل الدخول</Button>
          </Link>
          <Link href="/ar">
            <Button variant="outline" className="w-full">العودة للصفحة الرئيسية</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

