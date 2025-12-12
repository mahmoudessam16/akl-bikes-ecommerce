import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">اتصل بنا</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">الهاتف</h3>
                <p className="text-muted-foreground">+966 50 123 4567</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">البريد الإلكتروني</h3>
                <p className="text-muted-foreground">info@bikestore.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">ساعات العمل</h3>
                <p className="text-muted-foreground">
                  السبت - الخميس: 9:00 ص - 9:00 م<br />
                  الجمعة: 2:00 م - 9:00 م
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>العنوان</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                المملكة العربية السعودية<br />
                الرياض، حي العليا<br />
                شارع الملك فهد
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

