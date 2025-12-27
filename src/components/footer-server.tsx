import Settings from '@/models/Settings';
import connectDB from '@/db/mongoose';
import { FooterClient } from './footer';

async function getContactInfo() {
  try {
    // Add timeout for connection
    const connectPromise = connectDB();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    const settings = await Settings.find({
      key: { $in: ['phone', 'email', 'address', 'google_maps_url'] }
    }).lean();

    const info: Record<string, string> = {};
    settings.forEach(setting => {
      info[setting.key] = setting.value;
    });

    return {
      phone: info.phone || '+966 50 123 4567',
      email: info.email || 'info@bikestore.com',
      address: info.address || 'المملكة العربية السعودية\nالرياض، حي العليا\nشارع الملك فهد',
      googleMapsUrl: info.google_maps_url || 'https://maps.app.goo.gl/jDiErmUTh2nqXRLBA?g_st=aw',
    };
  } catch (error) {
    return {
      phone: '+966 50 123 4567',
      email: 'info@bikestore.com',
      address: 'المملكة العربية السعودية\nالرياض، حي العليا\nشارع الملك فهد',
      googleMapsUrl: 'https://maps.app.goo.gl/jDiErmUTh2nqXRLBA?g_st=aw',
    };
  }
}

export async function FooterServer() {
  const contactInfo = await getContactInfo();
  return <FooterClient contactInfo={contactInfo} />;
}

