import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/hooks/useProducts';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (item: typeof items[0]) => {
    // Add to cart with default size/color from wishlist item
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice,
      image: item.image,
      size: undefined, // User can select on product page or cart
      color: undefined,
      quantity: 1,
    });
    removeItem(item.productId);
    openCart();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="heading-display mb-4">My Wishlist</h1>
            <p className="text-body">
              {items.length > 0
                ? `You have ${items.length} item${items.length > 1 ? 's' : ''} in your wishlist`
                : 'Your wishlist is empty'}
            </p>
          </motion.div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-8">
                Start adding items to your wishlist by clicking the heart icon on products you love.
              </p>
              <Button asChild className="btn-hero">
                <Link to="/products">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Clear All Button */}
              <div className="flex justify-end mb-6">
                <Button variant="ghost" onClick={clearWishlist} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Wishlist
                </Button>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card rounded-xl overflow-hidden shadow-soft"
                  >
                    <Link to={`/products/${item.productId}`} className="block">
                      <div className="relative aspect-[3/4]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeItem(item.productId);
                          }}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link to={`/products/${item.productId}`}>
                        <h3 className="font-serif font-medium hover:text-primary transition-colors line-clamp-2 mb-2">
                          {item.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-4">
                        {item.discountPrice ? (
                          <>
                            <span className="font-semibold text-primary">
                              {formatPrice(item.discountPrice)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold">{formatPrice(item.price)}</span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="w-full"
                        variant="outline"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
