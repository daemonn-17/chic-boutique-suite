import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/hooks/useProducts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  image_url: string;
}

export default function WishlistPage() {
  const { removeItem, clearWishlist, dbProductIds, localItems, isLoggedIn, itemCount } = useWishlist();
  const { addItem, openCart } = useCartStore();

  // For logged-in users, fetch product details for wishlisted IDs
  const { data: dbProducts = [], isLoading } = useQuery({
    queryKey: ['wishlist-products', dbProductIds],
    queryFn: async () => {
      if (dbProductIds.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, discount_price')
        .in('id', dbProductIds);
      if (error) throw error;

      // Fetch primary images
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, url')
        .in('product_id', dbProductIds)
        .eq('is_primary', true);

      const imageMap = new Map((images || []).map((img) => [img.product_id, img.url]));

      return (data || []).map((p) => ({
        ...p,
        image_url: imageMap.get(p.id) || '/placeholder.svg',
      })) as WishlistProduct[];
    },
    enabled: isLoggedIn && dbProductIds.length > 0,
  });

  const handleAddToCart = (product: { id: string; name: string; price: number; discount_price?: number | null; image: string }) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discount_price ?? undefined,
      image: product.image,
      size: undefined,
      color: undefined,
      quantity: 1,
    });
    removeItem(product.id);
    openCart();
  };

  // Render items based on auth state
  const renderItems = () => {
    if (isLoggedIn) {
      if (isLoading) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dbProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-card rounded-xl overflow-hidden shadow-soft"
            >
              <Link to={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[3/4]">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={(e) => { e.preventDefault(); removeItem(product.id); }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/products/${product.slug}`}>
                  <h3 className="font-serif font-medium hover:text-primary transition-colors line-clamp-2 mb-2">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-4">
                  {product.discount_price ? (
                    <>
                      <span className="font-semibold text-primary">{formatPrice(product.discount_price)}</span>
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="font-semibold">{formatPrice(product.price)}</span>
                  )}
                </div>
                <Button
                  onClick={() => handleAddToCart({ id: product.id, name: product.name, price: product.price, discount_price: product.discount_price, image: product.image_url })}
                  className="w-full" variant="outline"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    // Guest: render from local store
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {localItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-card rounded-xl overflow-hidden shadow-soft"
          >
            <Link to={`/products/${item.productId}`} className="block">
              <div className="relative aspect-[3/4]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button
                  onClick={(e) => { e.preventDefault(); removeItem(item.productId); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/products/${item.productId}`}>
                <h3 className="font-serif font-medium hover:text-primary transition-colors line-clamp-2 mb-2">{item.name}</h3>
              </Link>
              <div className="flex items-center gap-2 mb-4">
                {item.discountPrice ? (
                  <>
                    <span className="font-semibold text-primary">{formatPrice(item.discountPrice)}</span>
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(item.price)}</span>
                  </>
                ) : (
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                )}
              </div>
              <Button
                onClick={() => handleAddToCart({ id: item.productId, name: item.name, price: item.price, discount_price: item.discountPrice, image: item.image })}
                className="w-full" variant="outline"
              >
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="heading-display mb-4">My Wishlist</h1>
            <p className="text-body">
              {itemCount > 0
                ? `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your wishlist`
                : 'Your wishlist is empty'}
            </p>
          </motion.div>

          {itemCount === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-8">
                Start adding items to your wishlist by clicking the heart icon on products you love.
              </p>
              <Button asChild className="btn-hero">
                <Link to="/products">
                  Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-6">
                <Button variant="ghost" onClick={clearWishlist} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Clear Wishlist
                </Button>
              </div>
              {renderItems()}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
