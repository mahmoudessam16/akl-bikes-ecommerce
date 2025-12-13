import { NavbarServer } from '@/components/navbar-server';
import { FooterServer } from '@/components/footer-server';
import { CartClient } from '@/components/cart-client';

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarServer />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>
        <CartClient />
      </main>
      <FooterServer />
    </div>
  );
}

