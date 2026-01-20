import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/mockProducts';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  filter?: 'featured' | 'new' | 'all';
  limit?: number;
  showViewAll?: boolean;
}

export function FeaturedProducts({
  title = 'Trending Now',
  subtitle = 'CURATED FOR YOU',
  filter = 'featured',
  limit = 4,
  showViewAll = true,
}: FeaturedProductsProps) {
  const filteredProducts = products
    .filter((product) => {
      if (filter === 'featured') return product.isFeatured;
      if (filter === 'new') return product.isNewArrival;
      return true;
    })
    .slice(0, limit);

  return (
    <section className="section-padding">
      <div className="container-boutique">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <span className="text-sm uppercase tracking-widest text-primary font-medium">
              {subtitle}
            </span>
            <h2 className="heading-section mt-2">{title}</h2>
          </div>
          {showViewAll && (
            <Button asChild variant="link" className="text-primary group mt-4 md:mt-0">
              <Link to="/products">
                View All Collection
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
