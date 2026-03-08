import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { formatPrice } from '@/hooks/useProducts';
import { getColorHex } from '@/lib/productUtils';
import { useCartStore } from '@/store/cartStore';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: primaryImage?.url || '',
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    });
    openCart();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: primaryImage?.url || '',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
          <img
            src={primaryImage?.url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNewArrival && <span className="badge-new">New</span>}
            {discountPercentage > 0 && (
              <span className="badge-sale">{discountPercentage}% Off</span>
            )}
            {product.isFeatured && !product.isNewArrival && (
              <span className="badge-trending">Trending</span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
              isWishlisted
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/90 text-foreground hover:bg-white'
            )}
          >
            <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
          </button>

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-white/95 text-foreground hover:bg-white shadow-medium"
              size="sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/95 hover:bg-white border-0 shadow-medium"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.categoryName}
          </p>
          <h3 className="font-serif font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && product.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'w-3.5 h-3.5',
                      i < Math.round(product.averageRating!)
                        ? 'text-gold fill-gold'
                        : 'text-muted fill-muted'
                    )}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            {product.discountPrice ? (
              <>
                <span className="font-semibold text-primary">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-semibold">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-border"
                  title={color}
                  style={{ backgroundColor: getColorHex(color) }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
