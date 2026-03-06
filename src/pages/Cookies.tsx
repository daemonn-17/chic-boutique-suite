import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { SEO } from '@/components/SEO';

export default function Cookies() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Cookie Policy' }]}>
      <SEO title="Cookie Policy | Vastra Boutique" description="Understand how Vastra Boutique uses cookies to enhance your browsing experience." />
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: March 1, 2024</p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-3xl mx-auto prose prose-sm text-muted-foreground">
        <h2 className="font-serif text-xl font-semibold text-foreground">What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better browsing experience by remembering your preferences and understanding how you use our site.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">Types of Cookies We Use</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="border-b">
              <th className="text-left py-3 pr-4 font-semibold text-foreground">Type</th>
              <th className="text-left py-3 pr-4 font-semibold text-foreground">Purpose</th>
              <th className="text-left py-3 font-semibold text-foreground">Duration</th>
            </tr></thead>
            <tbody>
              <tr className="border-b"><td className="py-3 pr-4 font-medium text-foreground">Essential</td><td className="py-3 pr-4">Login, cart, security</td><td className="py-3">Session</td></tr>
              <tr className="border-b"><td className="py-3 pr-4 font-medium text-foreground">Functional</td><td className="py-3 pr-4">Preferences, language</td><td className="py-3">1 year</td></tr>
              <tr className="border-b"><td className="py-3 pr-4 font-medium text-foreground">Analytics</td><td className="py-3 pr-4">Site usage & performance</td><td className="py-3">2 years</td></tr>
              <tr className="border-b"><td className="py-3 pr-4 font-medium text-foreground">Marketing</td><td className="py-3 pr-4">Personalized ads</td><td className="py-3">90 days</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="font-serif text-xl font-semibold text-foreground">Managing Cookies</h2>
        <p>You can manage or disable cookies through your browser settings. Note that disabling essential cookies may affect site functionality.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">Contact</h2>
        <p>Questions about our cookie practices? Email <a href="mailto:privacy@vastra.in" className="text-primary underline">privacy@vastra.in</a>.</p>
      </section>
    </InfoPageLayout>
  );
}
