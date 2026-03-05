import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function Terms() {
  return (
    <InfoPageLayout>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 1, 2024</p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-3xl mx-auto prose prose-sm text-muted-foreground">
        <h2 className="font-serif text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing and using Vastra Boutique's website, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">2. Products & Pricing</h2>
        <p>All product images are representative. Due to the handcrafted nature of our products, slight variations in color, pattern, and texture are natural and expected. Prices are in Indian Rupees (₹) and inclusive of GST unless stated otherwise.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">3. Orders & Payment</h2>
        <p>An order is confirmed only after successful payment. We reserve the right to cancel orders due to stock unavailability, pricing errors, or suspected fraud. Refunds for cancelled orders are processed within 5–7 business days.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">4. Shipping & Delivery</h2>
        <p>Delivery timelines are estimates and not guaranteed. Vastra is not liable for delays caused by courier partners, natural disasters, or other circumstances beyond our control.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">5. Returns & Refunds</h2>
        <p>Returns are accepted within 7 days of delivery subject to our <a href="/returns" className="text-primary underline">Returns Policy</a>. Customized items are non-returnable.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">6. Intellectual Property</h2>
        <p>All content on this website — images, text, logos, designs — is the property of Vastra Boutique and protected under Indian copyright laws. Unauthorized reproduction is prohibited.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
        <p>Vastra Boutique's total liability for any claim shall not exceed the amount paid for the product in question.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground">8. Governing Law</h2>
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
      </section>
    </InfoPageLayout>
  );
}
