import { NavbarServer } from '@/components/navbar-server';
import { FooterServer } from '@/components/footer-server';
import { CheckoutClient } from '@/components/checkout-client';

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarServer />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
        <CheckoutClient />
      </main>
      <FooterServer />
    </div>
  );
}

