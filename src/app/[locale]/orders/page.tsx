'use client';

import dynamic from 'next/dynamic';

// Lazy load OrdersClient - not needed for initial page load
const OrdersClient = dynamic(() => import('@/components/orders-client').then(mod => ({ default: mod.OrdersClient })), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-12 bg-muted animate-pulse rounded"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    </div>
  ),
  ssr: false, // Orders require client-side auth check
});

export default function OrdersPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
      <OrdersClient />
    </main>
  );
}

