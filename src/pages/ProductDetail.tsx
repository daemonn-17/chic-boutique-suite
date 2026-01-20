import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
  Shield,
  Star,
  Minus,
  Plus,
  Share2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { products, formatPrice } from '@/data/mockProducts';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="section-padding">
          <div className="container-boutique text-center">
            <h1 className="heading-section mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0]?.url || '',
      size: selectedSize || product.sizes[0],
      color: selectedColor || product.colors[0],
      quantity,
    });
    openCart();
  };

  const handleWishlistToggle = () => {
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0]?.url || '',
    });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const getColorHex = (colorName: string): string => {
    const colors: Record<string, string> = {
      'maroon': '#800000',
      'royal blue': '#4169E1',
      'emerald green': '#50C878',
      'dusty pink': '#D4A5A5',
      'sage green': '#9DC183',
      'powder blue': '#B0E0E6',
      'deep red': '#8B0000',
      'royal magenta': '#8B008B',
      'midnight black': '#191970',
      'champagne gold': '#F7E7CE',
      'wine': '#722F37',
      'off white': '#FAF9F6',
      'peach': '#FFDAB9',
      'sky blue': '#87CEEB',
      'white': '#FFFFFF',
      'light pink': '#FFB6C1',
      'mint green': '#98FF98',
      'black': '#000000',
      'navy blue': '#000080',
      'burgundy': '#800020',
      'gold with green': '#DAA520',
      'gold with red': '#DAA520',
      'gold with blue': '#DAA520',
    };
    return colors[colorName.toLowerCase()] || '#888888';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <span>/</span>
            <Link
              to={`/products?category=${product.categoryName.toLowerCase()}`}
              className="hover:text-primary transition-colors"
            >
              {product.categoryName}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <img
                  src={product.images[selectedImageIndex]?.url}
                  alt={product.images[selectedImageIndex]?.alt}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-medium"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-medium"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNewArrival && <span className="badge-new">New</span>}
                  {discountPercentage > 0 && (
                    <span className="badge-sale">{discountPercentage}% Off</span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors',
                        selectedImageIndex === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-border'
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Title & Rating */}
              <div>
                <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">
                  {product.categoryName}
                </p>
                <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
                  {product.name}
                </h1>

                {product.averageRating && (
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-5 h-5',
                            i < Math.round(product.averageRating!)
                              ? 'text-gold fill-gold'
                              : 'text-muted fill-muted'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.averageRating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-semibold text-primary">
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-destructive font-medium">
                      Save {formatPrice(product.price - product.discountPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-body leading-relaxed">{product.description}</p>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">
                    Color:{' '}
                    <span className="text-muted-foreground font-normal">
                      {selectedColor || product.colors[0]}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all',
                          (selectedColor || product.colors[0]) === color
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        )}
                        style={{ backgroundColor: getColorHex(color) }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes.length > 0 && product.sizes[0] !== 'Free Size' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">
                      Size:{' '}
                      <span className="text-muted-foreground font-normal">
                        {selectedSize || 'Select a size'}
                      </span>
                    </h3>
                    <button className="text-sm text-primary hover:underline">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          'min-w-[48px] h-12 px-4 rounded-md border text-sm font-medium transition-all',
                          (selectedSize || product.sizes[0]) === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-hero"
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>

                {/* Wishlist */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={cn(
                    'h-12 w-12 shrink-0',
                    isWishlisted && 'border-primary text-primary'
                  )}
                >
                  <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
                </Button>

                {/* Share */}
                <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Stock Status */}
              {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                <p className="text-sm text-destructive">
                  Only {product.stockQuantity} left in stock - order soon!
                </p>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">15-Day Returns</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="pt-6 border-t border-border space-y-3">
                <h3 className="font-serif font-semibold text-lg">Product Details</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">SKU</dt>
                    <dd className="font-medium">{product.sku}</dd>
                  </div>
                  {product.material && (
                    <div>
                      <dt className="text-muted-foreground">Material</dt>
                      <dd className="font-medium">{product.material}</dd>
                    </div>
                  )}
                  {product.pattern && (
                    <div>
                      <dt className="text-muted-foreground">Pattern</dt>
                      <dd className="font-medium">{product.pattern}</dd>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <dt className="text-muted-foreground">Brand</dt>
                      <dd className="font-medium">{product.brand}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </motion.div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="heading-section mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {similarProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
