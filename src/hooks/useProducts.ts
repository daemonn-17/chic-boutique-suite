import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  url: string;
  public_id: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock_qty: number;
  sku: string;
  category_id: string | null;
  colors: string[];
  sizes: string[];
  material: string | null;
  pattern: string | null;
  brand: string | null;
  tags: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  popularity_count: number;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  product_images: DbProductImage[];
  categories: DbCategory | null;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  discountOnly?: boolean;
  search?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

// Fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}

// Fetch products with filters
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (*)
        `)
        .eq('is_active', true);
      
      // Apply filters
      if (filters.category) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }
      
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      
      if (filters.discountOnly) {
        query = query.not('discount_price', 'is', null);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
      }
      
      // Sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('popularity_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      // Pagination
      const limit = filters.limit || 12;
      const page = filters.page || 1;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        products: data as DbProduct[],
        total: count || 0,
        page,
        limit,
      };
    },
  });
}

// Fetch single product by slug
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as DbProduct;
    },
    enabled: !!slug,
  });
}

// Fetch featured products
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('popularity_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });
}

// Fetch new arrivals
export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: ['new-arrivals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (*)
        `)
        .eq('is_active', true)
        .eq('is_new_arrival', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });
}

// Fetch trending/popular products
export function useTrendingProducts(limit = 8) {
  return useQuery({
    queryKey: ['trending-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (*)
        `)
        .eq('is_active', true)
        .order('popularity_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });
}

// Fetch similar products
export function useSimilarProducts(categoryId: string | null, currentProductId: string, limit = 4) {
  return useQuery({
    queryKey: ['similar-products', categoryId, currentProductId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (*)
        `)
        .eq('is_active', true)
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .order('popularity_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as DbProduct[];
    },
    enabled: !!categoryId,
  });
}

// Format price from paise to rupees
export function formatPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

// Calculate discount percentage
export function getDiscountPercent(price: number, discountPrice: number | null): number {
  if (!discountPrice) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

// Get primary image
export function getPrimaryImage(images: DbProductImage[]): string {
  const primary = images.find(img => img.is_primary);
  return primary?.url || images[0]?.url || '/placeholder.svg';
}
