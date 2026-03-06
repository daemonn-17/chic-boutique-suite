import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';

const sizeData = {
  sarees: { note: 'Standard saree length is 5.5 meters with a 0.8-meter blouse piece.', sizes: [] as any[] },
  kurtis: {
    sizes: [
      { size: 'XS', bust: '32', waist: '26', hip: '34', length: '36' },
      { size: 'S', bust: '34', waist: '28', hip: '36', length: '37' },
      { size: 'M', bust: '36', waist: '30', hip: '38', length: '38' },
      { size: 'L', bust: '38', waist: '32', hip: '40', length: '39' },
      { size: 'XL', bust: '40', waist: '34', hip: '42', length: '40' },
      { size: 'XXL', bust: '42', waist: '36', hip: '44', length: '41' },
    ],
  },
  lehengas: {
    sizes: [
      { size: 'S', waist: '26–28', hip: '34–36', length: '40' },
      { size: 'M', waist: '28–30', hip: '36–38', length: '41' },
      { size: 'L', waist: '30–32', hip: '38–40', length: '42' },
      { size: 'XL', waist: '32–34', hip: '40–42', length: '43' },
      { size: 'XXL', waist: '34–36', hip: '42–44', length: '44' },
    ],
  },
};

export default function SizeGuide() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Size Guide' }]}>
      <SEO title="Size Guide | Vastra Boutique" description="Find your perfect fit with our detailed size charts for kurtis, lehengas, and sarees. All measurements in inches." />
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Size Guide</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find your perfect fit. All measurements are in inches.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-4xl mx-auto">
        <Tabs defaultValue="kurtis">
          <TabsList className="mb-8">
            <TabsTrigger value="kurtis">Kurtis & Dresses</TabsTrigger>
            <TabsTrigger value="lehengas">Lehengas</TabsTrigger>
            <TabsTrigger value="sarees">Sarees</TabsTrigger>
          </TabsList>

          <TabsContent value="kurtis">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b">
                  {['Size', 'Bust', 'Waist', 'Hip', 'Length'].map(h => <th key={h} className="text-left py-3 pr-6 font-semibold text-foreground">{h}</th>)}
                </tr></thead>
                <tbody className="text-muted-foreground">
                  {sizeData.kurtis.sizes.map(s => (
                    <tr key={s.size} className="border-b"><td className="py-3 pr-6 font-medium text-foreground">{s.size}</td><td className="py-3 pr-6">{s.bust}"</td><td className="py-3 pr-6">{s.waist}"</td><td className="py-3 pr-6">{s.hip}"</td><td className="py-3">{s.length}"</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="lehengas">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b">
                  {['Size', 'Waist', 'Hip', 'Length'].map(h => <th key={h} className="text-left py-3 pr-6 font-semibold text-foreground">{h}</th>)}
                </tr></thead>
                <tbody className="text-muted-foreground">
                  {sizeData.lehengas.sizes.map(s => (
                    <tr key={s.size} className="border-b"><td className="py-3 pr-6 font-medium text-foreground">{s.size}</td><td className="py-3 pr-6">{s.waist}"</td><td className="py-3 pr-6">{s.hip}"</td><td className="py-3">{s.length}"</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="sarees">
            <div className="p-6 rounded-xl bg-muted/50 border">
              <p className="text-muted-foreground leading-relaxed">
                Standard saree length is <strong className="text-foreground">5.5 meters</strong> (6 yards) with a <strong className="text-foreground">0.8-meter blouse piece</strong>. 
                Sarees are unstitched and can be draped to fit all body types. For blouse stitching, we offer customization — 
                simply provide your measurements during checkout or <a href="/contact" className="text-primary underline">contact us</a>.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 p-6 rounded-xl bg-card border">
          <h3 className="font-serif text-lg font-semibold mb-3">How to Measure</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li><strong className="text-foreground">Bust:</strong> Measure around the fullest part of your chest.</li>
            <li><strong className="text-foreground">Waist:</strong> Measure at the narrowest point of your natural waistline.</li>
            <li><strong className="text-foreground">Hip:</strong> Measure around the fullest part of your hips.</li>
            <li><strong className="text-foreground">Length:</strong> Measure from shoulder to desired hemline.</li>
          </ul>
        </div>
      </section>
    </InfoPageLayout>
  );
}
