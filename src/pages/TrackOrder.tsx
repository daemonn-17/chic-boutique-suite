import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number.');
      return;
    }
    navigate('/orders');
    toast.info('Please log in to view your order details.');
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

      <section className="container-boutique section-padding max-w-lg mx-auto">
        <form onSubmit={handleTrack} className="space-y-4">
          <Input
            placeholder="Enter Order Number (e.g., VB-20240301-XXXXX)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="text-center"
          />
          <Button type="submit" className="w-full">
            <Search className="h-4 w-4 mr-2" /> Track Order
          </Button>
        </form>

        <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
          <p>You can also track your orders by logging into your account and visiting <a href="/orders" className="text-primary underline">My Orders</a>.</p>
          <p>Need help? <a href="/contact" className="text-primary underline">Contact us</a></p>
        </div>
      </section>
    </InfoPageLayout>
  );
}
