'use client';

import Link from 'next/link';

export function Footer() {
  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || '+966501234567';
  const phoneDisplay = storePhone.replace(/[^0-9+]/g, '').replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
  const phoneNumber = storePhone.replace(/[^0-9]/g, '');
  const whatsappLink = `https://wa.me/${phoneNumber}`;

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">عقل للدراجات الهوائية</h3>
            <p className="text-sm text-muted-foreground">
              أفضل متجر لبيع الدراجات والإكسسوارات في المنطقة
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ar/about" className="text-muted-foreground hover:text-foreground">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/ar/contact" className="text-muted-foreground hover:text-foreground">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/ar/cart" className="text-muted-foreground hover:text-foreground">
                  السلة
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">معلومات التواصل</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                الهاتف:{' '}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline transition-colors"
                >
                  {phoneDisplay}
                </a>
              </li>
              <li>البريد: info@bikestore.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} عقل للدراجات الهوائية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
