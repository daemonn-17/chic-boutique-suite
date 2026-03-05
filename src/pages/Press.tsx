import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Card, CardContent } from '@/components/ui/card';

const pressItems = [
  { outlet: 'Vogue India', date: 'January 2024', title: '"Vastra Boutique: Reviving India\'s Handloom Heritage for the Modern Woman"' },
  { outlet: 'Elle India', date: 'November 2023', title: '"10 Homegrown Brands Redefining Indian Fashion"' },
  { outlet: 'The Economic Times', date: 'September 2023', title: '"How Vastra is Empowering 500+ Artisan Families Across India"' },
  { outlet: 'Harper\'s Bazaar India', date: 'July 2023', title: '"The New Wave of Conscious Luxury in Indian Fashion"' },
  { outlet: 'Forbes India', date: 'May 2023', title: '"30 Under 30: Fashion Entrepreneurs Making a Difference"' },
];

export default function Press() {
  return (
    <InfoPageLayout>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Press & Media</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vastra Boutique in the news — featured by leading publications.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-3xl mx-auto">
        <div className="space-y-4">
          {pressItems.map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-serif font-semibold text-primary">{item.outlet}</span>
                  <span className="text-xs text-muted-foreground">• {item.date}</span>
                </div>
                <p className="text-foreground font-medium">{item.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border text-center">
          <h3 className="font-serif text-lg font-semibold mb-2">Media Inquiries</h3>
          <p className="text-muted-foreground text-sm">For press kits, interviews, and collaboration requests, reach out to <a href="mailto:press@vastra.in" className="text-primary underline">press@vastra.in</a></p>
        </div>
      </section>
    </InfoPageLayout>
  );
}
