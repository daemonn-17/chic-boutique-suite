import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Truck, 
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrder } from '@/hooks/useOrders';

const statusConfig: Record<string, { 
  color: string; 
  icon: typeof Package;
  label: string;
}> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Payment Pending' },
  paid: { color: 'bg-blue-100 text-blue-800', icon: CreditCard, label: 'Payment Confirmed' },
  packed: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Order Packed' },
  shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
};

const orderSteps = ['paid', 'packed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(orderId || '');

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCurrentStepIndex = (status: string) => {
    const index = orderSteps.indexOf(status);
    return index >= 0 ? index : -1;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="section-padding">
          <div className="container-boutique max-w-4xl text-center py-16">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-medium mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">
              This order doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link to="/orders">Back to Orders</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="heading-display text-2xl md:text-3xl">Order Details</h1>
              {order && (
                <p className="text-muted-foreground text-sm mt-1">
                  Order #{order.order_number}
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : order ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const config = statusConfig[order.status];
                        const Icon = config?.icon || Package;
                        return (
                          <>
                            <Icon className="h-6 w-6 text-primary" />
                            <div>
                              <p className="font-medium text-lg">{config?.label || order.status}</p>
                              <p className="text-sm text-muted-foreground">
                                Ordered on {formatDate(order.created_at)}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <Badge className={statusConfig[order.status]?.color || 'bg-gray-100'}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Progress Steps */}
                  {order.status !== 'pending' && order.status !== 'cancelled' && (
                    <div className="relative mt-8">
                      <div className="flex justify-between">
                        {orderSteps.map((step, index) => {
                          const currentIndex = getCurrentStepIndex(order.status);
                          const isCompleted = index <= currentIndex;
                          const config = statusConfig[step];
                          const Icon = config?.icon || Package;
                          
                          return (
                            <div key={step} className="flex flex-col items-center flex-1">
                              <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                                  isCompleted 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <p className={`text-xs mt-2 text-center ${
                                isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                              }`}>
                                {config?.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ 
                            width: `${(getCurrentStepIndex(order.status) / (orderSteps.length - 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    Order Items ({order.order_items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.product_snapshot.image}
                          alt={item.product_snapshot.name}
                          className="w-20 h-24 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-1">{item.product_snapshot.name}</h4>
                          {(item.size || item.color) && (
                            <p className="text-sm text-muted-foreground">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-medium mt-1">{formatPrice(item.unit_price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium">{order.address_snapshot.full_name}</p>
                    <p className="text-muted-foreground">
                      {order.address_snapshot.address_line_1}
                      {order.address_snapshot.address_line_2 && `, ${order.address_snapshot.address_line_2}`}
                    </p>
                    <p className="text-muted-foreground">
                      {order.address_snapshot.city}, {order.address_snapshot.state} - {order.address_snapshot.pincode}
                    </p>
                    <p className="text-muted-foreground mt-1">Phone: {order.address_snapshot.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                      <span>-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Shipping ({order.delivery_type === 'express' ? 'Express' : 'Standard'})
                    </span>
                    <span>{order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                  </div>
                  {order.razorpay_payment_id && (
                    <p className="text-xs text-muted-foreground pt-2">
                      Payment ID: {order.razorpay_payment_id}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/orders">Back to Orders</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
