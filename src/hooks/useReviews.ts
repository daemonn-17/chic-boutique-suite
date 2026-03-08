import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null } | null;
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_user_id_fkey(full_name)')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback without join if FK doesn't exist
        const { data: fallback, error: err2 } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        if (err2) throw err2;
        return (fallback || []).map(r => ({ ...r, profiles: null })) as DbReview[];
      }
      return (data || []) as DbReview[];
    },
    enabled: !!productId,
  });
}

export function useUserReview(productId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['user-review', productId, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!productId && !!userId,
  });
}

export function useHasPurchased(productId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['has-purchased', productId, userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id, status)')
        .eq('product_id', productId)
        .eq('orders.user_id', userId)
        .in('orders.status', ['paid', 'packed', 'shipped', 'delivered'])
        .limit(1);
      if (error) return false;
      return (data?.length || 0) > 0;
    },
    enabled: !!productId && !!userId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { productId: string; userId: string; rating: number; comment: string; orderId?: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: params.productId,
          user_id: params.userId,
          rating: params.rating,
          comment: params.comment,
          order_id: params.orderId || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', vars.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', ] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { reviewId: string; rating: number; comment: string; productId: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({ rating: params.rating, comment: params.comment })
        .eq('id', params.reviewId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', vars.productId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { reviewId: string; productId: string }) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', params.reviewId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', vars.productId] });
    },
  });
}
