import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_snapshot: {
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  size: string | null;
  color: string | null;
  unit_price: number;
}

export interface AddressSnapshot {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  address_snapshot: AddressSnapshot;
  delivery_type: 'standard' | 'express';
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  coupon_code: string | null;
  total: number;
  status: 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export function useOrders() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Order[];
    },
    enabled: !!user,
  });
}

export function useOrder(orderId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as unknown as Order;
    },
    enabled: !!user && !!orderId,
  });
}
