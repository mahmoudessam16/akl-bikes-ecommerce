import { getCategories } from '@/lib/api/mock-data';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { NavbarClient } from './navbar-client';
import Settings from '@/models/Settings';
import connectDB from '@/db/mongoose';

async function getLogoUrl(): Promise<string> {
  try {
    await connectDB();
    const setting = await Settings.findOne({ key: 'logo_url' });
    return setting?.value || '/imgs/logo-light.PNG';
  } catch (error) {
    return '/imgs/logo-light.PNG';
  }
}

async function checkAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  return email === process.env.ADMIN_EMAIL;
}

export async function NavbarServer() {
  const [categories, logoUrl, session] = await Promise.all([
    getCategories(),
    getLogoUrl(),
    auth(),
  ]);

  const isAdmin = await checkAdmin(session?.user?.email);

  return (
    <NavbarClient
      categories={categories}
      logoUrl={logoUrl}
      session={session}
      isAdmin={isAdmin}
    />
  );
}

