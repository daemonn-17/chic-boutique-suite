import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTestimonials } from '@/hooks/useHomeContent';
import { Skeleton } from '@/components/ui/skeleton';

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useTestimonials();

  return (
    <section className="section-padding bg-cream">
      <div className="container-boutique">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm uppercase tracking-widest text-primary font-medium">Testimonials</span>
          <h2 className="heading-section mt-2 mb-4">What Our Customers Say</h2>
          <div className="divider-gold mx-auto" />
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-8 rounded-xl shadow-soft relative"
              >
                <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Quote className="h-4 w-4 text-primary-foreground" />
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                  ))}
                </div>

                <p className="text-foreground leading-relaxed mb-6">"{testimonial.comment}"</p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-serif font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>

                {testimonial.product_name && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Purchased: <span className="text-foreground">{testimonial.product_name}</span>
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
