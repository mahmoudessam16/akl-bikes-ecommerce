import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartClient } from '@/components/cart-client';

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>
        <CartClient />
      </main>
      <Footer />
    </div>
  );
}

