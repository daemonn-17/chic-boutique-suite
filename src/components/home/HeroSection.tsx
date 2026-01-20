import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero-gradient">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl" />

      <div className="container-boutique relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">New Collection 2024</span>
            </motion.div>

            <h1 className="heading-display mb-6">
              Embrace the Art of{' '}
              <span className="text-gradient-gold block mt-2">Timeless Elegance</span>
            </h1>

            <p className="text-body text-lg max-w-lg mx-auto lg:mx-0 mb-8">
              Discover exquisite handcrafted ethnic wear that celebrates India's rich heritage. 
              Each piece is a masterpiece of tradition woven with contemporary elegance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild className="btn-hero group">
                <Link to="/products">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="btn-hero-outline">
                <Link to="/products?filter=new">New Arrivals</Link>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-border"
            >
              <div className="text-center lg:text-left">
                <p className="font-serif text-3xl font-semibold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-serif text-3xl font-semibold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Unique Designs</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-serif text-3xl font-semibold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Artisan Partners</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-medium">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop"
                  alt="Featured Collection"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 overlay-gradient" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-cream/80 text-sm uppercase tracking-wider mb-2">Featured</p>
                  <h3 className="font-serif text-2xl text-cream">Bridal Collection</h3>
                </div>
              </div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-8 bottom-32 bg-card p-4 rounded-xl shadow-medium z-20"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80&h=80&fit=crop"
                    alt="Product"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">Banarasi Silk</p>
                    <p className="text-primary font-semibold">₹19,999</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Circle */}
              <div className="absolute -top-8 -right-8 w-32 h-32 border-4 border-gold/30 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
