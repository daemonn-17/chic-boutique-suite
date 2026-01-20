import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PromoSection() {
  return (
    <section className="section-padding">
      <div className="container-boutique">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Promo 1 - Large */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-auto md:row-span-2"
          >
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop"
              alt="Saree Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <span className="inline-block bg-gold text-charcoal text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Up to 40% Off
              </span>
              <h3 className="font-serif text-3xl md:text-4xl text-cream mb-4">
                Bridal Saree Collection
              </h3>
              <p className="text-cream/80 mb-6 max-w-sm">
                Discover our exquisite range of handwoven Banarasi and Kanjeevaram sarees
              </p>
              <Button asChild className="btn-gold group">
                <Link to="/products?category=sarees">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Promo 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl aspect-video md:aspect-auto"
          >
            <img
              src="https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&h=500&fit=crop"
              alt="Kurti Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 to-transparent" />
            <div className="absolute inset-0 flex items-center p-8">
              <div>
                <span className="text-cream/70 text-sm uppercase tracking-wider">
                  New Collection
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-cream mt-2 mb-4">
                  Designer Kurtis
                </h3>
                <Button asChild variant="outline" className="border-cream text-cream hover:bg-cream hover:text-charcoal">
                  <Link to="/products?category=kurtis">
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Promo 3 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl aspect-video md:aspect-auto"
          >
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=500&fit=crop"
              alt="Accessories"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-charcoal/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-end p-8">
              <div className="text-right">
                <span className="text-cream/70 text-sm uppercase tracking-wider">
                  Complete Your Look
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-cream mt-2 mb-4">
                  Jewelry & Accessories
                </h3>
                <Button asChild className="bg-cream text-charcoal hover:bg-cream/90">
                  <Link to="/products?category=accessories">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
