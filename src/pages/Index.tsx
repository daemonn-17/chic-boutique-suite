import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromoSection } from '@/components/home/PromoSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <FeaturedProducts 
          title="Trending Now"
          subtitle="CURATED FOR YOU"
          filter="featured"
          limit={4}
        />
        <PromoSection />
        <FeaturedProducts 
          title="New Arrivals"
          subtitle="FRESH OFF THE LOOM"
          filter="new"
          limit={4}
        />
        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
