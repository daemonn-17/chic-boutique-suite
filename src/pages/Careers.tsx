import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const openings = [
  { title: 'Senior Fashion Designer', location: 'Mumbai', type: 'Full-time', desc: 'Lead our design team in creating contemporary Indian wear collections.' },
  { title: 'Digital Marketing Manager', location: 'Mumbai', type: 'Full-time', desc: 'Drive brand growth through social media, SEO, and performance marketing.' },
  { title: 'Artisan Relations Coordinator', location: 'Jaipur', type: 'Full-time', desc: 'Build and manage relationships with artisan clusters across Rajasthan.' },
  { title: 'Content Writer', location: 'Remote', type: 'Part-time', desc: 'Create compelling stories about our products, artisans, and craft traditions.' },
];

export default function Careers() {
  return (
    <InfoPageLayout breadcrumbs={[{ label: 'Careers' }]}>
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-boutique text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Careers at Vastra</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our team and help preserve India's textile heritage while building a modern fashion brand.
          </p>
        </div>
      </section>

      <section className="container-boutique section-padding max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-2xl font-semibold mb-3">Why Work With Us?</h2>
          <p className="text-muted-foreground">We're a passionate, purpose-driven team that values creativity, impact, and work-life balance.</p>
        </div>

        <div className="space-y-4">
          {openings.map((job) => (
            <Card key={job.title}>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.type}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">{job.desc}</p>
                </div>
                <Button variant="outline" className="shrink-0" onClick={() => window.location.href = 'mailto:careers@vastra.in?subject=' + encodeURIComponent(job.title)}>
                  Apply
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Don't see your role? Send your resume to <a href="mailto:careers@vastra.in" className="text-primary underline">careers@vastra.in</a></p>
        </div>
      </section>
    </InfoPageLayout>
  );
}
