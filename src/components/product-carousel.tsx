'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './product-card';
import type { Product } from '@/types';

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
        <motion.div
          className="flex gap-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="min-w-[280px] sm:min-w-[300px]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

