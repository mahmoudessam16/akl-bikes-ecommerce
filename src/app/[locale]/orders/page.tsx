import { NavbarServer } from '@/components/navbar-server';
import { FooterServer } from '@/components/footer-server';
import { OrdersClient } from '@/components/orders-client';

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarServer />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <OrdersClient />
      </main>
      <FooterServer />
    </div>
  );
}

