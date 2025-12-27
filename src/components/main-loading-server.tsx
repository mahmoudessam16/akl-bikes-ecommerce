import { MainLoading } from './main-loading';
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

export async function MainLoadingServer() {
  const logoUrl = await getLogoUrl();
  return <MainLoading logoUrl={logoUrl} />;
}

