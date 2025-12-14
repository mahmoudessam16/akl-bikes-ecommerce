'use client';

import dynamic from 'next/dynamic';

// Lazy load CheckoutClient - heavy form component
const CheckoutClient = dynamic(() => import('@/components/checkout-client').then(mod => ({ default: mod.CheckoutClient })), {
  loading: () => (
    <div className="space-y-6">
      <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
      <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
    </div>
  ),
  ssr: false, // Checkout requires client-side state
});

export default function CheckoutPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
      <CheckoutClient />
    </main>
  );
}

