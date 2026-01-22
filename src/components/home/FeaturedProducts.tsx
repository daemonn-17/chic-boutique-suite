import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useFeaturedProducts, useNewArrivals, formatPrice, getPrimaryImage, getDiscountPercent } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

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
  const featuredQuery = useFeaturedProducts(limit);
  const newArrivalsQuery = useNewArrivals(limit);
  
  const { data: products, isLoading } = filter === 'new' ? newArrivalsQuery : featuredQuery;

  // Transform DB products to ProductCard format
  const transformedProducts = products?.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.price / 100,
    discountPrice: p.discount_price ? p.discount_price / 100 : undefined,
    stockQuantity: p.stock_qty,
    sku: p.sku,
    categoryId: p.category_id || '',
    categoryName: p.categories?.name || '',
    colors: p.colors || [],
    sizes: p.sizes || [],
    images: p.product_images?.map(img => ({ id: img.id, url: img.url, alt: p.name, isPrimary: img.is_primary })) || [],
    material: p.material || '',
    pattern: p.pattern || '',
    brand: p.brand || '',
    tags: p.tags || [],
    isFeatured: p.is_featured,
    isNewArrival: p.is_new_arrival,
    averageRating: p.average_rating || 0,
    reviewCount: p.review_count || 0,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  })) || [];

  return (
    <section className="section-padding">
      <div className="container-boutique">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <span className="text-sm uppercase tracking-widest text-primary font-medium">{subtitle}</span>
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

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {transformedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
