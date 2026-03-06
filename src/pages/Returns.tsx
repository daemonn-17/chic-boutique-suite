import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { RotateCcw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function Returns() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Returns & Exchange' }]}>
      <SEO title="Returns & Exchanges | Vastra Boutique" description="Hassle-free returns within 7 days. Learn about our return eligibility, exchange policy, and refund process." />
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Returns & Exchanges</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your satisfaction is our priority. Hassle-free returns within 7 days.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-4xl mx-auto">
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { step: '1', title: 'Request Return', desc: 'Log in, go to My Orders, and select "Request Return" on the item.' },
            { step: '2', title: 'Pickup Arranged', desc: 'Our courier partner will pick up the item within 2 business days.' },
            { step: '3', title: 'Refund Processed', desc: 'Refund credited to your original payment method in 5–7 business days.' },
          ].map((item) => (
            <div key={item.step} className="text-center p-6 rounded-xl bg-card border">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-semibold">{item.step}</div>
              <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" /> Eligible for Return
            </h2>
            <ul className="space-y-3 text-muted-foreground text-sm">
              {['Unworn items with original tags', 'Items returned within 7 days of delivery', 'Wrong size or color received', 'Defective or damaged products', 'Items not matching the description'].map((item) => (
                <li key={item} className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-success shrink-0 mt-0.5" />{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" /> Not Eligible
            </h2>
            <ul className="space-y-3 text-muted-foreground text-sm">
              {['Customized or altered items', 'Items on final sale', 'Intimate wear and accessories', 'Items without original tags/packaging', 'Items returned after 7 days'].map((item) => (
                <li key={item} className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-destructive shrink-0 mt-0.5" />{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-muted/50 border">
          <h3 className="font-serif text-lg font-semibold mb-2 flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" /> Exchange Policy
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Exchanges are free and subject to stock availability. If your preferred size or color is unavailable, 
            we'll issue a full refund. Exchanged items are shipped within 3–5 business days after receiving the original item.
          </p>
        </div>
      </section>
    </InfoPageLayout>
  );
}
