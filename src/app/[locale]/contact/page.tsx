import { NavbarServer } from '@/components/navbar-server';
import { FooterServer } from '@/components/footer-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactServer } from '@/components/contact-server';

export default async function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarServer />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">اتصل بنا</h1>
        <ContactServer />
      </main>
      <FooterServer />
    </div>
  );
}

