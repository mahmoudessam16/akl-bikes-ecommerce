import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const locale = 'ar';

  return (
    <Link href={`/${locale}/category/${category.slug}`} className="block">
      <Card className="group overflow-hidden hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 border-2 border-transparent hover-card-scale cursor-pointer">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name_ar}
                fill
                className="object-cover hover-image-zoom"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="text-4xl">🚴</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg text-center">{category.name_ar}</h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

