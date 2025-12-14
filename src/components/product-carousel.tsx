'use client';

import dynamic from 'next/dynamic';
import { ProductCard } from './product-card';
import type { Product } from '@/types';

// Lazy load framer-motion to reduce initial bundle size
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
);

interface ProductCarouselProps {
  products: Product[];
  title?: string;
}

export function ProductCarousel({ products, title }: ProductCarouselProps) {
  return (
    <section className="py-8">
      {title && (
        <h2 className="text-2xl font-bold mb-6 px-4">{title}</h2>
      )}
      <div className="overflow-hidden">
        <MotionDiv
          className="flex gap-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {products.map((product, index) => (
              <MotionDiv
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="min-w-[280px] sm:min-w-[300px]"
              >
                <ProductCard product={product} />
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}

