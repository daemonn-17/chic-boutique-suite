import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface InfoPageLayoutProps {
  children: React.ReactNode;
}

export function InfoPageLayout({ children }: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
