'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackToHomeButton() {
  const pathname = usePathname();

  if (!pathname) return null;

  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'ar';
  const isHome = segments.length === 1;

  if (isHome) return null;

  return (
    <div className="border-b bg-background/80">
      <div className="container mx-auto px-4 py-2 flex justify-start">
        <Link href={`/${locale}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 cursor-pointer"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-0 rotate-180" />
            <span>الرجوع للصفحة الرئيسية</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

