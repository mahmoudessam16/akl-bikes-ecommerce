import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CheckoutClient } from '@/components/checkout-client';

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
        <CheckoutClient />
      </main>
      <Footer />
    </div>
  );
}

