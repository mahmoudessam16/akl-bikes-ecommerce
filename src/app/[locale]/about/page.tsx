import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">من نحن</h1>
        <Card>
          <CardContent className="p-8 space-y-6">
            <p className="text-lg leading-relaxed">
              مرحباً بكم في متجر الدراجات، وجهتك الأولى لشراء الدراجات والإكسسوارات عالية الجودة.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              نحن متخصصون في توفير أفضل أنواع الدراجات من مختلف الفئات، بما في ذلك الدراجات الجبلية،
              دراجات الطريق، الدراجات الكهربائية، ودراجات الأطفال. كما نقدم مجموعة واسعة من
              الإكسسوارات والمعدات اللازمة لراكبي الدراجات.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              نسعى دائماً لتقديم أفضل خدمة عملاء وضمان جودة المنتجات التي نقدمها. فريقنا من
              الخبراء جاهز لمساعدتك في اختيار الدراجة المناسبة لك.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

