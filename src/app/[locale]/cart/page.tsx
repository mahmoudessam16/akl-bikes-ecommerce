'use client';

import dynamic from 'next/dynamic';

// Lazy load CartClient - not needed for initial page load
const CartClient = dynamic(() => import('@/components/cart-client').then(mod => ({ default: mod.CartClient })), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
      <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
    </div>
  ),
  ssr: false, // Cart is client-side only
});

export default function CartPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>
      <CartClient />
    </main>
  );
}

