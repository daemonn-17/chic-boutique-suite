import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Heart, Award, Users, Sparkles } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function About() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'About Us' }]}>
      <SEO title="About Us | Vastra Boutique" description="Discover Vastra Boutique — celebrating India's finest textile heritage with 500+ artisan partners across 15 states." />
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">About Vastra Boutique</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Where tradition meets contemporary elegance — celebrating India's finest textile heritage.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-4xl mx-auto">
        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
          <p className="text-lg leading-relaxed">
            Founded in 2020, Vastra Boutique was born from a deep love for Indian craftsmanship and a vision to make 
            exquisite handcrafted textiles accessible to the modern woman. We curate collections that honor age-old 
            weaving traditions while embracing contemporary silhouettes and styling.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
            {[
              { icon: Heart, label: 'Handcrafted with Love', value: 'Every piece curated for quality' },
              { icon: Award, label: '500+ Artisan Partners', value: 'Across 15 Indian states' },
              { icon: Users, label: '50,000+ Customers', value: 'Trusted by women nationwide' },
              { icon: Sparkles, label: '100% Authentic', value: 'Genuine handloom & handwork' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-xl bg-card border">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-serif font-semibold text-foreground">{stat.label}</p>
                <p className="text-sm mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <h2 className="font-serif text-2xl font-semibold text-foreground">Our Mission</h2>
          <p>
            We believe that every woman deserves to wear art. Our mission is to bridge the gap between India's 
            incredible textile artisans and conscious consumers who value authenticity, quality, and sustainability.
          </p>

          <h2 className="font-serif text-2xl font-semibold text-foreground">Our Values</h2>
          <ul className="space-y-3">
            <li><strong className="text-foreground">Authenticity:</strong> We source directly from artisan clusters, ensuring every piece tells a genuine story of craftsmanship.</li>
            <li><strong className="text-foreground">Sustainability:</strong> We champion slow fashion, using natural fabrics, eco-friendly dyes, and minimal packaging.</li>
            <li><strong className="text-foreground">Fair Trade:</strong> Our artisan partners receive fair wages and we invest in their communities through skill development programs.</li>
            <li><strong className="text-foreground">Quality:</strong> Every garment goes through rigorous quality checks before reaching you.</li>
          </ul>
        </div>
      </section>
    </InfoPageLayout>
  );
}
