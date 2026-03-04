import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Order = Tables<'orders'>;
type OrderItem = Tables<'order_items'>;
type Category = Tables<'categories'>;

// ─── Dashboard Analytics ───
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes, lowStockRes] = await Promise.all([
        supabase.from('products').select('id, price, stock_qty', { count: 'exact' }),
        supabase.from('orders').select('id, total, status, created_at'),
        supabase.from('products').select('id', { count: 'exact' }).lt('stock_qty', 10).eq('is_active', true),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled' && o.status !== 'pending')
        .reduce((sum, o) => sum + o.total, 0);

      const now = new Date();
      const thisMonth = orders.filter(o => {
        const d = new Date(o.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Monthly revenue for chart (last 6 months)
      const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthOrders = orders.filter(o => {
          const od = new Date(o.created_at);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
            && o.status !== 'cancelled' && o.status !== 'pending';
        });
        monthlyRevenue.push({
          month: d.toLocaleString('default', { month: 'short' }),
          revenue: monthOrders.reduce((s, o) => s + o.total, 0) / 100,
          orders: monthOrders.length,
        });
      }

      return {
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        totalRevenue,
        monthlyOrders: thisMonth.length,
        lowStockCount: lowStockRes.count || 0,
        statusCounts,
        monthlyRevenue,
      };
    },
  });
}

// ─── All Products (admin, includes inactive) ───
export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── All Orders (admin) ───
export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Order & { order_items: OrderItem[] })[];
    },
  });
}

// ─── Update Order Status ───
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: status as Order['status'], updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// ─── Update Product Stock ───
export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, stockQty }: { productId: string; stockQty: number }) => {
      const { error } = await supabase
        .from('products')
        .update({ stock_qty: stockQty, updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// ─── Toggle Product Active ───
export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

// ─── Create Product ───
export interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discount_price: number | null;
  stock_qty: number;
  category_id: string | null;
  colors: string[];
  sizes: string[];
  material: string;
  pattern: string;
  brand: string;
  tags: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          description: data.description || null,
          price: data.price,
          discount_price: data.discount_price,
          stock_qty: data.stock_qty,
          category_id: data.category_id,
          colors: data.colors,
          sizes: data.sizes,
          material: data.material || null,
          pattern: data.pattern || null,
          brand: data.brand || null,
          tags: data.tags,
          is_featured: data.is_featured,
          is_new_arrival: data.is_new_arrival,
          is_active: data.is_active,
        })
        .select('id')
        .single();
      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// ─── Update Product ───
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const { error } = await supabase
        .from('products')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// ─── Delete Product ───
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// ─── Upload Product Image ───
export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, file, isPrimary = false, displayOrder = 0 }: {
      productId: string; file: File; isPrimary?: boolean; displayOrder?: number;
    }) => {
      const ext = file.name.split('.').pop();
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from('product_images').insert({
        product_id: productId,
        url: publicUrl,
        public_id: path,
        is_primary: isPrimary,
        display_order: displayOrder,
      });
      if (dbError) throw dbError;
      return publicUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

// ─── Delete Product Image ───
export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ imageId, publicId }: { imageId: string; publicId: string | null }) => {
      if (publicId) {
        await supabase.storage.from('product-images').remove([publicId]);
      }
      const { error } = await supabase.from('product_images').delete().eq('id', imageId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

// ─── Categories (for form dropdown) ───
export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
}

// ─── Inventory (low stock focus) ───
export function useInventory() {
  return useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, stock_qty, price, discount_price, is_active, product_images(url, is_primary)')
        .eq('is_active', true)
        .order('stock_qty', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
