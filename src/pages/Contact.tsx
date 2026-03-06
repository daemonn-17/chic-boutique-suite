import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

export default function Contact() {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };
    if (!trimmed.name || !trimmed.email || !trimmed.subject || !trimmed.message) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed.email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert(trimmed);
      if (error) throw error;
      toast({ title: 'Message sent!', description: "We'll get back to you within 24 hours." });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: 'Visit Us', details: ['123 Fashion Street, Linking Road', 'Mumbai, Maharashtra 400050'] },
    { icon: Phone, title: 'Call Us', details: ['+91 98765 43210', 'Mon–Sat, 10 AM – 7 PM'] },
    { icon: Mail, title: 'Email Us', details: ['hello@vastra.in', 'support@vastra.in'] },
    { icon: Clock, title: 'Store Hours', details: ['Mon–Sat: 10 AM – 8 PM', 'Sunday: 11 AM – 6 PM'] },
  ];

  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Contact Us' }]}>
      <SEO title="Contact Us | Vastra Boutique" description="Get in touch with Vastra Boutique. Reach us for questions about our handcrafted Indian collections, orders, or collaborations." />
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Get in Touch</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have a question about our collections, need styling advice, or want to collaborate — our team is here to help.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((item) => (
            <Card key={item.title} className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
                {item.details.map((d, i) => (
                  <p key={i} className="text-muted-foreground text-sm">{d}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              </div>
              <Input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
              <Textarea name="message" placeholder="Your message..." rows={6} value={form.message} onChange={handleChange} required />
              <Button type="submit" disabled={sending} className="w-full sm:w-auto px-8">
                {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
          <div className="rounded-xl overflow-hidden h-[400px] bg-muted flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.1!2d72.83!3d19.06!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzM2LjAiTiA3MsKwNDknNDguMCJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Vastra Boutique location"
            />
          </div>
        </div>
      </section>
    </InfoPageLayout>
  );
}
