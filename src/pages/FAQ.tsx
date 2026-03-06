import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      { q: "How long does delivery take?", a: "Standard delivery takes 5–7 business days across India. Express delivery is available in select cities within 2–3 business days. You\u2019ll receive a tracking link once your order ships." },
      { q: "Do you ship internationally?", a: "Currently, we ship across India only. We\u2019re working on expanding internationally — subscribe to our newsletter for updates!" },
      { q: "Can I track my order?", a: "Yes! Once your order is dispatched, you\u2019ll receive a tracking number via email and SMS. You can also track it from your account under My Orders." },
      { q: "What are the shipping charges?", a: "We offer free standard shipping on orders above \u20B91,999. For orders below that, a flat fee of \u20B999 applies. Express delivery is \u20B9199 regardless of order value." },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for unworn items with original tags intact. Customized and sale items are non-returnable." },
      { q: "How do I initiate a return?", a: 'Go to "My Orders" in your account, select the order, and click "Request Return". Our team will arrange a pickup within 2 business days.' },
      { q: "When will I receive my refund?", a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method." },
      { q: "Can I exchange for a different size?", a: "Yes! Exchanges are free and subject to availability. You can request an exchange from your order page." },
    ],
  },
  {
    category: "Products & Care",
    questions: [
      { q: "Are your products handmade?", a: "Many of our pieces are handcrafted by skilled artisans across India. Each product page mentions the craft technique and origin." },
      { q: "How should I care for silk garments?", a: "We recommend dry cleaning for pure silk. For blended silks, gentle hand wash in cold water with mild detergent. Always air dry in shade." },
      { q: "Do you offer customization?", a: 'Yes, we offer customization on select products including blouse stitching, length alterations, and embroidery additions. Look for the "Customize" badge on product pages.' },
    ],
  },
  {
    category: "Account & Payments",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay. Cash on Delivery is available on select orders." },
      { q: "Is my payment information secure?", a: "Absolutely. All payments are processed through Razorpay\u2019s PCI-DSS compliant gateway. We never store your card details." },
      { q: "How do I reset my password?", a: "Click Forgot Password on the login page. You\u2019ll receive a reset link via email within minutes." },
    ],
  },
];

export default function FAQ() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'FAQs' }]}>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions about our products, orders, and services.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-3xl mx-auto">
        {faqs.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">{section.category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {section.questions.map((faq, i) => (
                <AccordionItem key={i} value={`${section.category}-${i}`} className="bg-card rounded-lg border px-4">
                  <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </InfoPageLayout>
  );
}
