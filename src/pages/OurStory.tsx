import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function OurStory() {
  return (
    <InfoPageLayout>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Our Story</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A journey from a small studio to India's beloved boutique destination.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-3xl mx-auto">
        <div className="space-y-12 text-muted-foreground">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">The Beginning</h2>
            <p className="leading-relaxed">
              It all started with a single Banarasi saree. In 2020, during a trip to Varanasi, our founder discovered the 
              incredible artistry of master weavers whose families had been creating textiles for generations. The intricate 
              patterns, the rich colors, the stories woven into every thread — it was love at first sight.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Building Bridges</h2>
            <p className="leading-relaxed">
              What began as a passion project quickly grew into a mission. We traveled across India — from the silk looms 
              of Kanchipuram to the block-printing workshops of Jaipur, from the chikankari studios of Lucknow to the 
              ikat clusters of Pochampally. Each journey deepened our commitment to preserving these dying arts.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Today</h2>
            <p className="leading-relaxed">
              Vastra Boutique is now home to over 2,000 curated pieces from 500+ artisan partners across 15 states. 
              We've served over 50,000 happy customers, and every purchase directly supports the artisan communities 
              we work with. But we're just getting started — our vision is to make every Indian textile tradition 
              accessible, appreciated, and celebrated worldwide.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-card border text-center">
            <blockquote className="font-serif text-xl italic text-foreground">
              "Every thread carries a tradition. Every garment tells a story. We're just the storytellers."
            </blockquote>
            <p className="mt-4 text-sm">— Founder, Vastra Boutique</p>
          </div>
        </div>
      </section>
    </InfoPageLayout>
  );
}
