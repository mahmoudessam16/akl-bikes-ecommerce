import { getCategories } from '@/lib/api/mock-data';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { NavbarClient } from './navbar-client';
import Settings from '@/models/Settings';
import connectDB from '@/db/mongoose';

async function getLogoUrl(): Promise<string> {
  try {
    // Add timeout for connection
    const connectPromise = connectDB();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    
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
  // Add timeout handling for build time
  let categories: any[] = [];
  let logoUrl = '/imgs/logo-light.PNG';
  let session: any = null;
  let isAdmin = false;

  try {
    const fetchPromise = Promise.all([
      getCategories(),
      getLogoUrl(),
      auth(),
    ]);

    // 15 second timeout for navbar data fetching
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Navbar data fetch timeout')), 15000);
    });

    const result = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]).catch(() => {
      // Return defaults if timeout or error occurs
      return [[], '/imgs/logo-light.PNG', null] as [any[], string, any];
    }) as [any[], string, any];

    [categories, logoUrl, session] = result;

    isAdmin = await checkAdmin(session?.user?.email);
  } catch (error) {
    // Gracefully handle errors - use defaults
    console.error('Error fetching navbar data:', error);
  }

  return (
    <NavbarClient
      categories={categories}
      logoUrl={logoUrl}
      session={session}
      isAdmin={isAdmin}
    />
  );
}

