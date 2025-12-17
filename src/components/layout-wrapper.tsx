import { NavbarServer } from '@/components/navbar-server';
import { FooterServer } from '@/components/footer-server';
import { BackToHomeButton } from '@/components/back-to-home-button';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  // Always render Navbar and Footer
  // The admin layout will handle hiding them if needed
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarServer />
      <BackToHomeButton />
      {children}
      <FooterServer />
    </div>
  );
}
