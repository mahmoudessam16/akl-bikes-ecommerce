import { MainLoading } from './main-loading';
import Settings from '@/models/Settings';
import connectDB from '@/db/mongoose';

async function getLogoUrl(): Promise<string> {
  try {
    await connectDB();
    const setting = await Settings.findOne({ key: 'logo_url' });
    return setting?.value || '/imgs/logo-light.PNG';
  } catch (error) {
    console.error('Error fetching logo:', error);
    return '/imgs/logo-light.PNG';
  }
}

export async function MainLoadingServer() {
  const logoUrl = await getLogoUrl();
  return <MainLoading logoUrl={logoUrl} />;
}

