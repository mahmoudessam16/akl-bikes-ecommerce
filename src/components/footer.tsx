'use client';

import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';

interface FooterClientProps {
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    googleMapsUrl: string;
  };
}

export function FooterClient({ contactInfo }: FooterClientProps) {
  const phoneNumber = contactInfo.phone.replace(/[^0-9]/g, '');
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
                <Link href="/ar/about" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/ar/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/ar/cart" className="text-muted-foreground hover:text-primary transition-colors duration-200">
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
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                البريد:{' '}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-primary hover:underline transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">
                  <span className="block whitespace-pre-line mb-1">{contactInfo.address}</span>
                  <a
                    href={contactInfo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline transition-colors inline-flex items-center gap-1 text-xs"
                  >
                    عرض على الخريطة
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
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
