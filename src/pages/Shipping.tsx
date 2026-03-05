import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Truck, Clock, MapPin, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Shipping() {
  return (
    <InfoPageLayout>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Shipping Information</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We ensure your beautiful garments reach you safely and on time.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Truck, title: 'Standard Delivery', desc: '5–7 business days • Free above ₹1,999 • ₹99 flat rate' },
            { icon: Clock, title: 'Express Delivery', desc: '2–3 business days • ₹199 flat rate • Select cities only' },
            { icon: MapPin, title: 'Pan-India Coverage', desc: 'We deliver to 25,000+ pin codes across India' },
            { icon: Shield, title: 'Secure Packaging', desc: 'Each garment is carefully folded, tissue-wrapped, and boxed' },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="prose prose-sm max-w-none space-y-6">
          <h2 className="font-serif text-2xl font-semibold">Shipping Policy Details</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>All orders are processed within 1–2 business days. Orders placed after 3 PM IST will be processed the next business day.</p>
            <p>Once dispatched, you'll receive a tracking number via email and SMS. Track your order anytime from your account dashboard.</p>
            <h3 className="font-serif text-lg font-semibold text-foreground mt-8">Delivery Estimates by Region</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-semibold text-foreground">Region</th>
                    <th className="text-left py-3 pr-4 font-semibold text-foreground">Standard</th>
                    <th className="text-left py-3 font-semibold text-foreground">Express</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b"><td className="py-3 pr-4">Metro Cities</td><td className="py-3 pr-4">3–5 days</td><td className="py-3">1–2 days</td></tr>
                  <tr className="border-b"><td className="py-3 pr-4">Tier 2 Cities</td><td className="py-3 pr-4">5–7 days</td><td className="py-3">2–3 days</td></tr>
                  <tr className="border-b"><td className="py-3 pr-4">Remote Areas</td><td className="py-3 pr-4">7–10 days</td><td className="py-3">Not available</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-6">For bulk orders or special delivery requests, please <a href="/contact" className="text-primary underline">contact us</a>.</p>
          </div>
        </div>
      </section>
    </InfoPageLayout>
  );
}
