import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_text: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  comment: string;
  avatar_url: string | null;
  product_name: string | null;
  is_active: boolean;
}

export function useHeroBanners() {
  return useQuery({
    queryKey: ['hero-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as HeroBanner[];
    },
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Testimonial[];
    },
  });
}
