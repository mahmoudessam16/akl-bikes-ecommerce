'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState(''); // حفظ الباسورد للاستخدام بعد التحقق

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'حدث خطأ أثناء إنشاء الحساب');
        return;
      }

      setRegisteredEmail(formData.email);
      setRegisteredPassword(formData.password); // حفظ الباسورد
      setShowVerification(true);
      setSuccess('تم إنشاء الحساب. يرجى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني');
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verificationCode) {
      setError('يرجى إدخال رمز التحقق');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registeredEmail,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'رمز التحقق غير صحيح');
        return;
      }

      // بعد التحقق من البريد، سجل الدخول تلقائياً
      const signInResult = await signIn('credentials', {
        email: registeredEmail,
        password: registeredPassword, // استخدام الباسورد المحفوظ
        redirect: false,
      });

      if (signInResult?.error) {
        setError('تم التحقق من البريد الإلكتروني لكن حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
        setShowVerification(false);
        setIsLogin(true);
        setFormData({ name: '', email: registeredEmail, password: '', confirmPassword: '' });
        setVerificationCode('');
        return;
      }

      if (signInResult?.ok) {
        // الانتقال للصفحة الرئيسية
        router.push('/ar');
        router.refresh();
        return;
      }

      // إذا لم ينجح تسجيل الدخول، اترك المستخدم في صفحة تسجيل الدخول
      setSuccess('تم التحقق من البريد الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول');
      setShowVerification(false);
      setIsLogin(true);
      setFormData({ name: '', email: registeredEmail, password: '', confirmPassword: '' });
      setVerificationCode('');
    } catch (err) {
      setError('حدث خطأ أثناء التحقق من البريد الإلكتروني');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'فشل إعادة إرسال الرمز');
        return;
      }

      setSuccess('تم إرسال رمز جديد إلى بريدك الإلكتروني');
    } catch (err) {
      setError('حدث خطأ أثناء إعادة إرسال الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('البريد الإلكتروني وكلمة المرور مطلوبان');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl') || '/ar';
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/ar';
      await signIn('google', { 
        callbackUrl,
        redirect: true,
      });
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول مع Google. تأكد من إعدادات Google OAuth في ملف .env.local');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {showVerification
                  ? 'التحقق من البريد الإلكتروني'
                  : isLogin
                  ? 'تسجيل الدخول'
                  : 'إنشاء حساب جديد'}
              </CardTitle>
              <CardDescription className="text-center">
                {showVerification
                  ? 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني'
                  : isLogin
                  ? 'مرحباً بعودتك'
                  : 'أنشئ حسابك للبدء'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {showVerification ? (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <Label htmlFor="code">رمز التحقق</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="أدخل الرمز المكون من 6 أرقام"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        setError('');
                      }}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      'تحقق'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    إعادة إرسال الرمز
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowVerification(false);
                      setIsLogin(true);
                    }}
                  >
                    العودة لتسجيل الدخول
                  </Button>
                </form>
              ) : (
                <>
                  <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <Label htmlFor="name" className='mb-3'>الاسم</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="أدخل اسمك الكامل"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email" className='mb-3'>البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="example@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className='mb-3'>كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder={isLogin ? 'كلمة المرور' : '6 أحرف على الأقل'}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>

                    {!isLogin && (
                      <div>
                        <Label htmlFor="confirmPassword" className='mb-3'>تأكيد كلمة المرور</Label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="أعد إدخال كلمة المرور"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="pr-10"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...'}
                        </>
                      ) : isLogin ? (
                        'تسجيل الدخول'
                      ) : (
                        'إنشاء حساب'
                      )}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {isLogin ? 'تسجيل الدخول مع Google' : 'إنشاء حساب مع Google'}
                  </Button>

                  <div className="mt-4 text-center text-sm">
                    {isLogin ? (
                      <>
                        ليس لديك حساب؟{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsLogin(false);
                            setError('');
                            setSuccess('');
                          }}
                          className="text-primary hover:underline font-medium"
                        >
                          إنشاء حساب جديد
                        </button>
                      </>
                    ) : (
                      <>
                        لديك حساب بالفعل؟{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsLogin(true);
                            setError('');
                            setSuccess('');
                          }}
                          className="text-primary hover:underline font-medium"
                        >
                          تسجيل الدخول
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <Image
          src="/imgs/hero-bg.png"
          alt="Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

