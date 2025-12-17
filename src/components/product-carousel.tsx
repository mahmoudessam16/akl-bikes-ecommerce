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

      {/* Responsive grid like Amazon: no horizontal slider */}
      <MotionDiv
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product, index) => (
          <MotionDiv
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-full"
          >
            <ProductCard product={product} />
          </MotionDiv>
        ))}
      </MotionDiv>
    </section>
  );
}

