import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/data/mockProducts';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    coupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    setCouponError('');
    // Mock coupon validation
    const validCoupons: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
      'FIRST10': { discount: 10, type: 'percentage' },
      'FLAT500': { discount: 500, type: 'fixed' },
      'SAVE20': { discount: 20, type: 'percentage' },
    };

    const foundCoupon = validCoupons[couponCode.toUpperCase()];
    if (foundCoupon) {
      applyCoupon({ code: couponCode.toUpperCase(), ...foundCoupon });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const shipping = subtotal >= 2999 ? 0 : 199;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/50 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-xl font-semibold">Your Cart</h2>
                <span className="text-sm text-muted-foreground">({items.length} items)</span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-serif text-xl mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Discover our beautiful collection and add your favorites
                  </p>
                  <Button onClick={closeCart} asChild>
                    <Link to="/products">Continue Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 pb-6 border-b border-border"
                    >
                      <Link
                        to={`/products/${item.productId}`}
                        className="shrink-0"
                        onClick={closeCart}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-32 object-cover rounded-md"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-serif font-medium hover:text-primary transition-colors line-clamp-2"
                          onClick={closeCart}
                        >
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
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

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-border rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 bg-muted/30">
                {/* Coupon Section */}
                <div className="mb-6">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-success" />
                        <span className="font-medium">{coupon.code}</span>
                        <span className="text-sm text-muted-foreground">
                          ({coupon.type === 'percentage' ? `${coupon.discount}%` : formatPrice(coupon.discount)} off)
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-sm text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-sm text-destructive mt-2">{couponError}</p>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(2999 - subtotal)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(total + shipping)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full btn-hero" asChild>
                    <Link to="/checkout" onClick={closeCart}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
