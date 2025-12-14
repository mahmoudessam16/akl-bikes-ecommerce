import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">من نحن</h1>
      <Card>
        <CardContent className="p-8 space-y-6">
          <p className="text-lg leading-relaxed">
            مرحباً بكم في <span className="font-bold text-primary text-xl">عقل للدراجات الهوائية</span>، وجهتكم المتخصصة لكل ما يخص الدراجات وعربيات الأطفال والبيبي والسكوترات.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            نوفر مجموعة متكاملة من الدراجات الهوائية بمختلف أنواعها، إلى جانب عربيات الأطفال، مستلزمات البيبي،
            السكوترات، وقطع غيار الدراجات الأصلية. نحرص على تقديم منتجات عملية، آمنة، ومناسبة لجميع الأعمار.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            هدفنا هو تقديم تجربة شراء موثوقة وسهلة، مع جودة عالية وأسعار مناسبة. فريق عقل جاهز دائماً
            لمساعدتك في اختيار المنتج الأنسب لاحتياجاتك وضمان أفضل قيمة مقابل السعر.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

