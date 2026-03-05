import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Card, CardContent } from '@/components/ui/card';

const crafts = [
  { name: 'Banarasi Weaving', location: 'Varanasi, Uttar Pradesh', desc: 'Gold and silver brocade weaving on silk, a tradition over 600 years old.' },
  { name: 'Kanchipuram Silk', location: 'Tamil Nadu', desc: 'Lustrous silk sarees with temple borders and contrasting pallus, woven with pure mulberry silk.' },
  { name: 'Chikankari', location: 'Lucknow, Uttar Pradesh', desc: 'Delicate hand embroidery on muslin and cotton, featuring floral patterns in white thread work.' },
  { name: 'Block Printing', location: 'Jaipur, Rajasthan', desc: 'Hand-carved wooden blocks dipped in natural dyes create stunning repeat patterns on fabric.' },
  { name: 'Ikat Weaving', location: 'Pochampally, Telangana', desc: 'Resist-dyeing technique where yarn is dyed before weaving to create geometric patterns.' },
  { name: 'Zardozi Embroidery', location: 'Lucknow & Bhopal', desc: 'Lavish metallic threadwork using gold and silver wire, beads, and precious stones.' },
];

export default function Artisans() {
  return (
    <InfoPageLayout>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Our Artisan Partners</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Behind every Vastra piece is a skilled artisan preserving centuries-old craft traditions.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding">
        <div className="max-w-3xl mx-auto mb-12 text-center text-muted-foreground">
          <p className="text-lg leading-relaxed">
            We partner with over 500 artisan families across 15 states, ensuring fair wages, sustainable practices, 
            and the preservation of India's textile heritage for future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {crafts.map((craft) => (
            <Card key={craft.name}>
              <CardContent className="pt-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{craft.name}</h3>
                <p className="text-xs text-primary font-medium mb-3">{craft.location}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{craft.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-semibold mb-4">Our Commitment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div className="p-4 rounded-xl bg-muted/50"><p className="font-semibold text-foreground mb-1">Fair Wages</p><p>20–30% above market rates for all artisan partners</p></div>
            <div className="p-4 rounded-xl bg-muted/50"><p className="font-semibold text-foreground mb-1">Skill Training</p><p>Annual workshops for next-gen artisans and their families</p></div>
            <div className="p-4 rounded-xl bg-muted/50"><p className="font-semibold text-foreground mb-1">Healthcare</p><p>Medical insurance coverage for 200+ artisan families</p></div>
          </div>
        </div>
      </section>
    </InfoPageLayout>
  );
}
