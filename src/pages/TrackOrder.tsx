import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, CreditCard, Truck, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/hooks/useOrders';

const statusConfig: Record<string, { color: string; icon: typeof Package; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Payment Pending' },
  paid: { color: 'bg-blue-100 text-blue-800', icon: CreditCard, label: 'Payment Confirmed' },
  packed: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Order Packed' },
  shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
};

const orderSteps = ['paid', 'packed', 'shipped', 'delivered'];

function OrderStatusTracker({ order }: { order: Order }) {
  const getCurrentStepIndex = (status: string) => orderSteps.indexOf(status);
  const config = statusConfig[order.status];
  const Icon = config?.icon || Package;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatPrice = (paise: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium text-lg">{config?.label || order.status}</p>
                <p className="text-sm text-muted-foreground">
                  Order #{order.order_number} • Placed on {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <Badge className={config?.color || 'bg-muted'}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          {order.status !== 'pending' && order.status !== 'cancelled' && (
            <div className="relative mt-8">
              <div className="flex justify-between">
                {orderSteps.map((step, index) => {
                  const currentIndex = getCurrentStepIndex(order.status);
                  const isCompleted = index <= currentIndex;
                  const stepConfig = statusConfig[step];
                  const StepIcon = stepConfig?.icon || Package;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <p className={`text-xs mt-2 text-center ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {stepConfig?.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(getCurrentStepIndex(order.status) / (orderSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {order.order_items && order.order_items.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Items ({order.order_items.length})
            </h3>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.product_snapshot.image} alt={item.product_snapshot.name} className="w-14 h-16 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.product_snapshot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                      {item.size && ` • Size: ${item.size}`}
                      {item.color && ` • ${item.color}`}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim().toUpperCase();
    if (!trimmed) {
      toast.error('Please enter your order number.');
      return;
    }

    setIsSearching(true);
    setTrackedOrder(null);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items (*)')
        .eq('order_number', trimmed)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTrackedOrder(data as unknown as Order);
      } else {
        toast.error('No order found with that number.');
      }
    } catch {
      toast.error('Could not look up that order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Track Order' }]}>
      <SEO title="Track Your Order | Vastra Boutique" description="Track your Vastra Boutique order status in real-time. Enter your order number to check delivery progress." />
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Track Your Order</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your order number to check the current status of your delivery.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-2xl mx-auto">
        <form onSubmit={handleTrack} className="flex gap-3">
          <Input
            placeholder="Enter Order Number (e.g., VB240301XXXX)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="text-center"
          />
          <Button type="submit" disabled={isSearching} className="shrink-0">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        {trackedOrder && (
          <div className="mt-8">
            <OrderStatusTracker order={trackedOrder} />
          </div>
        )}

        {searched && !isSearching && !trackedOrder && (
          <p className="text-center text-muted-foreground mt-8 text-sm">
            No order found. Please double-check the order number or <Link to="/contact" className="text-primary underline">contact us</Link> for help.
          </p>
        )}

        <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
          <p>You can also track your orders by logging into your account and visiting <Link to="/orders" className="text-primary underline">My Orders</Link>.</p>
        </div>
      </section>
    </InfoPageLayout>
  );
}
