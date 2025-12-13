'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Menu, ShoppingCart, ChevronDown, User, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/lib/stores/cart-store';
import type { Category } from '@/types';

interface NavbarClientProps {
  categories: Category[];
  logoUrl: string;
  session: Session | null;
  isAdmin: boolean;
}

export function NavbarClient({ categories, logoUrl, session, isAdmin }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setIsMounted(true);
    
    // Listen for updates
    const handleCategoriesUpdate = () => {
      window.location.reload();
    };
    const handleLogoUpdate = () => {
      window.location.reload();
    };
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    window.addEventListener('logoUpdated', handleLogoUpdate);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/ar' });
  };

  return (
    <nav 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/ar" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Image
              src={logoUrl}
              alt="Logo"
              width={180}
              height={60}
              className="h-14 w-auto object-contain"
              priority
              suppressHydrationWarning
              unoptimized={logoUrl.startsWith('data:') || logoUrl.startsWith('http://') || logoUrl.startsWith('https://')}
            />
          </Link>

          {/* Desktop Menu - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/ar">
              <Button variant="ghost" className="text-base font-medium cursor-pointer">
                الصفحة الرئيسية
              </Button>
            </Link>
            <Link href="/ar/products">
              <Button variant="ghost" className="text-base font-medium cursor-pointer">
                كل المنتجات
              </Button>
            </Link>
            {categories.length > 0 && categories.map((category) => (
              <Popover
                key={category.id}
                open={openPopovers[category.id]}
                onOpenChange={(open) =>
                  setOpenPopovers((prev) => ({ ...prev, [category.id]: open }))
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 text-base font-medium"
                  >
                    {category.name_ar}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end" sideOffset={8}>
                  <div className="flex flex-col gap-1">
                    {category.children?.map((child) => (
                      <Link
                        key={child.id}
                        href={`/ar/category/${child.slug}`}
                        className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                        onClick={() =>
                          setOpenPopovers((prev) => ({
                            ...prev,
                            [category.id]: false,
                          }))
                        }
                      >
                        {child.name_ar}
                      </Link>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            ))}
            <Link href="/ar/about">
              <Button variant="ghost" className="text-base font-medium cursor-pointer">
                من نحن
              </Button>
            </Link>
          </div>

          {/* Right side - Auth, Cart and Menu */}
          <div className="flex items-center gap-4" suppressHydrationWarning>
            {session?.user ? (
              <>
                <Link href="/ar/cart" className="cursor-pointer">
                  <Button variant="ghost" size="icon" className="relative cursor-pointer">
                    <ShoppingCart className="h-5 w-5" />
                    {isMounted && itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full cursor-pointer"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer">
                          <User className="h-4 w-4 cursor-pointer" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/ar/admin" className="flex items-center cursor-pointer rtl:flex-row-reverse">
                          <LayoutDashboard className="ml-2 h-4 w-4 rtl:ml-2 rtl:mr-2" />
                          <span>لوحة التحكم</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/ar/orders" className="flex items-center cursor-pointer rtl:flex-row-reverse">
                        <Package className="ml-2 h-4 w-4 rtl:ml-2 rtl:mr-2" />
                        <span>طلباتي</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/ar/cart" className="flex items-center cursor-pointer rtl:flex-row-reverse">
                        <ShoppingCart className="ml-2 h-4 w-4 rtl:ml-2 rtl:mr-2" />
                        <span>سلة التسوق</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer rtl:flex-row-reverse">
                      <LogOut className="ml-2 h-4 w-4 rtl:ml-2 rtl:mr-2" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/ar/cart" className="cursor-pointer">
                  <Button variant="ghost" size="icon" className="relative cursor-pointer">
                    <ShoppingCart className="h-5 w-5" />
                    {isMounted && itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/ar/auth/signin">
                  <Button variant="outline" className="cursor-pointer">تسجيل الدخول</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>القائمة</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {session?.user && isAdmin && (
                    <Link
                      href="/ar/admin"
                      onClick={() => setIsOpen(false)}
                      className="text-base font-medium transition-colors hover:text-primary duration-200 py-2 border-b pb-4 flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      لوحة التحكم
                    </Link>
                  )}
                  <Link
                    href="/ar/products"
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary duration-200 py-2 border-b pb-4"
                  >
                    كل المنتجات
                  </Link>
                  <Link
                    href="/ar/about"
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary duration-200 py-2 border-b pb-4"
                  >
                    من نحن
                  </Link>
                  {categories.length > 0 && categories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div className="font-semibold text-lg">{category.name_ar}</div>
                      <div className="flex flex-col gap-2 pr-4">
                        {category.children?.map((child) => (
                          <Link
                            key={child.id}
                            href={`/ar/category/${child.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-base font-medium transition-colors hover:text-primary duration-200 py-1"
                          >
                            {child.name_ar}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

