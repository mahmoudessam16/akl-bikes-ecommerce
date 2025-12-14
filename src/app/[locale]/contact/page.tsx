import dynamic from 'next/dynamic';

// Lazy load ContactServer - not critical for initial render
const ContactServer = dynamic(() => import('@/components/contact-server').then(mod => ({ default: mod.ContactServer })), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
      <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
    </div>
  ),
  ssr: true,
});

export default async function ContactPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">اتصل بنا</h1>
      <ContactServer />
    </main>
  );
}

