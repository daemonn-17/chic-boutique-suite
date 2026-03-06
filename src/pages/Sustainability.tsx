import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Leaf, Droplets, Recycle, Heart } from 'lucide-react';

export default function Sustainability() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Sustainability' }]}>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Sustainability</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fashion that cares — for the planet, for artisans, and for you.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Leaf, title: 'Natural Fabrics', desc: 'We prioritize cotton, silk, linen, and other natural fibers that are biodegradable and gentle on the environment.' },
            { icon: Droplets, title: 'Eco-Friendly Dyes', desc: 'Our artisans use natural and AZO-free dyes, reducing water pollution and ensuring safety for both makers and wearers.' },
            { icon: Recycle, title: 'Minimal Packaging', desc: 'We use recycled cardboard boxes, reusable cloth pouches, and zero single-use plastic in our packaging.' },
            { icon: Heart, title: 'Slow Fashion', desc: 'We champion quality over quantity — timeless pieces made to last, not trends made to discard.' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-xl bg-card border">
              <item.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6 text-muted-foreground">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Our Pledge</h2>
          <p className="leading-relaxed">By 2026, we aim to achieve 100% sustainable sourcing across all our collections. We're investing in carbon-neutral logistics, water recycling at artisan workshops, and education programs for sustainable farming of natural fibers.</p>
          <p className="leading-relaxed">Every purchase at Vastra contributes to our Artisan Welfare Fund, which supports healthcare, education, and infrastructure for artisan communities across India.</p>
        </div>
      </section>
    </InfoPageLayout>
  );
}
