import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { SEO } from '@/components/SEO';

export default function Privacy() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Privacy Policy' }]}>
      <SEO title="Privacy Policy | Vastra Boutique" description="Learn how Vastra Boutique collects, uses, and protects your personal information." />
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 1, 2024</p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-3xl mx-auto prose prose-sm text-muted-foreground">
        <h2 className="font-serif text-xl font-semibold text-foreground">1. Information We Collect</h2>
        <p>We collect personal information you provide when creating an account, placing orders, or contacting us. This includes your name, email, phone number, shipping address, and payment details.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
        <ul className="space-y-1">
          <li>To process and deliver your orders</li>
          <li>To communicate about your orders and account</li>
          <li>To personalize your shopping experience</li>
          <li>To send promotional offers (with your consent)</li>
          <li>To improve our website and services</li>
        </ul>

        <h2 className="font-serif text-xl font-semibold text-foreground">3. Information Sharing</h2>
        <p>We do not sell your personal data. We share information only with service providers who assist in order fulfillment, payment processing, and delivery — all bound by confidentiality agreements.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">4. Data Security</h2>
        <p>We implement industry-standard encryption and security measures to protect your personal information. Payment data is processed through PCI-DSS compliant payment gateways.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">5. Your Rights</h2>
        <p>You may access, update, or delete your personal data at any time through your account settings or by contacting us at <a href="mailto:privacy@vastra.in" className="text-primary underline">privacy@vastra.in</a>.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">6. Cookies</h2>
        <p>We use cookies to enhance your browsing experience and analyze site traffic. See our <a href="/cookies" className="text-primary underline">Cookie Policy</a> for details.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">7. Contact</h2>
        <p>For privacy-related queries, email <a href="mailto:privacy@vastra.in" className="text-primary underline">privacy@vastra.in</a>.</p>
      </section>
    </InfoPageLayout>
  );
}
