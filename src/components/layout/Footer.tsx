import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/products?filter=new' },
    { name: 'Best Sellers', href: '/products?filter=bestseller' },
    { name: 'Sale', href: '/products?filter=sale' },
    { name: 'Sarees', href: '/products?category=sarees' },
    { name: 'Lehengas', href: '/products?category=lehengas' },
    { name: 'Kurtis', href: '/products?category=kurtis' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns & Exchange', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Track Order', href: '/track-order' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/our-story' },
    { name: 'Artisan Partners', href: '/artisans' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setSubscribing(true);
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: trimmed });
      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already subscribed', description: "You're already part of our community!" });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Subscribed!', description: 'Welcome to the Vastra community.' });
        setEmail('');
      }
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-charcoal text-cream">
      {/* Newsletter Section */}
      <div className="border-b border-cream/10">
        <div className="container-boutique section-padding">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl md:text-3xl mb-2">Join Our Community</h3>
              <p className="text-cream/70">
                Subscribe for exclusive offers, new arrivals & styling tips
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/50 min-w-[250px]"
                required
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="bg-gold hover:bg-gold-dark text-charcoal font-semibold px-8"
              >
                {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-boutique section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-serif text-3xl font-semibold">Vastra</span>
              <span className="font-serif text-xl text-cream/70 ml-2">Boutique</span>
            </Link>
            <p className="text-cream/70 mb-6 max-w-sm">
              Celebrating the rich heritage of Indian craftsmanship with contemporary elegance. 
              Each piece tells a story of tradition, artistry, and timeless beauty.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-all"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-cream/70 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-cream/70 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="text-cream/70">
                  123 Fashion Street, Linking Road,<br />
                  Mumbai, Maharashtra 400050
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <a href="tel:+919876543210" className="text-cream/70 hover:text-gold transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <a href="mailto:hello@vastra.in" className="text-cream/70 hover:text-gold transition-colors">
                  hello@vastra.in
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container-boutique py-6 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream/50">
            <p>© 2024 Vastra Boutique. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-cream transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-cream transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-cream transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
