import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  Zap, 
  Package, 
  ShieldCheck,
  Plus,
  Check,
  Tag,
  Loader2
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { useCheckout } from '@/hooks/useCheckout';
import { formatPrice } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, coupon, getSubtotal, getDiscount, applyCoupon, removeCoupon } = useCartStore();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { initiateCheckout, isProcessing } = useCheckout();
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Set default address on load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
    }
  }, [items.length, navigate]);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingCost = subtotal >= 299900 ? 0 : (deliveryType === 'express' ? 29900 : 19900);
  const total = subtotal - discount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponError('');
    setIsApplyingCoupon(true);
    
    try {
      // Call the real validate_coupon RPC function
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: couponCode.trim().toUpperCase(),
        p_subtotal: subtotal,
      });

      if (error) {
        console.error('Coupon validation error:', error);
        setCouponError('Failed to validate coupon');
        return;
      }

      const result = data?.[0];
      
      if (result?.valid) {
        // Calculate discount type based on the coupon data
        applyCoupon({ 
          code: couponCode.toUpperCase(), 
          discount: result.discount,
          type: 'fixed', // The RPC returns calculated discount amount
        });
        setCouponCode('');
        toast.success(result.message || 'Coupon applied successfully!');
      } else {
        setCouponError(result?.message || 'Invalid coupon code');
      }
    } catch (err) {
      console.error('Coupon error:', err);
      setCouponError('Failed to validate coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    initiateCheckout(
      {
        items,
        addressId: selectedAddressId,
        deliveryType,
        couponCode: coupon?.code,
      },
      (orderNumber) => {
        navigate(`/order-success?order=${orderNumber}`);
      },
      (error) => {
        toast.error(error);
      }
    );
  };

  const selectedAddress = addresses?.find(a => a.id === selectedAddressId);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="heading-display text-2xl md:text-3xl">Checkout</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Address & Delivery */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {addressesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : addresses && addresses.length > 0 ? (
                    <RadioGroup 
                      value={selectedAddressId} 
                      onValueChange={setSelectedAddressId}
                      className="space-y-3"
                    >
                      {addresses.map((address) => (
                        <motion.div
                          key={address.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Label
                            htmlFor={address.id}
                            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedAddressId === address.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{address.full_name}</span>
                                {address.is_default && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Phone: {address.phone}
                              </p>
                            </div>
                            {selectedAddressId === address.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No saved addresses found</p>
                      <Button asChild variant="outline">
                        <Link to="/profile">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  {addresses && addresses.length > 0 && (
                    <Button asChild variant="ghost" className="mt-4" size="sm">
                      <Link to="/profile">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5 text-primary" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={deliveryType} 
                    onValueChange={(value) => setDeliveryType(value as 'standard' | 'express')}
                    className="space-y-3"
                  >
                    <Label
                      htmlFor="standard"
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        deliveryType === 'standard' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="standard" id="standard" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">Standard Delivery</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          5-7 business days • {subtotal >= 299900 ? 'Free' : formatPrice(19900)}
                        </p>
                      </div>
                      {deliveryType === 'standard' && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </Label>

                    <Label
                      htmlFor="express"
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        deliveryType === 'express' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="express" id="express" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Express Delivery</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          2-3 business days • {subtotal >= 299900 ? 'Free' : formatPrice(29900)}
                        </p>
                      </div>
                      {deliveryType === 'express' && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                  </RadioGroup>

                  {subtotal < 299900 && (
                    <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Add {formatPrice(299900 - subtotal)} more for free delivery
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Order Items Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Order Items</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/products">Edit Cart</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                          {(item.size || item.color) && (
                            <p className="text-xs text-muted-foreground">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatPrice((item.discountPrice ?? item.price) * item.quantity)}
                          </p>
                          {item.discountPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Coupon Section */}
                    {coupon ? (
                      <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-success" />
                          <span className="font-medium text-sm">{coupon.code}</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon}
                        >
                          {isApplyingCoupon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-destructive">{couponError}</p>
                    )}

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-3">
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
                        <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button 
                      className="w-full btn-hero mt-4" 
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !selectedAddressId}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5 mr-2" />
                          Pay {formatPrice(total)}
                        </>
                      )}
                    </Button>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Secured by Razorpay</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
