import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="heading-display">Checkout</h1>
          </div>

          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              Checkout with Razorpay integration coming soon.
            </p>
            <p className="text-sm text-muted-foreground">
              Add items to your cart and proceed to checkout.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
