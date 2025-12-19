'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Menu, ShoppingCart, ChevronDown, ChevronUp, User, LogOut, Package, LayoutDashboard, Home, ArrowRight, MoreVertical, Search, X } from 'lucide-react';
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
import type { Category, Product } from '@/types';
import { Input } from '@/components/ui/input';

interface NavbarClientProps {
  categories: Category[];
  logoUrl: string;
  session: Session | null;
  isAdmin: boolean;
}

export function NavbarClient({ categories, logoUrl, session, isAdmin }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((state) => state.getItemCount());
  const pathname = usePathname();
  
  // Check if we're on home page
  const isHomePage = pathname === '/ar' || pathname === '/ar/';
  
  // For medium screens (1024px - 1250px): show only first category, rest in "More" menu
  // For larger screens (>1250px): show all categories normally
  const firstCategory: Category | null = categories.length > 0 ? categories[0] : null;
  const remainingCategories: Category[] = firstCategory 
    ? categories.filter((cat: Category) => cat.id !== firstCategory.id)
    : categories;

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

  // Search functionality with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    // Debounce: wait 500ms after user stops typing
    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.products || []);
        setIsSearchOpen(true);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Increased debounce time to 500ms

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
      }
    };

    // Add event listener when search is open
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/ar' });
  };

  return (
    <>
      <nav 
        className="main-navbar sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        suppressHydrationWarning
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile: Back to Home Button (Left side) */}
            {!isHomePage && (
              <Link href="/ar" className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowRight className="h-4 w-4 rtl:rotate-0 rotate-180" />
                <span className="hidden sm:inline">الرئيسية</span>
              </Link>
            )}
            {isHomePage && <div className="lg:hidden w-0"></div>}
            
            {/* Logo */}
            <Link href="/ar" className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">
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

            {/* Search Bar - Visible on screens up to 1024px */}
            <div className="flex lg:hidden flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
              <div className="relative w-full">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-auto rtl:left-2" />
                <Input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setIsSearchOpen(true)}
                  className="pr-7 rtl:pl-8 h-9 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearchOpen(false);
                    }}
                    className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-2"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {isSearchOpen && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 sm:right-0 mt-2 bg-background border w-[250px] sm:w-full rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        جاري البحث...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/ar/product/${product.slug}`}
                            onClick={() => {
                              setSearchQuery('');
                              setSearchResults([]);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                          >
                            {product.images && product.images.length > 0 && (
                              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                                <Image
                                  src={product.images[0]}
                                  alt={product.title_ar}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.title_ar}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.price.toLocaleString('ar-EG')} جنيه
                              </p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/ar/products?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setIsSearchOpen(false);
                          }}
                          className="block p-3 text-center text-sm font-medium text-primary hover:bg-muted border-t"
                        >
                          عرض جميع النتائج
                        </Link>
                      </>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        لا توجد نتائج
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

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
            
            {/* First category - always show */}
            {firstCategory && (
              firstCategory.children && firstCategory.children.length > 0 ? (
                <Popover
                  key={firstCategory.id}
                  open={openPopovers[firstCategory.id]}
                  onOpenChange={(open) =>
                    setOpenPopovers((prev) => ({ ...prev, [firstCategory.id]: open }))
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-base font-medium relative cursor-pointer"
                    >
                      {firstCategory.name_ar}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end" side="bottom" sideOffset={8}>
                    <div className="flex flex-col gap-1">
                      {firstCategory.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/ar/category/${child.slug}`}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                          onClick={() =>
                            setOpenPopovers((prev) => ({
                              ...prev,
                              [firstCategory.id]: false,
                            }))
                          }
                        >
                          {child.name_ar}
                        </Link>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link key={firstCategory.id} href={`/ar/category/${firstCategory.slug}`}>
                  <Button variant="ghost" className="text-base font-medium cursor-pointer">
                    {firstCategory.name_ar}
                  </Button>
                </Link>
              )
            )}

            {/* More menu for medium screens (1024px - 1250px) - shows remaining categories */}
            {remainingCategories.length > 0 && (
              <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden cursor-pointer"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-[80vh] overflow-y-auto" side="bottom" sideOffset={8}>
                  {remainingCategories.map((category) => (
                    <div key={category.id}>
                      {category.children && category.children.length > 0 ? (
                        <>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {category.name_ar}
                          </div>
                          {category.children.map((child) => (
                            <DropdownMenuItem asChild key={child.id}>
                              <Link
                                href={`/ar/category/${child.slug}`}
                                className="flex items-center cursor-pointer rtl:flex-row-reverse"
                                onClick={() => setIsMoreMenuOpen(false)}
                              >
                                <span className="pr-2 rtl:pr-0 rtl:pl-2">•</span>
                                <span>{child.name_ar}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          {remainingCategories.indexOf(category) < remainingCategories.length - 1 && (
                            <DropdownMenuSeparator />
                          )}
                        </>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/ar/category/${category.slug}`}
                            className="flex items-center cursor-pointer"
                            onClick={() => setIsMoreMenuOpen(false)}
                          >
                            {category.name_ar}
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* All remaining categories for large screens (>1250px) */}
            <div className="hidden xl:flex items-center gap-6">
              {remainingCategories.map((category) => (
                category.children && category.children.length > 0 ? (
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
                        className="flex items-center gap-1 text-base font-medium relative cursor-pointer"
                      >
                        {category.name_ar}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="end" side="bottom" sideOffset={8}>
                      <div className="flex flex-col gap-1">
                        {category.children.map((child) => (
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
                ) : (
                  <Link key={category.id} href={`/ar/category/${category.slug}`}>
                    <Button variant="ghost" className="text-base font-medium cursor-pointer">
                      {category.name_ar}
                    </Button>
                  </Link>
                )
              ))}
            </div>

            <Link href="/ar/about">
              <Button variant="ghost" className="text-base font-medium cursor-pointer">
                من نحن
              </Button>
            </Link>
          </div>

          {/* Right side - Auth, Cart and Menu - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4" suppressHydrationWarning>
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
                  <DropdownMenuContent align="end" className="w-56" side="bottom" sideOffset={8}>
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
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Menu Sheet - Accessible from bottom nav */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>القائمة</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Link
              href="/ar"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium transition-colors hover:text-primary duration-200 py-2 border-b pb-4"
            >
              الصفحة الرئيسية
            </Link>
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
              <div key={category.id} className="border-b pb-2">
                <button
                  onClick={() =>
                    setExpandedCategories((prev) => ({
                      ...prev,
                      [category.id]: !prev[category.id],
                    }))
                  }
                  className="w-full flex items-center justify-between text-base font-semibold py-2 hover:text-primary transition-colors duration-200"
                >
                  <span>{category.name_ar}</span>
                  {expandedCategories[category.id] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedCategories[category.id] && category.children && (
                  <div className="flex flex-col gap-2 pr-4 mt-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/ar/category/${child.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium transition-colors hover:text-primary duration-200 py-1"
                      >
                        {child.name_ar}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home Button */}
        <Link href="/ar" className="flex flex-col items-center justify-center flex-1 gap-1 py-2">
          <Home className="h-5 w-5" />
          <span className="text-xs">الرئيسية</span>
        </Link>

        {/* Account Button */}
        {session?.user ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-1 py-2 relative">
            <Popover open={isAccountMenuOpen} onOpenChange={setIsAccountMenuOpen}>
              <PopoverTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1">
                  <User className="h-5 w-5" />
                  <span className="text-xs">حسابك</span>
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-48 mb-2 p-2" align="center">
                <div className="flex flex-col gap-1">
                  <Link
                    href="/ar/orders"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-200 rtl:flex-row-reverse"
                  >
                    <Package className="h-4 w-4" />
                    <span>طلباتي</span>
                  </Link>
                  <Link
                    href="/ar/cart"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-200 rtl:flex-row-reverse"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>السلة</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-200 rtl:flex-row-reverse text-right w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Link href="/ar/auth/signin" className="flex flex-col items-center justify-center flex-1 gap-1 py-2">
            <User className="h-5 w-5" />
            <span className="text-xs">حسابك</span>
          </Link>
        )}

        {/* Cart Button */}
        <Link href="/ar/cart" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 relative">
          <ShoppingCart className="h-5 w-5" />
          {isMounted && itemCount > 0 && (
            <span className="absolute top-1 left-1/2 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {itemCount}
            </span>
          )}
          <span className="text-xs">العربة</span>
        </Link>

        {/* Search Button - Mobile only */}
        <button
          onClick={() => {
            // Navigate to products page with search
            window.location.href = '/ar/products';
          }}
          className="flex flex-col items-center justify-center flex-1 gap-1 py-2"
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">بحث</span>
        </button>

        {/* Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center flex-1 gap-1 py-2"
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs">القائمة</span>
        </button>
      </div>
    </nav>
    </>
  );
}
