import Settings from '@/models/Settings';
import connectDB from '@/db/mongoose';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

async function getContactInfo() {
  try {
    await connectDB();
    const settings = await Settings.find({
      key: { $in: ['phone', 'email', 'address', 'working_hours', 'google_maps_url'] }
    }).lean();

    const info: Record<string, string> = {};
    settings.forEach(setting => {
      info[setting.key] = setting.value;
    });

    return {
      phone: info.phone || '+966 50 123 4567',
      email: info.email || 'info@bikestore.com',
      address: info.address || 'المملكة العربية السعودية\nالرياض، حي العليا\nشارع الملك فهد',
      workingHours: info.working_hours || 'السبت - الخميس: 9:00 ص - 9:00 م\nالجمعة: 2:00 م - 9:00 م',
      googleMapsUrl: info.google_maps_url || 'https://maps.app.goo.gl/jDiErmUTh2nqXRLBA?g_st=aw',
    };
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return {
      phone: '+966 50 123 4567',
      email: 'info@bikestore.com',
      address: 'المملكة العربية السعودية\nالرياض، حي العليا\nشارع الملك فهد',
      workingHours: 'السبت - الخميس: 9:00 ص - 9:00 م\nالجمعة: 2:00 م - 9:00 م',
      googleMapsUrl: 'https://maps.app.goo.gl/jDiErmUTh2nqXRLBA?g_st=aw',
    };
  }
}

export async function ContactServer() {
  const contactInfo = await getContactInfo();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>معلومات التواصل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">الهاتف</h3>
            <p className="text-muted-foreground">{contactInfo.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">البريد الإلكتروني</h3>
            <p className="text-muted-foreground">{contactInfo.email}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">ساعات العمل</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {contactInfo.workingHours}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>العنوان</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground whitespace-pre-line">
            {contactInfo.address}
          </p>
          <a
            href={contactInfo.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline transition-colors text-sm font-medium"
          >
            <MapPin className="h-4 w-4" />
            عرض على Google Maps
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

