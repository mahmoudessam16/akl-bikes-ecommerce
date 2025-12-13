'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  FolderTree, 
  Package, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/ar/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      checkAdmin();
    }
  }, [status, session]);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
      
      if (!data.isAdmin) {
        // Redirect non-admin users
        router.push('/ar');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      router.push('/ar');
    } finally {
      setChecking(false);
    }
  };

  if (status === 'loading' || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/ar' });
  };

  const menuItems = [
    { href: '/ar/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { href: '/ar/admin/categories', icon: FolderTree, label: 'الفئات' },
    { href: '/ar/admin/products', icon: Package, label: 'المنتجات' },
    { href: '/ar/admin/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const externalLinks = [
    { href: '/ar', icon: Home, label: 'الموقع الرئيسي', external: true },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <Link href="/ar/admin" className="flex items-center space-x-2 space-x-reverse">
            <Image
              src="/imgs/logo-light.PNG"
              alt="Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              style={{ width: 'auto', height: 'auto' }}
              priority
              loading="eager"
            />
          </Link>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>القائمة</SheetTitle>
                <SheetDescription>اختر الصفحة التي تريد الانتقال إليها</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-8">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <div className="border-t my-2 pt-2">
                  {externalLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="justify-start mt-4"
                >
                  <LogOut className="h-5 w-5 ml-3" />
                  <span>تسجيل الخروج</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-l bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center p-6 border-b">
              <Link href="/ar/admin">
                <Image
                  src="/imgs/logo-light.PNG"
                  alt="Logo"
                  width={150}
                  height={50}
                  className="h-12 w-auto object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                  priority
                  loading="eager"
                />
              </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                  >
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t my-2 pt-2">
                {externalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                    >
                      <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 px-4 py-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {session.user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 ml-2" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:mr-64">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

